import { useFetcher } from 'remix';
import { useState, FormEvent, useMemo } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/outline';

import { TabMenu, TabMenuItem } from './TabMenu';
import { NameForm } from './NameForm';
import * as Actions from '~/actions';

type View = {
  id: string;
  name: string;
};

export function ViewTab({ view, bucketId }: { bucketId: string; view: View }) {
  const [isEditing, setEditing] = useState(false);
  const fetcher = useFetcher();
  const updateName = (event: FormEvent<HTMLFormElement>) =>
    fetcher.submit(event.currentTarget, {
      method: 'post',
      replace: true,
    });
  const name = useMemo(() => {
    if (fetcher.type == 'actionSubmission' || fetcher.type == 'actionReload') {
      return fetcher.submission.formData.get('name') as string;
    }
    return view.name;
  }, [fetcher.type, view.id, view.name]);

  return (
    <div className="flex items-center px-1 text-sm mr-2">
      {isEditing ? (
        <NameForm
          name={view.name}
          onSubmit={(event) => {
            updateName(event);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
          data={{ actionType: Actions.RenameView, bucketId, viewId: view.id }}
        />
      ) : (
        <div>{name}</div>
      )}
      <ViewMenu
        bucketId={bucketId}
        view={view}
        views={[]}
        rename={() => {
          setTimeout(() => setEditing(true), 50);
        }}
      />
    </div>
  );
}

function ViewMenu({
  bucketId,
  views,
  view,
  rename: renameView,
}: {
  bucketId: string;
  views: View[];
  view: View;
  rename: () => void;
}) {
  const fetcher = useFetcher();
  const deleteView = () =>
    fetcher.submit(
      { actionType: Actions.DeleteView, bucketId, viewId: view.id },
      { method: 'post', replace: true }
    );

  return (
    <TabMenu>
      <TabMenuItem onClick={renameView}>
        <PencilIcon className="h-4 w-4 mr-2" />
        Rename view
      </TabMenuItem>
      {views.length > 1 ? (
        <TabMenuItem
          onClick={deleteView}
          disabled={fetcher.state == 'submitting'}
        >
          <TrashIcon className="h-4 w-4 mr-2" />
          Delete view
        </TabMenuItem>
      ) : null}
    </TabMenu>
  );
}
