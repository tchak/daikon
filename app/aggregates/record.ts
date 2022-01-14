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

export const Record = z.object({
  id: z.string().uuid(),
  fields: z.record(
    z.string().uuid(),
    z.union([
      z.object({ value: z.string().nullable() }),
      z.object({ value: z.number().nullable() }),
      z.object({ value: z.date().nullable() }),
      z.object({ value: z.boolean() }),
    ])
  ),
  deletedAt: z.string().nullish(),
});
export type Record = z.infer<typeof Record>;

export function createCommand<Command>(
  aggregateId: (command: Command) => string,
  callback: (
    command: Command,
    aggregate: AggregateRoot<Record, RecordEventsMap, Metadata>
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

const applyEvent: ApplyEvent<Record, RecordEventsMap, Metadata> = (
  recordEvent,
  record
) => {
  const event = RecordEvent.parse(recordEvent);
  switch (event.eventType) {
    case 'RecordCreated':
      return {
        id: event.data.recordId,
        fields: {},
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
        record.fields[event.data.fieldId] = {
          value: event.data.value,
        };
      });
    case 'DateFieldValueSet':
    case 'DateTimeFieldValueSet':
      invariant(record && !record.deletedAt, 'Record not found');
      return produce(record, (record) => {
        record.fields[event.data.fieldId] = {
          value: event.data.value ? parseISO(event.data.value) : null,
        };
      });
  }
};
