import { useFetcher } from 'remix';
import { PlusCircleIcon } from '@heroicons/react/outline';

import { ActionType } from '~/actions';

export function AddRowButton({
  versionId,
  parent,
}: {
  versionId: string;
  parent?: { id: string; fieldId: string };
}) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" replace>
      <input
        type="hidden"
        name="actionType"
        defaultValue={ActionType.CreateRow}
      />
      <input type="hidden" name="versionId" defaultValue={versionId} />
      {parent ? (
        <>
          <input type="hidden" name="parent[id]" defaultValue={parent.id} />
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
