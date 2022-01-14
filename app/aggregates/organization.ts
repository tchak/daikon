import { z } from 'zod';
import invariant from 'tiny-invariant';
import produce from 'immer';

import type {
  EventStore,
  ApplyEvent,
  AggregateRoot,
} from '~/util/aggregate-root';
import {
  createProjection,
  createAggregate,
  withAggregate,
} from '~/util/aggregate-root';
import {
  Metadata,
  OrganizationEvent,
  OrganizationEventsMap,
  metadata,
} from '~/events';

export const Member = z.object({
  userId: z.string().uuid(),
  role: z.string(),
});
type Member = z.infer<typeof Member>;

export const Organization = z.object({
  id: z.string().uuid(),
  name: z.string(),
  deletedAt: z.string().nullish(),
  members: Member.array(),
});
export type Organization = z.infer<typeof Organization>;

export function createCommand<Command>(
  aggregateId: (command: Command) => string,
  callback: (
    command: Command,
    aggregate: AggregateRoot<Organization, OrganizationEventsMap, Metadata>
  ) => Promise<void> | void
) {
  return <Context>(
      eventStore: EventStore<Context, OrganizationEventsMap, Metadata>
    ) =>
    (command: Command, meta: Partial<Metadata>) =>
      withAggregate(
        eventStore,
        createAggregate('Organization', applyEvent, {
          metadata: metadata(meta),
          aggregateId: aggregateId(command),
        }),
        (aggregate) => callback(command, aggregate)
      );
}

const applyEvent: ApplyEvent<Organization, OrganizationEventsMap, Metadata> = (
  organizationEvent,
  organization
) => {
  const event = OrganizationEvent.parse(organizationEvent);
  switch (event.eventType) {
    case 'OrganizationCreated':
      return {
        id: event.data.organizationId,
        name: event.data.name,
        members: [{ userId: event.metadata.actor, role: 'Owner' }],
      };
    case 'OrganizationNameSet':
      invariant(
        organization && !organization.deletedAt,
        'Organization not found'
      );
      invariant(
        isOwner(organization, event.metadata.actor),
        'Unauthorized User'
      );
      return { ...organization, name: event.data.name };
    case 'UserAddedToOrganization':
      invariant(
        organization && !organization.deletedAt,
        'Organization not found'
      );
      invariant(isOwner(organization, event.metadata.actor), 'Access forbiden');
      return produce(organization, (organization) => {
        organization.members.push({
          userId: event.data.userId,
          role: event.data.role,
        });
      });
    case 'UserRemovedFromOrganization':
      invariant(
        organization && !organization.deletedAt,
        'Organization not found'
      );
      invariant(isOwner(organization, event.metadata.actor), 'Access forbiden');
      invariant(
        organization.members.filter((member) => member.role == 'Owner').length >
          1,
        'Unable to remove the only Owner from the Organization'
      );
      return produce(organization, (organization) => {
        organization.members = organization.members.filter(
          (member) => !isMember(member, event.data.userId, event.data.role)
        );
      });
    case 'OrganizationDeleted':
      invariant(
        organization && !organization.deletedAt,
        'Organization not found'
      );
      invariant(isOwner(organization, event.metadata.actor), 'Access forbiden');
      return {
        ...organization,
        deletedAt: event.metadata.timestamp,
      };
    case 'OrganizationRestored':
      invariant(organization?.deletedAt, 'Organization not found');
      invariant(isOwner(organization, event.metadata.actor), 'Access forbiden');
      return { ...organization, deletedAt: null };
    case 'OrganizationDestroyed':
      invariant(organization?.deletedAt, 'Organization not found');
      invariant(isOwner(organization, event.metadata.actor), 'Access forbiden');
      return null;
  }
};

function isOwner(organization: Organization, userId: string): boolean {
  return !!organization.members.find((member) =>
    isMember(member, userId, 'Owner')
  );
}

function isMember(member: Member, userId: string, role: string) {
  return member.userId == userId && member.role == role;
}

export const authorized = (organizationId: string, userId: string) =>
  createProjection<boolean, OrganizationEventsMap, Metadata>(
    `Organization$${organizationId}`,
    () => false
  )
    .when('OrganizationCreated', (_, event) => event.metadata.actor == userId)
    .when('UserAddedToOrganization', (state, event) =>
      event.data.userId == userId ? true : state
    )
    .when('UserRemovedFromOrganization', (state, event) =>
      event.data.userId == userId ? false : state
    )
    .when('OrganizationDeleted', () => false);
