import invariant from 'tiny-invariant';

import type { EventStore } from '~/util/aggregate-root';
import { Metadata, OrganizationEventsMap, BucketEventsMap } from '~/events';
import { isAuthorizedOrganization, isAuthorizedBucket } from './organization';

type CreateBucket = {
  organizationId: string;
};

export function createBucket(command: CreateBucket, actor?: string) {
  return async <Context>(
    eventStore: EventStore<Context, OrganizationEventsMap, Metadata>
  ) => {
    invariant(actor, 'Actor required');
    const isAuthorized = await isAuthorizedOrganization(
      eventStore,
      command.organizationId,
      actor,
      'Owner'
    );
    invariant(isAuthorized, 'Unauthorized Organization');
  };
}

type UpdateBucket = {
  bucketId: string;
};

export function updateBucket(command: UpdateBucket, actor?: string) {
  return async <Context>(
    eventStore: EventStore<
      Context,
      BucketEventsMap & OrganizationEventsMap,
      Metadata
    >
  ) => {
    invariant(actor, 'Actor required');
    const isAuthorized = await isAuthorizedBucket(
      eventStore,
      command.bucketId,
      actor,
      'Owner'
    );
    invariant(isAuthorized, 'Unauthorized Bucket');
  };
}
