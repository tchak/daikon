import { z } from 'zod';
import invariant from 'tiny-invariant';
import produce from 'immer';

import type {
  EventStore,
  ApplyEvent,
  AggregateRoot,
} from '~/util/aggregate-root';
import { createAggregate, withAggregate } from '~/util/aggregate-root';
import { Metadata, BucketEvent, BucketEventsMap, metadata } from '~/events';

const Field = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  type: z.string(),
  deletedAt: z.string().nullish(),
});
type Field = z.infer<typeof Field>;

const View = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['GRID']),
  hidden: z.record(z.string().uuid(), z.boolean()),
  deletedAt: z.string().nullish(),
});
type View = z.infer<typeof View>;

const Bucket = z.object({
  id: z.string().uuid(),
  version: z.number().int(),
  name: z.string(),
  color: z.string(),
  description: z.string().optional(),
  deletedAt: z.string().nullish(),
  fields: z.record(z.number().int(), Field.array()),
  views: View.array(),
});
type Bucket = z.infer<typeof Bucket>;

export function createCommand<Command>(
  aggregateId: (command: Command) => string,
  callback: (
    command: Command,
    aggregate: AggregateRoot<Bucket, BucketEventsMap, Metadata>
  ) => Promise<void> | void
) {
  return <Context>(
      eventStore: EventStore<Context, BucketEventsMap, Metadata>
    ) =>
    (command: Command, meta: Partial<Metadata>) =>
      withAggregate(
        eventStore,
        createAggregate('Bucket', applyEvent, {
          metadata: metadata(meta),
          aggregateId: aggregateId(command),
        }),
        (aggregate) => callback(command, aggregate)
      );
}

const applyEvent: ApplyEvent<Bucket, BucketEventsMap, Metadata> = (
  bucketEvent,
  bucket
) => {
  const event = BucketEvent.parse(bucketEvent);
  switch (event.eventType) {
    case 'BucketCreated':
      return {
        id: event.data.bucketId,
        version: 0,
        name: event.data.name,
        color: event.data.color,
        fields: { 0: [] },
        views: [],
      };
    case 'BucketRestored':
      invariant(bucket?.deletedAt, 'Bucket not found');
      return { ...bucket, deletedAt: null };
    case 'BucketDestroyed':
      invariant(bucket?.deletedAt, 'Bucket not found');
      return null;
    default:
      invariant(bucket && !bucket.deletedAt, 'Bucket not found');
      switch (event.eventType) {
        case 'BucketDeleted':
          return { ...bucket, deletedAt: event.metadata.timestamp };
        case 'BucketNameSet':
        case 'BucketDescriptionSet':
        case 'BucketColorSet':
          return { ...bucket, ...event.data };
        case 'BucketSchemaLocked':
          return produce(bucket, (bucket) => {
            const fields = bucket.fields[bucket.version];
            bucket.fields[bucket.version] = fields.filter(
              (field) => !field.deletedAt
            );
            bucket.version += 1;
            bucket.fields[bucket.version] = [...fields];
          });
        case 'ViewCreated':
          return produce(bucket, (draft) => {
            draft.views.push({
              id: event.data.viewId,
              name: event.data.name,
              type: event.data.type,
              hidden: {},
            });
          });
        case 'ViewNameSet':
          return produce(bucket, (bucket) => {
            const view = findView(bucket, event.data.viewId);
            view.name = event.data.name;
          });
        case 'ViewDescriptionSet':
          return produce(bucket, (bucket) => {
            const view = findView(bucket, event.data.viewId);
            view.description = event.data.description;
          });
        case 'ViewDeleted':
          return produce(bucket, (bucket) => {
            const view = findView(bucket, event.data.viewId);
            view.deletedAt = event.metadata.timestamp;
          });
        case 'ViewRestored':
          return produce(bucket, (bucket) => {
            const view = findView(bucket, event.data.viewId, true);
            view.deletedAt = null;
          });
        case 'ViewDestroyed':
          return produce(bucket, (bucket) => {
            bucket.views = bucket.views.filter(
              (view) => view.id != event.data.viewId
            );
          });
        case 'FieldCreated':
          return produce(bucket, (bucket) => {
            bucket.fields[bucket.version].push({
              id: event.data.fieldId,
              type: event.data.type,
              name: event.data.name,
            });
          });
        case 'FieldNameSet':
          return produce(bucket, (bucket) => {
            const field = findField(bucket, event.data.fieldId);
            field.name = event.data.name;
          });
        case 'FieldDescriptionSet':
          return produce(bucket, (bucket) => {
            const field = findField(bucket, event.data.fieldId);
            field.description = event.data.description;
          });
        case 'FieldDeleted':
          return produce(bucket, (bucket) => {
            const field = findField(bucket, event.data.fieldId);
            field.deletedAt = event.metadata.timestamp;
          });
        case 'FieldRestored':
          return produce(bucket, (bucket) => {
            const view = findField(bucket, event.data.fieldId, true);
            view.deletedAt = null;
          });
        case 'FieldDestroyed':
          return produce(bucket, (bucket) => {
            bucket.fields[bucket.version] = bucket.fields[
              bucket.version
            ].filter((field) => field.id != event.data.fieldId);
          });
        case 'FieldHiddenSet':
          return produce(bucket, (bucket) => {
            const view = findView(bucket, event.data.viewId);
            const field = findField(bucket, event.data.fieldId);
            view.hidden[field.id] = event.data.hidden;
          });
      }
  }
};

function findView(bucket: Bucket, id: string, deleted = false): View {
  const view = bucket.views.find((view) => view.id == id);
  if (deleted) {
    invariant(view?.deletedAt, 'View not found');
  } else {
    invariant(view && !view.deletedAt, 'View not found');
  }
  return view;
}

function findField(bucket: Bucket, id: string, deleted = false): Field {
  const field = bucket.fields[bucket.version].find((field) => field.id == id);
  if (deleted) {
    invariant(field?.deletedAt, 'Field not found');
  } else {
    invariant(field && !field.deletedAt, 'Field not found');
  }
  return field;
}
