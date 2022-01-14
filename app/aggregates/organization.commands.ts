import { v4 as uuid } from 'uuid';

import { createCommand } from './organization';

export const createOrganization = createCommand<{
  name: string;
}>(
  () => uuid(),
  ({ name }, aggregate) => {
    aggregate.applyEvent({
      type: 'OrganizationCreated',
      data: { organizationId: aggregate.id, name },
    });
  }
);
