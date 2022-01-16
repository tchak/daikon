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
    if (name && aggregate.entity.name != name) {
      aggregate.applyEvent({
        type: 'BucketNameSet',
        data: { bucketId: aggregate.id, name },
      });
    }
    if (description && aggregate.entity.description != description) {
      aggregate.applyEvent({
        type: 'BucketDescriptionSet',
        data: { bucketId: aggregate.id, description },
      });
    }
    if (color && aggregate.entity.color != color) {
      aggregate.applyEvent({
        type: 'BucketColorSet',
        data: { bucketId: aggregate.id, color },
      });
    }
  }
);

type DeleteBucket = {
  bucketId: string;
};

export const deleteBucket = createCommand<DeleteBucket>(
  ({ bucketId }) => bucketId,
  (_, aggregate) => {
    aggregate.applyEvent({
      type: 'BucketDeleted',
      data: { bucketId: aggregate.id },
    });
  }
);

type RestoreBucket = {
  bucketId: string;
};

export const restoreBucket = createCommand<RestoreBucket>(
  ({ bucketId }) => bucketId,
  (_, aggregate) => {
    aggregate.applyEvent({
      type: 'BucketRestored',
      data: { bucketId: aggregate.id },
    });
  }
);

type CreateField = {
  bucketId: string;
  name: string;
  type: 'TEXT' | 'BOOLEAN' | 'INT' | 'FLOAT' | 'DATE' | 'DATE_TIME';
};

export const createField = createCommand<CreateField>(
  ({ bucketId }) => bucketId,
  ({ name, type }, aggregate) => {
    aggregate.applyEvent({
      type: 'FieldCreated',
      data: {
        bucketId: aggregate.id,
        fieldId: uuid(),
        type,
        name,
      },
    });
  }
);

type UpdateField = {
  bucketId: string;
  fieldId: string;
  type?: 'TEXT' | 'BOOLEAN' | 'INT' | 'FLOAT' | 'DATE' | 'DATE_TIME';
  name?: string;
  description?: string;
};

export const updateField = createCommand<UpdateField>(
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

type DeleteField = {
  bucketId: string;
  fieldId: string;
};

export const deleteField = createCommand<DeleteField>(
  ({ bucketId }) => bucketId,
  ({ fieldId }, aggregate) => {
    aggregate.applyEvent({
      type: 'FieldDeleted',
      data: { bucketId: aggregate.id, fieldId },
    });
  }
);

type CreateView = {
  bucketId: string;
  name: string;
};

export const createView = createCommand<CreateView>(
  ({ bucketId }) => bucketId,
  ({ name }, aggregate) => {
    aggregate.applyEvent({
      type: 'ViewCreated',
      data: {
        bucketId: aggregate.id,
        viewId: uuid(),
        type: 'GRID',
        name,
      },
    });
  }
);

type UpdateView = {
  bucketId: string;
  viewId: string;
  name?: string;
  description?: string;
};

export const updateView = createCommand<UpdateView>(
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

type HideFieldInView = {
  bucketId: string;
  viewId: string;
  fieldId: string;
  hidden: boolean;
};

export const hideFieldInView = createCommand<HideFieldInView>(
  ({ bucketId }) => bucketId,
  ({ viewId, fieldId, hidden }, aggregate) => {
    const field = aggregate.entity.fields[aggregate.entity.version].find(
      (field) => field.id == fieldId
    );
    const view = aggregate.entity.views.find((view) => view.id == viewId);
    if (field && !!view?.hidden[field?.id] != hidden) {
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
  }
);

type DeleteView = {
  bucketId: string;
  viewId: string;
};

export const deleteView = createCommand<DeleteView>(
  ({ bucketId }) => bucketId,
  ({ viewId }, aggregate) => {
    aggregate.applyEvent({
      type: 'ViewDeleted',
      data: { bucketId: aggregate.id, viewId },
    });
  }
);
