import { z } from 'zod';

import { prisma, DB } from './db.server';
import * as User from '~/aggregates/user.commands';
import * as Organization from '~/aggregates/organization.commands';
import * as Bucket from '~/aggregates/bucket.commands';
import { UserProjection } from '~/aggregates/user.projection';
import { OrganizationProjection } from '~/aggregates/organization.projection';
import { BucketProjection } from '~/aggregates/bucket.projection';
import { RecordProjection } from '~/aggregates/record.projection';

import {
  Metadata,
  UserEventsMap,
  OrganizationEventsMap,
  BucketEventsMap,
  RecordEventsMap,
} from '~/events';
import * as Actions from '~/actions';
import { createPrismaEventStore } from './event-store.prisma.server';

const RegisterUser = z.object({
  actionType: z.literal(Actions.RegisterUser),
  email: z.string().email(),
});
const CreateOrganization = z.object({
  actionType: z.literal(Actions.CreateOrganization),
  name: z.string(),
});
const CreateBucket = z.object({
  actionType: z.literal(Actions.CreateBucket),
  organizationId: z.string().uuid(),
  name: z.string().nonempty(),
  color: z.string().nonempty(),
});
const DeleteBucket = z.object({
  actionType: z.literal(Actions.DeleteBucket),
  bucketId: z.string().uuid(),
});
const CreateField = z.object({
  actionType: z.literal(Actions.CreateField),
  bucketId: z.string().uuid(),
  name: z.string().nonempty(),
});
const RenameField = z.object({
  actionType: z.literal(Actions.RenameField),
  bucketId: z.string().uuid(),
  fieldId: z.string().uuid(),
  name: z.string().nonempty(),
});
const SetFieldDescription = z.object({
  actionType: z.literal(Actions.SetFieldDescription),
  bucketId: z.string().uuid(),
  fieldId: z.string().uuid(),
  description: z.string().nonempty(),
});
const DeleteField = z.object({
  actionType: z.literal(Actions.DeleteField),
  bucketId: z.string().uuid(),
  fieldId: z.string().uuid(),
});
const HideField = z.object({
  actionType: z.literal(Actions.HideField),
  bucketId: z.string().uuid(),
  viewId: z.string().uuid(),
  fieldId: z.string().uuid(),
  hidden: z.string().transform((checked) => checked == 'true'),
});
const RenameView = z.object({
  actionType: z.literal(Actions.RenameView),
  bucketId: z.string().uuid(),
  viewId: z.string().uuid(),
  name: z.string().nonempty(),
});
const SetViewDescription = z.object({
  actionType: z.literal(Actions.SetViewDescription),
  bucketId: z.string().uuid(),
  viewId: z.string().uuid(),
  description: z.string().nonempty(),
});
const Action = z.union([
  RegisterUser,
  CreateOrganization,
  CreateBucket,
  DeleteBucket,
  CreateField,
  RenameField,
  SetFieldDescription,
  DeleteField,
  HideField,
  RenameView,
  SetViewDescription,
]);

function getEventStore(db: DB, subscriptions = true) {
  const eventStore = createPrismaEventStore<
    UserEventsMap & OrganizationEventsMap & BucketEventsMap & RecordEventsMap,
    Metadata
  >(db);

  if (subscriptions) {
    UserProjection(eventStore.scope());
    OrganizationProjection(eventStore.scope());
    BucketProjection(eventStore.scope());
    RecordProjection(eventStore.scope());

    eventStore.subscribe(['OrganizationCreated'], (event) =>
      eventStore.link(
        [event.eventId],
        `Organization${event.data.organizationId}`
      )
    );
    eventStore.subscribe(
      ['UserAddedToOrganization', 'UserRemovedFromOrganization'],
      async (event) => {
        await eventStore.link([event.eventId], `User${event.data.userId}`);
        await eventStore.link(
          [event.eventId],
          `Organization${event.data.organizationId}`
        );
      }
    );
  }

  return eventStore;
}

export function getEvents() {
  return getEventStore(prisma, false).read().toArray();
}

export async function executeCommand(form: FormData, actor?: string) {
  const data = Action.parse(Object.fromEntries(form));

  return prisma.$transaction(async (db) => {
    const eventStore = getEventStore(db);
    switch (data.actionType) {
      case 'RegisterUser':
        return await User.createUser(eventStore.scope())(data, { actor });
      case 'CreateOrganization':
        return Organization.createOrganization(eventStore.scope())(data, {
          actor,
        });
      case 'CreateBucket':
        return Bucket.createBucket(eventStore.scope())(data, { actor });
      case 'DeleteBucket':
        return Bucket.deleteBucket(eventStore.scope())(data, { actor });
      case 'CreateField':
        return Bucket.createField(eventStore.scope())(data, { actor });
      case 'RenameField':
      case 'SetFieldDescription':
        return Bucket.updateField(eventStore.scope())(data, { actor });
      case 'DeleteField':
        return Bucket.deleteField(eventStore.scope())(data, { actor });
      case 'HideField':
        return Bucket.hideField(eventStore.scope())(data, { actor });
      case 'RenameView':
      case 'SetViewDescription':
        return Bucket.updateView(eventStore.scope())(data, { actor });
    }
  });
}
