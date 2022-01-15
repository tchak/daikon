import { useFetcher } from 'remix';
import { PlusCircleIcon } from '@heroicons/react/outline';

import * as Actions from '~/actions';

export function AddRecordButton({
  bucketId,
  parent,
}: {
  bucketId: string;
  parent?: { fieldId: string; recordId: string };
}) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" replace>
      <input
        type="hidden"
        name="actionType"
        defaultValue={Actions.CreateRecord}
      />
      <input type="hidden" name="bucketId" defaultValue={bucketId} />
      {parent ? (
        <>
          <input
            type="hidden"
            name="parent[recordId]"
            defaultValue={parent.recordId}
          />
          <input
            type="hidden"
            name="parent[fieldId]"
            defaultValue={parent.fieldId}
          />
        </>
      ) : null}
      <button
        type="submit"
        className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <PlusCircleIcon className="h-6 w-6" />
      </button>
    </fetcher.Form>
  );
}
