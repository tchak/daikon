import { useFetcher } from 'remix';
import { TrashIcon } from '@heroicons/react/outline';

import * as Actions from '~/actions';

export function DeleteRecordsButton({
  bucketId,
  selected,
}: {
  bucketId: string;
  selected: string[];
}) {
  const fetcher = useFetcher();
  if (selected.length == 0 || fetcher.state == 'submitting') {
    return null;
  }
  return (
    <div className="text-xs ml-2">
      <fetcher.Form method="post" replace>
        <input type="hidden" name="actionType" value={Actions.DeleteRecords} />
        <input type="hidden" name="bucketId" value={bucketId} />
        <input type="hidden" name="recordIds" value={selected.join(',')} />
        <button
          type="submit"
          className="flex items-center text-xs focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <TrashIcon className="h-3 w-3 mr-1" />
          Delete {selected.length} {selected.length > 1 ? 'rows' : 'row'}
        </button>
      </fetcher.Form>
    </div>
  );
}
