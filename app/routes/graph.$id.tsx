import type { ActionFunction } from 'remix';
import { useLoaderData, useTransition, useFetcher } from 'remix';
import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  DatabaseIcon,
  UserIcon,
  ClipboardCopyIcon,
} from '@heroicons/react/outline';
import type { Column, CellProps } from 'react-table';
import useClipboard from 'react-use-clipboard';
import clsx from 'clsx';

import { GridView, DataRow } from '~/components/GridView';
import { FieldTab } from '~/components/FieldTab';
import { ViewTab } from '~/components/ViewTab';
import { AddFieldButton } from '~/components/AddFieldButton';
import { AddRowButton } from '~/components/AddRowButton';
import { HideFieldsButton } from '~/components/HideFieldsButton';
import { DeleteRowsButton } from '~/components/DeleteRowsButton';
import { BreadcrumbsPanel } from '~/components/GraphBreadcrumbs';
import { bgColor } from '~/utils';
import { Field } from '~/types';
import { ActionType, processAction } from '~/actions';
import { loader, LoaderData } from '~/loaders/graph';

export { loader };
export const action: ActionFunction = ({ request }) => processAction(request);

type UseGridViewColumnsProps = {
  fields: Field[];
  versionId: string;
  leftId: string;
  viewId: string;
};

export function useGridViewColumns<T extends DataRow = DataRow>({
  fields,
  versionId,
  leftId,
  viewId,
}: UseGridViewColumnsProps): Column<T>[] {
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
          <FieldTab field={field} versionId={versionId} viewId={viewId} />
        ),
        id: field.id,
        accessor: (row: T) => row[field.id],
        Cell: (params: CellProps<DataRow>) => {
          const cellId = `${params.cell.row.id}:${field.id}`;
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
              return <BlockFieldCell cell={params.cell} leftId={field.id} />;
            case 'BooleanField':
              return <BooleanFieldCell cell={params.cell} field={field} />;
            default:
              return (
                <TextFieldCell
                  cell={params.cell}
                  field={field}
                  {...selection}
                />
              );
          }
        },
      })),
      {
        Header: () => <AddFieldButton versionId={versionId} leftId={leftId} />,
        id: 'add-column',
        Cell: () => null,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // eslint-disable-next-line react-hooks/exhaustive-deps
      fields
        .map(({ id, __typename, name }) => `${id}${__typename}${name}`)
        .join(','),
      versionId,
      selectedCell,
    ]
  );
}

export default function GraphRoute() {
  const graph = useLoaderData<LoaderData>();
  const columns = useGridViewColumns({
    fields: graph.fields.filter(({ hidden }) => !hidden),
    versionId: graph.versionId,
    leftId: graph.leftId,
    viewId: graph.view.id,
  });
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  return (
    <div className="flex flex-col h-screen">
      <Header name={graph.name} color={graph.color} />

      <div className="flex items-center p-2 border-b border-gray-300">
        <ViewTab view={graph.view} />
        <HideFieldsButton viewId={graph.view.id} fields={graph.fields} />
        <DeleteRowsButton selectedRows={selectedRows} />
      </div>

      {graph.breadcrumbs.length > 1 ? (
        <div className="p-2 border-b border-gray-300">
          <BreadcrumbsPanel breadcrumbs={graph.breadcrumbs} />
        </div>
      ) : null}

      <div className="flex-grow overflow-y-scroll">
        <GridView
          columns={columns}
          data={graph.rows}
          onSelect={(rowIds) => setSelectedRows(rowIds)}
        />
      </div>

      <div className="p-2 border-t border-gray-300">
        {graph.parentId || graph.breadcrumbs.length == 1 ? (
          <AddRowButton
            versionId={graph.versionId}
            parent={
              graph.parentId
                ? { id: graph.parentId, fieldId: graph.leftId }
                : undefined
            }
          />
        ) : null}
      </div>
    </div>
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
  field: Field;
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
  field: Field;
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

function Header({ name, color }: { name: string; color: string }) {
  const transition = useTransition();
  return (
    <header
      className={`flex items-center justify-between ${bgColor(color)} p-2`}
    >
      <Link to="/" className="text-white">
        <DatabaseIcon className="h-5 w-5" />
      </Link>
      <span className="text-xs text-white w-32 ml-4">
        {transition.state == 'submitting' ? 'Saving...' : null}
      </span>
      <h1 className="flex-1 text-center text-white">{name}</h1>
      <span className="w-32"></span>
      <Link to="/account">
        <UserIcon className="h-5 w-5" />
      </Link>
    </header>
  );
}
