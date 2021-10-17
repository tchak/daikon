import type { LoaderFunction, ActionFunction } from 'remix';
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
import { GraphBreadcrumbs } from '~/components/GraphBreadcrumbs';
import { bgColor } from '~/components/utils';
import { query, FindGraphDocument } from '~/urql.server';
import { Edge, BlocEdge, Field, Breadcrumb } from '~/types';
import { processAction } from '~/actions';

type LoaderData = {
  name: string;
  color: string;
  versionId: string;
  leftId: string;
  view: { id: string; name: string };
  fields: ReadonlyArray<Field & { hidden: boolean }>;
  rows: ReadonlyArray<{ id: string }>;
  breadcrumbs: ReadonlyArray<Breadcrumb>;
};

function makeTree(
  edges: readonly Edge[],
  leftId: string,
  inViewEdges: Set<string>
): readonly Field[] {
  return edges
    .filter(({ left }) => left.id == leftId)
    .map(({ id, right }) => ({ ...right, hidden: !inViewEdges.has(id) }));
}

function makeBreadcrumbs(
  edges: readonly BlocEdge[],
  id: string
): readonly Breadcrumb[] {
  const edge = edges.find((edge) => edge.right.id == id);
  if (edge) {
    return [
      [edge.right.name, edge.right.id],
      ...makeBreadcrumbs(edges, edge.left.id),
    ];
  }
  return [];
}

export const loader: LoaderFunction = async ({
  request,
  params,
}): Promise<LoaderData> => {
  const url = new URL(request.url);
  const leftIdParam = url.searchParams.get('l');

  const { graph } = await query(FindGraphDocument, {
    graphId: params.id!,
    leftId: leftIdParam,
  });

  if (graph) {
    const leftId = leftIdParam ?? graph.root.id;
    const inViewEdges = new Set(graph.view.edges.map(({ id }) => id));
    const fields = makeTree(graph.version.edges, leftId, inViewEdges);
    const breadcrumbs = makeBreadcrumbs(graph.version.blocEdges, leftId);

    return {
      name: graph.root.name,
      color: graph.color,
      versionId: graph.version.id,
      leftId,
      view: graph.view,
      fields,
      rows: graph.rows,
      breadcrumbs: [...breadcrumbs, [graph.root.name, null]],
    };
  }
  throw new Error('Not Found');
};

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
  return useMemo<any>(
    () => [
      {
        Header: () => <span>ID</span>,
        id: 'id',
        accessor: (row: T) => row['id'],
        Cell: ({ cell }: CellProps<DataRow>) => <IdCell id={cell.value} />,
      },
      ...fields.map((field) => ({
        Header: () => (
          <FieldTab field={field} versionId={versionId} viewId={viewId} />
        ),
        id: field.id,
        accessor: (row: T) => row[field.id],
        Cell: (params: CellProps<DataRow>) => {
          if (field.__typename == 'BlocField') {
            return <BlocCell {...params} leftId={field.id} />;
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
          <GraphBreadcrumbs breadcrumbs={graph.breadcrumbs} />
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
        <AddRowButton versionId={graph.versionId} />
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
      className="font-mono flex items-center rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
    >
      {id.substring(0, 8)}
      <ClipboardCopyIcon className="h-3 w-3 ml-1" />
    </button>
  );
}

function BlocCell({ leftId }: CellProps<DataRow> & { leftId: string }) {
  const [params, setParams] = useSearchParams();
  return (
    <button
      onClick={() => {
        params.set('l', leftId);
        setParams(params);
      }}
    >
      Open
    </button>
  );
}

function ValueCell({
  cell,
  isSelected,
  isEditing,
  select,
  edit,
}: CellProps<DataRow> & {
  isSelected: boolean;
  isEditing: boolean;
  select: () => void;
  edit: () => void;
}) {
  return isEditing ? (
    <input
      autoFocus
      className="ring-2 ring-offset-2 ring-green-500 absolute inset-0 p-1 outline-none"
    />
  ) : (
    <span
      className={clsx('absolute inset-0', {
        'ring-2 ring-offset-2 ring-green-500': isSelected,
      })}
      onClick={select}
      onDoubleClick={edit}
      tabIndex={0}
    >
      {cell.value}
    </span>
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
