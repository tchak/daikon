import { useLoaderData, useTransition } from 'remix';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DatabaseIcon, UserIcon } from '@heroicons/react/outline';
import type { Column, CellProps } from 'react-table';

import { GridView, DataRow } from '~/components/GridView';
import { FieldTab } from '~/components/FieldTab';
import { ViewTab } from '~/components/ViewTab';
import { AddFieldButton } from '~/components/AddFieldButton';
import { AddRowButton } from '~/components/AddRowButton';
import { HideFieldsButton } from '~/components/HideFieldsButton';
import { DeleteRowsButton } from '~/components/DeleteRowsButton';
import { BreadcrumbsPanel } from '~/components/GraphBreadcrumbs';
import { IdCell, FieldCell } from '~/components/FieldCell';
import { bgColor } from '~/utils';
import { action } from '~/actions';
import { loader, LoaderData } from '~/loaders/graph';

export { loader, action };

export default function GraphRoute() {
  const graph = useLoaderData<LoaderData>();
  const columns = useTableColumns({
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
      <Link to="/account" className="text-white">
        <UserIcon className="h-5 w-5" />
      </Link>
    </header>
  );
}

function useTableColumns<T extends DataRow = DataRow>({
  fields,
  versionId,
  leftId,
  viewId,
}: {
  fields: { id: string; name: string; __typename: string }[];
  versionId: string;
  leftId: string;
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
          <FieldTab field={field} versionId={versionId} viewId={viewId} />
        ),
        id: field.id,
        accessor: (row: T) => row[field.id],
        Cell: ({ cell }: CellProps<DataRow>) => (
          <FieldCell
            cell={cell}
            field={field}
            selectedCell={selectedCell}
            setSelectedCell={setSelectedCell}
          />
        ),
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
