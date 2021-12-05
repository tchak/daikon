import type { ActionFunction } from 'remix';
import { useLoaderData, useTransition } from 'remix';
import { useState, useMemo } from 'react';
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
import { processAction } from '~/actions';
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
          if (field.__typename == 'BlockField') {
            return <BlockCell {...params} leftId={field.id} />;
          }
          return (
            <ValueCell
              {...params}
              isSelected={selectedCell == `${params.cell.row.id}:${field.id}`}
              isEditing={
                selectedCell == `${params.cell.row.id}:${field.id}:editing`
              }
              select={() =>
                setSelectedCell(`${params.cell.row.id}:${field.id}`)
              }
              edit={() =>
                setSelectedCell(`${params.cell.row.id}:${field.id}:editing`)
              }
              doneEditing={() =>
                setSelectedCell(`${params.cell.row.id}:${field.id}`)
              }
            />
          );
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
  const data: readonly Record<string, unknown>[] = graph.rows;
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
          data={data}
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

function BlockCell({
  cell: {
    row: { values },
  },
  leftId,
}: CellProps<DataRow> & { leftId: string }) {
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

function ValueCell({
  cell,
  isSelected,
  isEditing,
  select,
  edit,
  doneEditing,
}: CellProps<DataRow> & {
  isSelected: boolean;
  isEditing: boolean;
  select: () => void;
  edit: () => void;
  doneEditing: () => void;
}) {
  return isEditing ? (
    <input
      autoFocus
      onBlur={() => doneEditing()}
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
