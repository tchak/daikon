import { useFetcher } from 'remix';
import { useState, FormEvent, useMemo } from 'react';
import { PencilIcon, TrashIcon, EyeOffIcon } from '@heroicons/react/outline';

import { Field } from '~/types';
import { Action } from '~/actions';
import { TabMenu, TabMenuItem } from './TabMenu';
import { NameForm } from './NameForm';

export function FieldTab({
  node,
  versionId,
  viewId,
}: {
  node: Field;
  versionId: string;
  viewId: string;
}) {
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
    return node.name;
  }, [fetcher.type, node.id, node.name]);

  return (
    <li className="flex items-center">
      <div className="flex items-center">
        {isEditing ? (
          <NameForm
            name={node.name}
            onSubmit={(event) => {
              updateName(event);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
            data={{ _action: Action.RenameField, versionId, nodeId: node.id }}
          />
        ) : (
          <div>{name}</div>
        )}
        <NodeMenu
          versionId={versionId}
          viewId={viewId}
          nodeId={node.id}
          rename={() => {
            setTimeout(() => setEditing(true), 50);
          }}
        />
      </div>
    </li>
  );
}

function NodeMenu({
  versionId,
  viewId,
  nodeId,
  rename: renameColumn,
}: {
  versionId: string;
  viewId: string;
  nodeId: string;
  rename: () => void;
}) {
  const fetcher = useFetcher();
  const hideNode = () =>
    fetcher.submit(
      { _action: Action.HideField, viewId, nodeId, hidden: 'true' },
      { method: 'post', replace: true }
    );
  const deleteNode = () =>
    fetcher.submit(
      { _action: Action.DeleteField, versionId, nodeId },
      { method: 'post', replace: true }
    );

  return (
    <TabMenu>
      <TabMenuItem onClick={renameColumn}>
        <PencilIcon className="h-4 w-4 mr-2" />
        Rename field
      </TabMenuItem>
      <TabMenuItem onClick={hideNode} disabled={!!fetcher.submission}>
        <EyeOffIcon className="h-4 w-4 mr-2" />
        Hide field
      </TabMenuItem>
      <TabMenuItem onClick={deleteNode} disabled={!!fetcher.submission}>
        <TrashIcon className="h-4 w-4 mr-2" />
        Delete field
      </TabMenuItem>
    </TabMenu>
  );
}
