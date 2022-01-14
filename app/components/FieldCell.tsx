import { useFetcher } from 'remix';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Column, CellProps } from 'react-table';
import clsx from 'clsx';
import { ClipboardCopyIcon } from '@heroicons/react/outline';
import useClipboard from 'react-use-clipboard';

import type { DataRow } from './GridView';
import { AddFieldButton } from './AddFieldButton';
import { FieldTab } from './FieldTab';
import * as Actions from '~/actions';

export function useTableColumns<T extends DataRow = DataRow>({
  fields,
  bucketId,
  viewId,
  parentId,
}: {
  fields: { id: string; name: string; type: string }[];
  parentId?: string;
  bucketId: string;
  viewId: string;
}): Column<T>[] {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  return useMemo<Column<T>[]>(
    () => [
      {
        Header: () => <span>ID</span>,
        id: 'id',
        accessor: (row: T) => row['id'],
        Cell: ({ cell }: CellProps<DataRow>) => (
          <IdCell id={cell.value as string} />
        ),
      },
      ...fields.map((field) => ({
        Header: () => (
          <FieldTab
            bucketId={bucketId}
            viewId={viewId}
            fieldId={field.id}
            name={field.name}
          />
        ),
        id: field.id,
        accessor: (row: T) => row[field.id],
        Cell: ({ cell }: CellProps<DataRow>) => (
          <FieldCell
            cell={cell}
            fieldId={field.id}
            fieldType={field.type}
            selectedCell={selectedCell}
            setSelectedCell={setSelectedCell}
          />
        ),
      })),
      {
        Header: () => (
          <AddFieldButton bucketId={bucketId} parentId={parentId} />
        ),
        id: 'add-column',
        Cell: () => null,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // eslint-disable-next-line react-hooks/exhaustive-deps
      fields.map(({ id, type, name }) => `${id}${type}${name}`).join(','),
      bucketId,
      selectedCell,
    ]
  );
}

function IdCell({ id }: { id: string }) {
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

function FieldCell({
  cell,
  fieldId,
  fieldType,
  selectedCell,
  setSelectedCell,
}: {
  cell: CellProps<DataRow>['cell'];
  fieldId: string;
  fieldType: string;
  selectedCell: string | null;
  setSelectedCell: (selectedCell: string) => void;
}) {
  const cellId = `${cell.row.id}:${fieldId}`;
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
  switch (fieldType) {
    case 'BLOCK':
      return <BlockFieldCell cell={cell} fieldId={fieldId} />;
    case 'BOOLEAN':
      return <BooleanFieldCell cell={cell} fieldId={fieldId} />;
    default:
      return (
        <TextFieldCell
          cell={cell}
          fieldId={fieldId}
          fieldType={fieldType}
          {...selection}
        />
      );
  }
}

function BlockFieldCell({
  cell: {
    row: { values },
  },
  fieldId,
}: {
  cell: CellProps<DataRow>['cell'];
  fieldId: string;
}) {
  const [params, setParams] = useSearchParams();
  return (
    <button
      type="button"
      className="p-1 font-mono flex items-center rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      onClick={() => {
        params.set('p', `${fieldId}:${values['id']}`);
        setParams(params);
      }}
    >
      open
    </button>
  );
}

function TextFieldCell({
  fieldId,
  fieldType,
  cell,
  isSelected,
  isEditing,
  select,
  edit,
  done,
}: {
  cell: CellProps<DataRow>['cell'];
  fieldId: string;
  fieldType: string;
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
            actionType: Actions.UpdateRecord,
            rowId: cell.row.values['id'],
            fieldId,
            type: fieldType,
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
  fieldId,
}: {
  cell: CellProps<DataRow>['cell'];
  fieldId: string;
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
            actionType: Actions.UpdateRecord,
            rowId: cell.row.values['id'],
            fieldId,
            type: 'BOOLEAN',
            value: value ? 'true' : 'false',
          },
          { method: 'post', replace: true }
        );
      }}
    />
  );
}
