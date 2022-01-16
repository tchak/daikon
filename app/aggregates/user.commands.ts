import { v4 as uuid } from 'uuid';

import { createCommand } from './user';

export const createUser = createCommand<{ email: string }>(
  () => uuid(),
  ({ email }, aggregate) => {
    const organizationId = uuid();

    aggregate.applyEvent({
      type: 'UserCreated',
      data: { userId: aggregate.id, email },
      metadata: { actor: aggregate.id },
    });
    aggregate.applyEvent({
      type: 'OrganizationCreated',
      data: {
        organizationId,
        name: 'Default Organization',
      },
      metadata: {
        actor: aggregate.id,
        linkTo: `Organization$${organizationId}`,
      },
    });
    aggregate.applyEvent({
      type: 'UserAddedToOrganization',
      data: {
        userId: aggregate.id,
        organizationId,
        role: 'Owner',
      },
      metadata: {
        actor: aggregate.id,
        linkTo: `Organization$${organizationId}`,
      },
    });
  }
);

export const deleteUser = createCommand<{ userId: string }>(
  ({ userId }) => userId,
  (_, aggregate) => {
    aggregate.applyEvent({
      type: 'UserDeleted',
      data: { userId: aggregate.id },
    });
  }
);
