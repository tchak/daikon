import { useFetcher } from 'remix';
import { PlusCircleIcon } from '@heroicons/react/outline';

import { Action } from '~/actions';

export function AddRowButton({ versionId }: { versionId: string }) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" replace>
      <input type="hidden" name="_action" defaultValue={Action.CreateRow} />
      <input type="hidden" name="versionId" defaultValue={versionId} />
      <button
        type="submit"
        className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <PlusCircleIcon className="h-6 w-6" />
      </button>
    </fetcher.Form>
  );
}
