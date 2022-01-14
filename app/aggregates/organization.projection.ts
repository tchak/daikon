import type { DB } from '~/util/db.server';
import type { EventStore } from '~/util/aggregate-root';
import { OrganizationEventsMap, Metadata } from '~/events';

export function OrganizationProjection(
  eventStore: EventStore<DB, OrganizationEventsMap, Metadata>
) {
  const unsubscribe = [
    eventStore.subscribe(['OrganizationCreated'], async (event) => {
      await eventStore.db.organization.create({
        data: {
          id: event.data.organizationId,
          name: event.data.name,
          createdAt: event.metadata.timestamp,
          updatedAt: event.metadata.timestamp,
        },
      });
    }),
    eventStore.subscribe(['OrganizationNameSet'], async (event) => {
      await eventStore.db.organization.update({
        where: { id: event.data.organizationId },
        data: { name: event.data.name, updatedAt: event.metadata.timestamp },
      });
    }),
    eventStore.subscribe(['UserAddedToOrganization'], async (event) => {
      await eventStore.db.membership.create({
        data: {
          organizationId: event.data.organizationId,
          userId: event.data.userId,
          role: event.data.role,
        },
      });
    }),
    eventStore.subscribe(['UserRemovedFromOrganization'], async (event) => {
      await eventStore.db.membership.deleteMany({
        where: {
          organizationId: event.data.organizationId,
          userId: event.data.userId,
          role: event.data.role,
        },
      });
    }),
    eventStore.subscribe(['OrganizationDeleted'], async (event) => {
      await eventStore.db.organization.update({
        where: { id: event.data.organizationId },
        data: { deletedAt: event.metadata.timestamp },
      });
    }),
    eventStore.subscribe(['OrganizationRestored'], async (event) => {
      await eventStore.db.organization.update({
        where: { id: event.data.organizationId },
        data: { deletedAt: null },
      });
    }),
    eventStore.subscribe(['OrganizationDestroyed'], async (event) => {
      await eventStore.db.organization.delete({
        where: { id: event.data.organizationId },
      });
    }),
  ];
  return () => unsubscribe.map((unsubscribe) => unsubscribe());
}
