import { z } from 'zod';
import invariant from 'tiny-invariant';

import type {
  EventStore,
  ApplyEvent,
  AggregateRoot,
} from '~/util/aggregate-root';
import { createAggregate, withAggregate } from '~/util/aggregate-root';
import { Metadata, UserEvent, UserEventsMap, metadata } from '~/events';

const UserEntity = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  deletedAt: z.string().nullish(),
});
type UserEntity = z.infer<typeof UserEntity>;

export function createCommand<Command>(
  aggregateId: (command: Command) => string,
  callback: (
    command: Command,
    aggregate: AggregateRoot<UserEntity, UserEventsMap, Metadata>
  ) => Promise<void> | void
) {
  return <Context>(eventStore: EventStore<Context, UserEventsMap, Metadata>) =>
    (command: Command, meta: Partial<Metadata>) =>
      withAggregate(
        eventStore,
        createAggregate('User', applyEvent, {
          metadata: metadata(meta),
          aggregateId: aggregateId(command),
        }),
        (aggregate) => callback(command, aggregate)
      );
}

const applyEvent: ApplyEvent<UserEntity, UserEventsMap, Metadata> = (
  userEvent,
  user
) => {
  const event = UserEvent.parse(userEvent);
  switch (event.eventType) {
    case 'UserCreated':
      return {
        id: event.data.userId,
        email: event.data.email,
      };
    case 'UserDeleted':
      invariant(user && !user.deletedAt, 'User not found');
      invariant(user.id == event.metadata.actor, 'Unauthorized User');
      return { ...user, deletedAt: event.metadata.timestamp };
    case 'UserRestored':
      invariant(user?.deletedAt, 'User not found');
      invariant(user.id == event.metadata.actor, 'Unauthorized User');
      return { ...user, deletedAt: null };
    case 'UserDestroyed':
      invariant(user?.deletedAt, 'User not found');
      return null;
    default:
      return user;
  }
};
