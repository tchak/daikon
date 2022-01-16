import { v4 as uuid } from 'uuid';

import { createCommand } from './organization';

type CreateOrganization = { userId: string; name: string };

export const createOrganization = createCommand<CreateOrganization>(
  () => uuid(),
  ({ userId, name }, aggregate) => {
    aggregate.applyEvent({
      type: 'OrganizationCreated',
      data: { organizationId: aggregate.id, name },
      metadata: { linkTo: `User$${userId}` },
    });
    aggregate.applyEvent({
      type: 'UserAddedToOrganization',
      data: { organizationId: aggregate.id, userId, role: 'Owner' },
      metadata: { linkTo: `User$${userId}` },
    });
  }
);
