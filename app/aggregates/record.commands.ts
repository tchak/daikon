import { v4 as uuid } from 'uuid';
import { formatISO } from 'date-fns';

import { createCommand } from './record';

export const createRecord = createCommand<{ bucketId: string }>(
  () => uuid(),
  async ({ bucketId }, aggregate) => {
    aggregate.applyEvent({
      type: 'RecordCreated',
      data: { recordId: aggregate.id, bucketId, parentId: null },
    });
  }
);

export const deleteRecord = createCommand<{
  bucketId: string;
  recordId: string;
}>(
  ({ recordId }) => recordId,
  async ({ bucketId }, aggregate) => {
    aggregate.applyEvent({
      type: 'RecordDeleted',
      data: { recordId: aggregate.id, bucketId },
    });
  }
);

export const updateRecord = createCommand<{
  bucketId: string;
  recordId: string;
  fieldId: string;
  data: (
    | {
        type: 'TEXT';
        value: string | null;
      }
    | { type: 'BOOLEAN'; value: boolean }
    | { type: 'INT' | 'FLOAT'; value: number | null }
    | { type: 'DATE' | 'DATE_TIME'; value: Date | null }
  )[];
}>(
  ({ recordId }) => recordId,
  ({ bucketId, fieldId, data }, aggregate) => {
    for (const datum of data) {
      switch (datum.type) {
        case 'TEXT':
          if (aggregate.entity.fields[fieldId].value != datum.value) {
            aggregate.applyEvent({
              type: 'TextFieldValueSet',
              data: {
                recordId: aggregate.id,
                bucketId,
                fieldId,
                value: datum.value,
              },
            });
          }
          break;
        case 'BOOLEAN':
          if (aggregate.entity.fields[fieldId].value != datum.value) {
            aggregate.applyEvent({
              type: 'BooleanFieldValueSet',
              data: {
                recordId: aggregate.id,
                bucketId,
                fieldId,
                value: datum.value,
              },
            });
          }
          break;
        case 'INT':
          if (aggregate.entity.fields[fieldId].value != datum.value) {
            aggregate.applyEvent({
              type: 'IntFieldValueSet',
              data: {
                recordId: aggregate.id,
                bucketId,
                fieldId,
                value: datum.value,
              },
            });
          }
          break;
        case 'FLOAT':
          if (aggregate.entity.fields[fieldId].value != datum.value) {
            aggregate.applyEvent({
              type: 'FloatFieldValueSet',
              data: {
                recordId: aggregate.id,
                bucketId,
                fieldId,
                value: datum.value,
              },
            });
          }
          break;
        case 'DATE':
          if (aggregate.entity.fields[fieldId].value != datum.value) {
            aggregate.applyEvent({
              type: 'DateFieldValueSet',
              data: {
                recordId: aggregate.id,
                bucketId,
                fieldId,
                value: datum.value
                  ? formatISO(datum.value, { representation: 'date' })
                  : null,
              },
            });
          }
          break;
        case 'DATE_TIME':
          if (aggregate.entity.fields[fieldId].value != datum.value) {
            aggregate.applyEvent({
              type: 'DateTimeFieldValueSet',
              data: {
                recordId: aggregate.id,
                bucketId,
                fieldId,
                value: datum.value ? formatISO(datum.value) : null,
              },
            });
          }
          break;
      }
    }
  }
);
