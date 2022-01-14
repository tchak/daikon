import { useFetcher } from 'remix';
import { useState, FormEvent, useMemo } from 'react';
import { PencilIcon, TrashIcon, EyeOffIcon } from '@heroicons/react/outline';
import truncate from 'truncate';

import * as Actions from '~/actions';
import { TabMenu, TabMenuItem } from './TabMenu';
import { NameForm } from './NameForm';

type FieldTabProps = {
  bucketId: string;
  viewId: string;
  fieldId: string;
  name: string;
};

export function FieldTab({ name: fieldName, ...props }: FieldTabProps) {
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
    return fieldName;
  }, [fetcher.type, props.fieldId, fieldName]);

  return (
    <li className="flex items-center">
      <div className="flex items-center">
        {isEditing ? (
          <NameForm
            name={fieldName}
            onSubmit={(event) => {
              updateName(event);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
            data={{
              actionType: Actions.RenameField,
              ...props,
            }}
          />
        ) : (
          <div title={name}>{truncate(name, 15)}</div>
        )}
        <FieldMenu
          {...props}
          rename={() => {
            setTimeout(() => setEditing(true), 50);
          }}
        />
      </div>
    </li>
  );
}

function FieldMenu({
  bucketId,
  viewId,
  fieldId,
  rename: renameField,
}: {
  bucketId: string;
  viewId: string;
  fieldId: string;
  rename: () => void;
}) {
  const fetcher = useFetcher();
  const hideField = () =>
    fetcher.submit(
      {
        actionType: Actions.HideField,
        bucketId,
        viewId,
        fieldId,
        hidden: 'true',
      },
      { method: 'post', replace: true }
    );
  const deleteField = () =>
    fetcher.submit(
      { actionType: Actions.DeleteField, bucketId, fieldId },
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
