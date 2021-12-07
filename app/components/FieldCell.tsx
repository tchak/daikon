import { useFetcher } from 'remix';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { CellProps } from 'react-table';
import clsx from 'clsx';
import { ClipboardCopyIcon } from '@heroicons/react/outline';
import useClipboard from 'react-use-clipboard';

import { DataRow } from './GridView';
import { ActionType } from '~/actions';

export function IdCell({ id }: { id: string }) {
  const [, setCopied] = useClipboard(id, { successDuration: 1000 });
  return (
    <button
      type="button"
      onClick={setCopied}
      className="p-1 font-mono flex items-center rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
    >
      {id.substring(0, 8)}
      <ClipboardCopyIcon className="h-3 w-3 ml-1" />
    </button>
  );
}

export function FieldCell({
  cell,
  field,
  selectedCell,
  setSelectedCell,
}: {
  cell: CellProps<DataRow>['cell'];
  field: { id: string; __typename: string };
  selectedCell: string | null;
  setSelectedCell: (selectedCell: string) => void;
}) {
  const cellId = `${cell.row.id}:${field.id}`;
  const selection = useMemo(
    () => ({
      isSelected: selectedCell == cellId,
      isEditing: selectedCell == `${cellId}:editing`,
      select: () => setSelectedCell(cellId),
      edit: () => setSelectedCell(`${cellId}:editing`),
      done: () => setSelectedCell(cellId),
    }),
    [cellId]
  );
  switch (field.__typename) {
    case 'BlockField':
      return <BlockFieldCell cell={cell} leftId={field.id} />;
    case 'BooleanField':
      return <BooleanFieldCell cell={cell} field={field} />;
    default:
      return <TextFieldCell cell={cell} field={field} {...selection} />;
  }
}

function BlockFieldCell({
  cell: {
    row: { values },
  },
  leftId,
}: {
  cell: CellProps<DataRow>['cell'];
  leftId: string;
}) {
  const [params, setParams] = useSearchParams();
  return (
    <button
      type="button"
      className="p-1 font-mono flex items-center rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      onClick={() => {
        params.set('p', `${leftId}:${values['id']}`);
        setParams(params);
      }}
    >
      open
    </button>
  );
}

function TextFieldCell({
  field,
  cell,
  isSelected,
  isEditing,
  select,
  edit,
  done,
}: {
  cell: CellProps<DataRow>['cell'];
  field: { id: string; __typename: string };
  isSelected: boolean;
  isEditing: boolean;
  select: () => void;
  edit: () => void;
  done: () => void;
}) {
  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.type == 'done') {
      done();
    }
  }, [fetcher.type, done]);
  const value =
    fetcher.type == 'actionSubmission' || fetcher.type == 'actionReload'
      ? fetcher.submission.formData.get('value')
      : cell.value;

  return isEditing ? (
    <input
      type="text"
      autoFocus
      onBlur={(event) => {
        const value = event.target.value;
        fetcher.submit(
          {
            actionType: ActionType.UpdateCell,
            rowId: cell.row.values['id'],
            fieldId: field.id,
            type: field.__typename.replace('Field', '').toUpperCase(),
            value,
          },
          { method: 'post', replace: true }
        );
      }}
      defaultValue={value}
      className="ring-2 ring-offset-2 ring-green-500 outline-none w-full p-1"
    />
  ) : (
    <div
      className={clsx('w-full h-full p-1', {
        'ring-2 ring-offset-2 ring-green-500': isSelected,
      })}
      onClick={select}
      onDoubleClick={edit}
      tabIndex={0}
    >
      {cell.value}
      {'\u00A0'}
    </div>
  );
}

function BooleanFieldCell({
  cell,
  field,
}: {
  cell: CellProps<DataRow>['cell'];
  field: { id: string };
}) {
  const fetcher = useFetcher();
  const checked =
    fetcher.type == 'actionSubmission' || fetcher.type == 'actionReload'
      ? fetcher.submission.formData.get('value') == 'true'
      : cell.value == true;
  return (
    <input
      type="checkbox"
      className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
      defaultChecked={checked}
      onChange={(event) => {
        const value = event.target.checked;
        fetcher.submit(
          {
            actionType: ActionType.UpdateCell,
            rowId: cell.row.values['id'],
            fieldId: field.id,
            type: 'BOOLEAN',
            value: value ? 'true' : 'false',
          },
          { method: 'post', replace: true }
        );
      }}
    />
  );
}
