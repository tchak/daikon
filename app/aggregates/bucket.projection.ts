import { z } from 'zod';

import type { DB } from '~/util/db.server';
import type { EventStore } from '~/util/aggregate-root';
import { BucketEventsMap, Metadata } from '~/events';

export function BucketProjection(
  eventStore: EventStore<DB, BucketEventsMap, Metadata>
) {
  const unsubscribe = [
    eventStore.subscribe(['BucketCreated'], async (event) => {
      await eventStore.db.bucket.create({
        data: {
          id: event.data.bucketId,
          name: event.data.name,
          color: event.data.color,
          organizationId: event.data.organizationId,
          createdAt: event.metadata.timestamp,
          updatedAt: event.metadata.timestamp,
          schemas: { create: { version: 0 } },
        },
      });
    }),
    eventStore.subscribe(['BucketDeleted'], async (event) => {
      await eventStore.db.bucket.update({
        where: { id: event.data.bucketId },
        data: { deletedAt: event.metadata.timestamp },
      });
    }),
    eventStore.subscribe(['BucketRestored'], async (event) => {
      await eventStore.db.bucket.update({
        where: { id: event.data.bucketId },
        data: { deletedAt: null },
      });
    }),
    eventStore.subscribe(['BucketDestroyed'], async (event) => {
      await eventStore.db.bucket.delete({
        where: { id: event.data.bucketId },
      });
    }),
    eventStore.subscribe(['BucketSchemaLocked'], async (event) => {
      const schema = await eventStore.db.schema.findFirst({
        rejectOnNotFound: true,
        where: { bucketId: event.data.bucketId, lockedAt: null },
        select: { id: true, version: true, fields: true },
      });
      const fields = Fields.parse(schema.fields);
      await eventStore.db.schema.update({
        where: { id: schema.id },
        data: {
          lockedAt: event.metadata.timestamp,
          fields: Object.fromEntries(
            Object.values(fields)
              .filter((field) => !field.deletedAt)
              .map((field) => [field.id, field])
          ),
        },
      });
      await eventStore.db.schema.create({
        data: {
          version: schema.version + 1,
          bucketId: event.data.bucketId,
          fields: { ...fields },
        },
      });
    }),
    eventStore.subscribe(['FieldCreated'], async (event) => {
      const schema = await eventStore.db.schema.findFirst({
        rejectOnNotFound: true,
        where: { bucketId: event.data.bucketId, lockedAt: null },
        select: { id: true, fields: true },
      });
      const fields = Fields.parse(schema.fields);
      fields[event.data.fieldId] = {
        id: event.data.fieldId,
        name: event.data.name,
        type: event.data.type,
        createdAt: event.metadata.timestamp,
      };
      await eventStore.db.schema.update({
        where: { id: schema.id },
        data: { fields },
      });
    }),
    eventStore.subscribe(
      ['FieldNameSet', 'FieldDescriptionSet'],
      async (event) => {
        const schema = await eventStore.db.schema.findFirst({
          rejectOnNotFound: true,
          where: { bucketId: event.data.bucketId, lockedAt: null },
          select: { id: true, fields: true },
        });
        const fields = Fields.parse(schema.fields);
        if ('name' in event.data) {
          fields[event.data.fieldId].name = event.data.name;
        } else {
          fields[event.data.fieldId].description = event.data.description;
        }
        await eventStore.db.schema.update({
          where: { id: schema.id },
          data: { fields },
        });
      }
    ),
    eventStore.subscribe(['FieldDeleted'], async (event) => {
      const schema = await eventStore.db.schema.findFirst({
        rejectOnNotFound: true,
        where: { bucketId: event.data.bucketId, lockedAt: null },
        select: { id: true, fields: true },
      });
      const fields = Fields.parse(schema.fields);
      fields[event.data.fieldId].deletedAt = event.metadata.timestamp;
      await eventStore.db.schema.update({
        where: { id: schema.id },
        data: { fields },
      });
    }),
    eventStore.subscribe(['FieldRestored'], async (event) => {
      const schema = await eventStore.db.schema.findFirst({
        rejectOnNotFound: true,
        where: { bucketId: event.data.bucketId, lockedAt: null },
        select: { id: true, fields: true },
      });
      const fields = Fields.parse(schema.fields);
      delete fields[event.data.fieldId].deletedAt;
      await eventStore.db.schema.update({
        where: { id: schema.id },
        data: { fields },
      });
    }),
    eventStore.subscribe(['FieldDestroyed'], async (event) => {
      const schema = await eventStore.db.schema.findFirst({
        rejectOnNotFound: true,
        where: { bucketId: event.data.bucketId, lockedAt: null },
        select: { id: true, fields: true },
      });
      const fields = Fields.parse(schema.fields);
      delete fields[event.data.fieldId];
      await eventStore.db.schema.update({
        where: { id: schema.id },
        data: { fields },
      });
    }),
    eventStore.subscribe(['ViewCreated'], async (event) => {
      await eventStore.db.view.create({
        data: {
          id: event.data.viewId,
          bucketId: event.data.bucketId,
          name: event.data.name,
          type: event.data.type,
          createdAt: event.metadata.timestamp,
          updatedAt: event.metadata.timestamp,
        },
      });
    }),
    eventStore.subscribe(['ViewDeleted'], async (event) => {
      await eventStore.db.view.update({
        where: { id: event.data.viewId },
        data: { deletedAt: event.metadata.timestamp },
      });
    }),
    eventStore.subscribe(['ViewRestored'], async (event) => {
      await eventStore.db.view.update({
        where: { id: event.data.viewId },
        data: { deletedAt: null },
      });
    }),
    eventStore.subscribe(['ViewDestroyed'], async (event) => {
      await eventStore.db.view.delete({
        where: { id: event.data.viewId },
      });
    }),
    eventStore.subscribe(['ViewNameSet'], async (event) => {
      await eventStore.db.view.update({
        where: { id: event.data.viewId },
        data: { name: event.data.name, updatedAt: event.metadata.timestamp },
      });
    }),
    eventStore.subscribe(['ViewDescriptionSet'], async (event) => {
      await eventStore.db.view.update({
        where: { id: event.data.viewId },
        data: {
          description: event.data.description,
          updatedAt: event.metadata.timestamp,
        },
      });
    }),
    eventStore.subscribe(['FieldHiddenSet'], async (event) => {
      const view = await eventStore.db.view.findUnique({
        rejectOnNotFound: true,
        where: { id: event.data.viewId },
      });
      const fields = ViewFields.parse(view.fields);
      fields[event.data.fieldId] ||= {};
      fields[event.data.fieldId].hidden = event.data.hidden;
      await eventStore.db.view.update({
        where: { id: event.data.viewId },
        data: { fields, updatedAt: event.metadata.timestamp },
      });
    }),
  ];
  return () => unsubscribe.map((unsubscribe) => unsubscribe());
}

export const Fields = z.record(
  z.string().uuid(),
  z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().optional(),
    type: z.string(),
    createdAt: z.string(),
    deletedAt: z.string().nullish(),
  })
);

export const ViewFields = z.record(
  z.string().uuid(),
  z.object({ hidden: z.boolean().optional() })
);
