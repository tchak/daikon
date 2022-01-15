import { z } from 'zod';

import type { DB } from '~/util/db.server';
import type { EventStore } from '~/util/aggregate-root';
import { RecordEventsMap, Metadata } from '~/events';

export function RecordProjection(
  eventStore: EventStore<DB, RecordEventsMap, Metadata>
) {
  const unsubscribe = [
    eventStore.subscribe(['RecordCreated'], async (event) => {
      const schema = await eventStore.db.schema.findFirst({
        rejectOnNotFound: true,
        where: { bucketId: event.data.bucketId, lockedAt: null },
        select: { id: true, version: true, fields: true },
      });
      await eventStore.db.record.create({
        data: {
          id: event.data.recordId,
          schemaId: schema.id,
          data: {},
          createdAt: event.metadata.timestamp,
          updatedAt: event.metadata.timestamp,
        },
      });
    }),
    eventStore.subscribe(['RecordDeleted'], async (event) => {
      await eventStore.db.record.update({
        where: { id: event.data.recordId },
        data: { deletedAt: event.metadata.timestamp },
      });
    }),
    eventStore.subscribe(['RecordRestored'], async (event) => {
      await eventStore.db.record.update({
        where: { id: event.data.recordId },
        data: { deletedAt: null },
      });
    }),
    eventStore.subscribe(['RecordDestroyed'], async (event) => {
      await eventStore.db.record.delete({
        where: { id: event.data.recordId },
      });
    }),
    eventStore.subscribe(
      [
        'TextFieldValueSet',
        'BooleanFieldValueSet',
        'IntFieldValueSet',
        'FloatFieldValueSet',
        'DateFieldValueSet',
        'DateTimeFieldValueSet',
      ],
      async (event) => {
        const record = await eventStore.db.record.findUnique({
          rejectOnNotFound: true,
          where: { id: event.data.recordId },
        });
        const data = Data.parse(record.data);
        data[event.data.fieldId] = {
          type: fieldType(event.eventType),
          value: event.data.value,
          updatedAt: event.metadata.timestamp,
        };
        await eventStore.db.record.update({
          where: { id: event.data.recordId },
          data: { data, updatedAt: event.metadata.timestamp },
        });
      }
    ),
  ];
  return () => unsubscribe.map((unsubscribe) => unsubscribe());
}

function fieldType(eventType: string) {
  if (eventType == 'DateTimeFieldValueSet') {
    return 'DATE_TIME';
  }
  return eventType.replace(/FieldValueSet$/, '').toUpperCase();
}

export const Data = z.record(
  z.string().uuid(),
  z.union([
    z.object({
      type: z.string(),
      value: z.string().nullable(),
      updatedAt: z.string(),
    }),
    z.object({
      type: z.string(),
      value: z.number().nullable(),
      updatedAt: z.string(),
    }),
    z.object({
      type: z.string(),
      value: z.boolean(),
      updatedAt: z.string(),
    }),
  ])
);
