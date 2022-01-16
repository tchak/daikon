import { z } from 'zod';

import { hash } from '~/util/argon2.server';
import { prisma, DB } from './db.server';
import * as User from '~/aggregates/user.commands';
import * as Organization from '~/aggregates/organization.commands';
import * as Bucket from '~/aggregates/bucket.commands';
import * as Record from '~/aggregates/record.commands';

import * as BucketPolicy from '~/aggregates/bucket.policy';

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
  password: z.string().min(6),
});
const CreateOrganization = z.object({
  actionType: z.literal(Actions.CreateOrganization),
  name: z.string().nonempty(),
});
const CreateBucket = z.object({
  actionType: z.literal(Actions.CreateBucket),
  organizationId: z.string().uuid(),
  name: z.string().nonempty(),
  color: z.string().nonempty(),
});
const RenameBucket = z.object({
  actionType: z.literal(Actions.RenameBucket),
  bucketId: z.string().uuid(),
  name: z.string().nonempty(),
});
const SetBucketDescription = z.object({
  actionType: z.literal(Actions.SetBucketDescription),
  bucketId: z.string().uuid(),
  description: z.string(),
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
  description: z.string(),
});
const DeleteField = z.object({
  actionType: z.literal(Actions.DeleteField),
  bucketId: z.string().uuid(),
  fieldId: z.string().uuid(),
});
const CreateView = z.object({
  actionType: z.literal(Actions.CreateView),
  bucketId: z.string().uuid(),
  name: z.string().nonempty(),
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
  description: z.string(),
});
const DeleteView = z.object({
  actionType: z.literal(Actions.DeleteView),
  bucketId: z.string().uuid(),
  viewId: z.string().uuid(),
});
const CreateRecord = z.object({
  actionType: z.literal(Actions.CreateRecord),
  bucketId: z.string().uuid(),
});
const DeleteRecord = z.object({
  actionType: z.literal(Actions.DeleteRecord),
  bucketId: z.string().uuid(),
  recordId: z.string().uuid(),
});
const DeleteRecords = z.object({
  actionType: z.literal(Actions.DeleteRecords),
  bucketId: z.string().uuid(),
  recordIds: z.string().transform((recordIds) => recordIds.split(',')),
});
const Action = z.union([
  RegisterUser,
  CreateOrganization,
  CreateBucket,
  RenameBucket,
  SetBucketDescription,
  DeleteBucket,
  CreateField,
  RenameField,
  SetFieldDescription,
  DeleteField,
  CreateView,
  HideField,
  RenameView,
  SetViewDescription,
  DeleteView,
  CreateRecord,
  DeleteRecord,
  DeleteRecords,
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

    eventStore.subscribe(
      ['OrganizationCreated', 'UserAddedToOrganization'],
      async (event) => {
        if (event.metadata.linkTo) {
          await eventStore.link([event.eventId], event.metadata.linkTo);
        }
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
      case 'CreateBucket':
        await BucketPolicy.createBucket(data, actor)(eventStore.scope());
        break;
      case 'RegisterUser':
      case 'CreateOrganization':
        break;
      default:
        await BucketPolicy.updateBucket(data, actor)(eventStore.scope());
    }

    switch (data.actionType) {
      case 'RegisterUser':
        return User.createUser(eventStore.scope())(data, { actor }).then(
          async (aggregate) => {
            await eventStore.db.user.update({
              where: { id: aggregate.id },
              data: { password: await hash(data.password) },
            });
            return aggregate;
          }
        );
      case 'CreateOrganization':
        return Organization.createOrganization(eventStore.scope())(
          { ...data, userId: String(actor) },
          { actor }
        );
      case 'CreateBucket':
        return Bucket.createBucket(eventStore.scope())(data, { actor });
      case 'RenameBucket':
      case 'SetBucketDescription':
        return Bucket.updateBucket(eventStore.scope())(data, { actor });
      case 'DeleteBucket':
        return Bucket.deleteBucket(eventStore.scope())(data, { actor });
      case 'CreateField':
        return Bucket.createField(eventStore.scope())(data, { actor });
      case 'RenameField':
      case 'SetFieldDescription':
        return Bucket.updateField(eventStore.scope())(data, { actor });
      case 'DeleteField':
        return Bucket.deleteField(eventStore.scope())(data, { actor });
      case 'CreateView':
        return Bucket.createView(eventStore.scope())(data, { actor });
      case 'HideField':
        return Bucket.hideFieldInView(eventStore.scope())(data, { actor });
      case 'RenameView':
      case 'SetViewDescription':
        return Bucket.updateView(eventStore.scope())(data, { actor });
      case 'DeleteView':
        return Bucket.deleteView(eventStore.scope())(data, { actor });
      case 'CreateRecord':
        return Record.createRecord(eventStore.scope())(data, { actor });
      case 'DeleteRecord':
        return Record.deleteRecord(eventStore.scope())(data, { actor });
      case 'DeleteRecords':
        return (async () => {
          const [recordId, ...recordIds] = data.recordIds;
          for (const recordId of recordIds) {
            await Record.deleteRecord(eventStore.scope())(
              { recordId, bucketId: data.bucketId },
              { actor }
            );
          }
          return Record.deleteRecord(eventStore.scope())(
            { recordId, bucketId: data.bucketId },
            { actor }
          );
        })();
    }
  });
}
