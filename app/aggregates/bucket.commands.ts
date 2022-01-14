import { v4 as uuid } from 'uuid';

import { createCommand } from './bucket';

type CreateBucket = {
  name: string;
  color: string;
  organizationId: string;
};

export const createBucket = createCommand<CreateBucket>(
  () => uuid(),
  ({ name, color, organizationId }, aggregate) => {
    aggregate.applyEvent({
      type: 'BucketCreated',
      data: { bucketId: aggregate.id, organizationId, name, color },
    });
    aggregate.applyEvent({
      type: 'ViewCreated',
      data: {
        bucketId: aggregate.id,
        viewId: uuid(),
        type: 'GRID',
        name: 'Grid View',
      },
    });
    aggregate.applyEvent({
      type: 'FieldCreated',
      data: {
        bucketId: aggregate.id,
        fieldId: uuid(),
        type: 'TEXT',
        name: 'Name',
      },
    });
  }
);

type UpdateBucket = {
  bucketId: string;
  name?: string;
  color?: string;
  description?: string;
};

export const updateBucket = createCommand<UpdateBucket>(
  ({ bucketId }) => bucketId,
  ({ name, color, description }, aggregate) => {
    if (name) {
      aggregate.applyEvent({
        type: 'BucketNameSet',
        data: { bucketId: aggregate.id, name },
      });
    }
    if (description) {
      aggregate.applyEvent({
        type: 'BucketDescriptionSet',
        data: { bucketId: aggregate.id, description },
      });
    }
    if (color) {
      aggregate.applyEvent({
        type: 'BucketColorSet',
        data: { bucketId: aggregate.id, color },
      });
    }
  }
);

export const deleteBucket = createCommand<{ bucketId: string }>(
  ({ bucketId }) => bucketId,
  (_, aggregate) => {
    aggregate.applyEvent({
      type: 'BucketDeleted',
      data: { bucketId: aggregate.id },
    });
  }
);

export const restoreBucket = createCommand<{ bucketId: string }>(
  ({ bucketId }) => bucketId,
  (_, aggregate) => {
    aggregate.applyEvent({
      type: 'BucketRestored',
      data: { bucketId: aggregate.id },
    });
  }
);

export const createField = createCommand<{ bucketId: string; name: string }>(
  ({ bucketId }) => bucketId,
  ({ name }, aggregate) => {
    aggregate.applyEvent({
      type: 'FieldCreated',
      data: {
        bucketId: aggregate.id,
        fieldId: uuid(),
        type: 'TEXT',
        name,
      },
    });
  }
);

export const updateField = createCommand<{
  bucketId: string;
  fieldId: string;
  name?: string;
  description?: string;
}>(
  ({ bucketId }) => bucketId,
  ({ fieldId, name, description }, aggregate) => {
    const field = aggregate.entity.fields[aggregate.entity.version].find(
      (field) => field.id == fieldId
    );
    if (name && field?.name != name) {
      aggregate.applyEvent({
        type: 'FieldNameSet',
        data: {
          bucketId: aggregate.id,
          fieldId,
          name,
        },
      });
    }
    if (description && field?.description != description) {
      aggregate.applyEvent({
        type: 'FieldDescriptionSet',
        data: {
          bucketId: aggregate.id,
          fieldId,
          description,
        },
      });
    }
  }
);

export const updateView = createCommand<{
  bucketId: string;
  viewId: string;
  name?: string;
  description?: string;
}>(
  ({ bucketId }) => bucketId,
  ({ viewId, name, description }, aggregate) => {
    const view = aggregate.entity.views.find((view) => view.id == viewId);
    if (name && view?.name != name) {
      aggregate.applyEvent({
        type: 'ViewNameSet',
        data: {
          bucketId: aggregate.id,
          viewId,
          name,
        },
      });
    }
    if (description && view?.description != description) {
      aggregate.applyEvent({
        type: 'ViewDescriptionSet',
        data: {
          bucketId: aggregate.id,
          viewId,
          description,
        },
      });
    }
  }
);

export const hideField = createCommand<{
  bucketId: string;
  viewId: string;
  fieldId: string;
  hidden: boolean;
}>(
  ({ bucketId }) => bucketId,
  ({ viewId, fieldId, hidden }, aggregate) => {
    aggregate.applyEvent({
      type: 'FieldHiddenSet',
      data: {
        bucketId: aggregate.id,
        viewId,
        fieldId,
        hidden,
      },
    });
  }
);

export const deleteField = createCommand<{ bucketId: string; fieldId: string }>(
  ({ bucketId }) => bucketId,
  ({ fieldId }, aggregate) => {
    aggregate.applyEvent({
      type: 'FieldDeleted',
      data: { bucketId: aggregate.id, fieldId },
    });
  }
);
