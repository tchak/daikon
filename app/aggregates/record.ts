import { z } from 'zod';
import invariant from 'tiny-invariant';
import produce from 'immer';
import { parseISO } from 'date-fns';

import type {
  EventStore,
  ApplyEvent,
  AggregateRoot,
} from '~/util/aggregate-root';
import { createAggregate, withAggregate } from '~/util/aggregate-root';
import { Metadata, RecordEvent, RecordEventsMap, metadata } from '~/events';

const FieldEntity = z.union([
  z.object({ value: z.string().nullable() }),
  z.object({ value: z.number().nullable() }),
  z.object({ value: z.date().nullable() }),
  z.object({ value: z.boolean() }),
]);

const RecordEntity = z.object({
  id: z.string().uuid(),
  data: z.record(z.string().uuid(), FieldEntity),
  deletedAt: z.string().nullish(),
});
type RecordEntity = z.infer<typeof RecordEntity>;

export function createCommand<Command>(
  aggregateId: (command: Command) => string,
  callback: (
    command: Command,
    aggregate: AggregateRoot<RecordEntity, RecordEventsMap, Metadata>
  ) => Promise<void> | void
) {
  return <Context>(
      eventStore: EventStore<Context, RecordEventsMap, Metadata>
    ) =>
    (command: Command, meta: Partial<Metadata>) =>
      withAggregate(
        eventStore,
        createAggregate('Record', applyEvent, {
          metadata: metadata(meta),
          aggregateId: aggregateId(command),
        }),
        (aggregate) => callback(command, aggregate)
      );
}

const applyEvent: ApplyEvent<RecordEntity, RecordEventsMap, Metadata> = (
  recordEvent,
  record
) => {
  const event = RecordEvent.parse(recordEvent);
  switch (event.eventType) {
    case 'RecordCreated':
      return {
        id: event.data.recordId,
        data: {},
      };
    case 'RecordDeleted':
      invariant(record && !record.deletedAt, 'Record not found');
      return { ...record, deletedAt: event.metadata.timestamp };
    case 'RecordRestored':
      invariant(record?.deletedAt, 'Record not found');
      return { ...record, deletedAt: null };
    case 'RecordDestroyed':
      invariant(record?.deletedAt, 'Record not found');
      return null;
    case 'TextFieldValueSet':
    case 'BooleanFieldValueSet':
    case 'IntFieldValueSet':
    case 'FloatFieldValueSet':
      invariant(record && !record.deletedAt, 'Record not found');
      return produce(record, (record) => {
        record.data[event.data.fieldId] = {
          value: event.data.value,
        };
      });
    case 'DateFieldValueSet':
    case 'DateTimeFieldValueSet':
      invariant(record && !record.deletedAt, 'Record not found');
      return produce(record, (record) => {
        record.data[event.data.fieldId] = {
          value: event.data.value ? parseISO(event.data.value) : null,
        };
      });
  }
};
