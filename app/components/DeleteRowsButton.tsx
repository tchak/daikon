import { useFetcher } from 'remix';
import { TrashIcon } from '@heroicons/react/outline';

import { Action } from '~/actions';

export function DeleteRowsButton({
  graphId,
  selectedRows,
}: {
  graphId: string;
  selectedRows: string[];
}) {
  const fetcher = useFetcher();
  if (selectedRows.length == 0 || fetcher.state == 'submitting') {
    return null;
  }
  return (
    <div className="text-xs ml-2">
      <fetcher.Form method="post" replace>
        <input type="hidden" name="_action" value={Action.DeleteRows} />
        <input type="hidden" name="graphId" value={graphId} />
        {selectedRows.map((rowId) => (
          <input type="hidden" name="rowIds[]" value={rowId} key={rowId} />
        ))}
        <button
          type="submit"
          className="flex items-center text-xs focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <TrashIcon className="h-3 w-3 mr-1" />
          Delete {selectedRows.length}{' '}
          {selectedRows.length > 1 ? 'rows' : 'row'}
        </button>
      </fetcher.Form>
    </div>
  );
}
