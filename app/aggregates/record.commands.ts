import { v4 as uuid } from 'uuid';
import { formatISO } from 'date-fns';

import { createCommand } from './record';

type CreateRecord = {
  bucketId: string;
};

export const createRecord = createCommand<CreateRecord>(
  () => uuid(),
  async ({ bucketId }, aggregate) => {
    aggregate.applyEvent({
      type: 'RecordCreated',
      data: { bucketId, recordId: aggregate.id, parentId: null },
    });
  }
);

type DeleteRecord = {
  bucketId: string;
  recordId: string;
};

export const deleteRecord = createCommand<DeleteRecord>(
  ({ recordId }) => recordId,
  async ({ bucketId }, aggregate) => {
    aggregate.applyEvent({
      type: 'RecordDeleted',
      data: { bucketId, recordId: aggregate.id },
    });
  }
);

type Data =
  | {
      id: string;
      type: 'TEXT';
      value: string | null;
    }
  | { id: string; type: 'BOOLEAN'; value: boolean }
  | { id: string; type: 'INT' | 'FLOAT'; value: number | null }
  | { id: string; type: 'DATE' | 'DATE_TIME'; value: Date | null };

type UpdateRecord = {
  bucketId: string;
  recordId: string;
  data: Data[];
};

export const updateRecord = createCommand<UpdateRecord>(
  ({ recordId }) => recordId,
  ({ bucketId, data }, aggregate) => {
    for (const datum of data) {
      if (aggregate.entity.data[datum.id].value != datum.value) {
        switch (datum.type) {
          case 'TEXT':
            aggregate.applyEvent({
              type: 'TextFieldValueSet',
              data: {
                bucketId,
                recordId: aggregate.id,
                fieldId: datum.id,
                value: datum.value,
              },
            });
            break;
          case 'BOOLEAN':
            aggregate.applyEvent({
              type: 'BooleanFieldValueSet',
              data: {
                bucketId,
                recordId: aggregate.id,
                fieldId: datum.id,
                value: datum.value,
              },
            });
            break;
          case 'INT':
            aggregate.applyEvent({
              type: 'IntFieldValueSet',
              data: {
                bucketId,
                recordId: aggregate.id,
                fieldId: datum.id,
                value: datum.value,
              },
            });
            break;
          case 'FLOAT':
            aggregate.applyEvent({
              type: 'FloatFieldValueSet',
              data: {
                bucketId,
                recordId: aggregate.id,
                fieldId: datum.id,
                value: datum.value,
              },
            });
            break;
          case 'DATE':
            aggregate.applyEvent({
              type: 'DateFieldValueSet',
              data: {
                bucketId,
                recordId: aggregate.id,
                fieldId: datum.id,
                value: datum.value
                  ? formatISO(datum.value, { representation: 'date' })
                  : null,
              },
            });
            break;
          case 'DATE_TIME':
            aggregate.applyEvent({
              type: 'DateTimeFieldValueSet',
              data: {
                bucketId,
                recordId: aggregate.id,
                fieldId: datum.id,
                value: datum.value ? formatISO(datum.value) : null,
              },
            });
            break;
        }
      }
    }
  }
);
