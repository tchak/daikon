import { v4 as uuid } from 'uuid';

import type { DB } from '~/util/db.server';
import type { EventStore } from '~/util/aggregate-root';
import { UserEventsMap, Metadata } from '~/events';
import { hash } from '~/util/argon2.server';

export function UserProjection(
  eventStore: EventStore<DB, UserEventsMap, Metadata>
) {
  const unsubscribe = [
    eventStore.subscribe(['UserCreated'], async (event) => {
      await eventStore.db.user.create({
        data: {
          id: event.data.userId,
          email: event.data.email,
          password: await hash(uuid()),
          createdAt: event.metadata.timestamp,
          updatedAt: event.metadata.timestamp,
        },
      });
    }),
    eventStore.subscribe(['UserDeleted'], async (event) => {
      await eventStore.db.user.update({
        where: { id: event.data.userId },
        data: { deletedAt: event.metadata.timestamp },
      });
    }),
    eventStore.subscribe(['UserRestored'], async (event) => {
      await eventStore.db.user.update({
        where: { id: event.data.userId },
        data: { deletedAt: null },
      });
    }),
    eventStore.subscribe(['UserDestroyed'], async (event) => {
      await eventStore.db.user.delete({
        where: { id: event.data.userId },
      });
    }),
  ];
  return () => unsubscribe.map((unsubscribe) => unsubscribe());
}
