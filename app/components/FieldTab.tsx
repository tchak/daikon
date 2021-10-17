import { useFetcher } from 'remix';
import { useState, FormEvent, useMemo } from 'react';
import { PencilIcon, TrashIcon, EyeOffIcon } from '@heroicons/react/outline';
import { pipe } from 'fp-ts/function';
import S from 'fp-ts-std/String';

import { Field } from '~/types';
import { Action } from '~/actions';
import { TabMenu, TabMenuItem } from './TabMenu';
import { NameForm } from './NameForm';

export function FieldTab({
  field,
  versionId,
  viewId,
}: {
  field: Field;
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
    return field.name;
  }, [fetcher.type, field.id, field.name]);

  return (
    <li className="flex items-center">
      <div className="flex items-center">
        {isEditing ? (
          <NameForm
            name={field.name}
            onSubmit={(event) => {
              updateName(event);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
            data={{ _action: Action.RenameField, versionId, nodeId: field.id }}
          />
        ) : (
          <div title={name}>{truncate(15)(name)}</div>
        )}
        <FieldMenu
          versionId={versionId}
          viewId={viewId}
          nodeId={field.id}
          rename={() => {
            setTimeout(() => setEditing(true), 50);
          }}
        />
      </div>
    </li>
  );
}

function FieldMenu({
  versionId,
  viewId,
  nodeId,
  rename: renameField,
}: {
  versionId: string;
  viewId: string;
  nodeId: string;
  rename: () => void;
}) {
  const fetcher = useFetcher();
  const hideField = () =>
    fetcher.submit(
      { _action: Action.HideField, viewId, nodeId, hidden: 'true' },
      { method: 'post', replace: true }
    );
  const deleteField = () =>
    fetcher.submit(
      { _action: Action.DeleteField, versionId, nodeId },
      { method: 'post', replace: true }
    );

  return (
    <TabMenu>
      <TabMenuItem onClick={renameField}>
        <PencilIcon className="h-4 w-4 mr-2" />
        Rename field
      </TabMenuItem>
      <TabMenuItem onClick={hideField} disabled={!!fetcher.submission}>
        <EyeOffIcon className="h-4 w-4 mr-2" />
        Hide field
      </TabMenuItem>
      <TabMenuItem onClick={deleteField} disabled={!!fetcher.submission}>
        <TrashIcon className="h-4 w-4 mr-2" />
        Delete field
      </TabMenuItem>
    </TabMenu>
  );
}

function truncate(size: number, elipse = '...'): (str: string) => string {
  return (str) =>
    str.length > size ? pipe(str, S.takeLeft(size), S.append(elipse)) : str;
}
