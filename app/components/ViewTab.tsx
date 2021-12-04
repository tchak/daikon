import { useFetcher } from 'remix';
import { useState, FormEvent, useMemo } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/outline';

import { View } from '~/types';
import { ActionType } from '~/actions';
import { TabMenu, TabMenuItem } from './TabMenu';
import { NameForm } from './NameForm';

export function ViewTab({ view }: { view: View }) {
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
          data={{ actionType: ActionType.RenameView, viewId: view.id }}
        />
      ) : (
        <div>{name}</div>
      )}
      <ViewMenu
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
  views,
  view,
  rename: renameView,
}: {
  views: View[];
  view: View;
  rename: () => void;
}) {
  const fetcher = useFetcher();
  const deleteView = () =>
    fetcher.submit(
      { actionType: ActionType.DeleteView, viewId: view.id },
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
