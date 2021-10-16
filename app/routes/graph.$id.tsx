import type { LoaderFunction, ActionFunction } from 'remix';
import { useLoaderData, useTransition } from 'remix';
import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  DatabaseIcon,
  UserIcon,
  ClipboardCopyIcon,
} from '@heroicons/react/outline';
import type { Column, CellProps } from 'react-table';
import useClipboard from 'react-use-clipboard';

import { GridView, DataRow } from '~/components/GridView';
import { FieldTab } from '~/components/FieldTab';
import { ViewTab } from '~/components/ViewTab';
import { AddFieldButton } from '~/components/AddFieldButton';
import { AddRowButton } from '~/components/AddRowButton';
import { HideFieldsButton } from '~/components/HideFieldsButton';
import { DeleteRowsButton } from '~/components/DeleteRowsButton';
import { bgColor } from '~/components/utils';
import { query, FindGraphDocument } from '~/urql.server';
import { Graph, Edge, Field } from '~/types';
import { processAction } from '~/actions';

type Breadcrumb = readonly [name: string, open: () => void];
type Breadcrumbs = Breadcrumb[];

export const loader: LoaderFunction = async ({ params }) => {
  const { graph } = await query(FindGraphDocument, { graphId: params.id });
  if (graph) {
    return graph;
  }
  throw new Error('Not Found');
};

export const action: ActionFunction = ({ request }) => processAction(request);

function makeTree(
  edges: readonly Edge[],
  leftId: string,
  inViewEdges: Set<string>
): Field[] {
  return edges
    .filter(({ left }) => left.id == leftId)
    .map(({ id, right }) => ({ ...right, hidden: !inViewEdges.has(id) }));
}

function makeBreadcrumbs(
  edges: readonly Edge[],
  id: string,
  setId: (key: string) => void
): Breadcrumbs {
  const edge = edges.find((edge) => edge.right.id == id);
  if (edge) {
    return [
      [edge.right.name, () => setId(edge.right.id)],
      ...makeBreadcrumbs(edges, edge.left.id, setId),
    ];
  }
  return [];
}

function useTree(graph: Graph): {
  leftId: string;
  nodes: Field[];
  breadcrumbs: Breadcrumbs;
  open: (node: Field) => void;
  close: () => void;
} {
  const edges = graph.version.edges;
  const [leftId, setLeftId] = useState<string>(graph.root.id);
  const close = useCallback(() => setLeftId(graph.root.id), [graph.id]);
  const breadcrumbs: Breadcrumbs = useMemo(
    () => [
      ...makeBreadcrumbs(edges, leftId, setLeftId),
      [graph.root.name, close],
    ],
    [graph.id, leftId]
  );
  const inViewEdges = new Set(graph.view.edges.map(({ id }) => id));

  return {
    leftId,
    nodes: makeTree(edges, leftId, inViewEdges),
    breadcrumbs,
    open: (node) => setLeftId(node.id),
    close,
  };
}

export function useGridViewColumns<T extends DataRow = DataRow>(
  nodes: Field[],
  versionId: string,
  leftId: string,
  viewId: string
): Column<T>[] {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  return useMemo<any>(
    () => [
      {
        Header: () => <span>ID</span>,
        id: 'id',
        accessor: (row: T) => row['id'],
        Cell: ({ cell }: CellProps<DataRow>) => <IdCell id={cell.value} />,
      },
      ...nodes.map((node) => ({
        Header: () => (
          <FieldTab field={node} versionId={versionId} viewId={viewId} />
        ),
        id: node.id,
        accessor: (row: T) => row[node.id],
        Cell: (params: CellProps<DataRow>) => (
          <ValueCell
            {...params}
            isSelected={selectedCell == `${params.cell.row.id}:${node.id}`}
            isEditing={
              selectedCell == `${params.cell.row.id}:${node.id}:editing`
            }
            select={() => setSelectedCell(`${params.cell.row.id}:${node.id}`)}
            edit={() =>
              setSelectedCell(`${params.cell.row.id}:${node.id}:editing`)
            }
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
      nodes
        .map(({ id, __typename, name }) => `${id}${__typename}${name}`)
        .join(','),
      versionId,
      selectedCell,
    ]
  );
}

export default function GraphRoute() {
  const graph = useLoaderData<Graph>();
  const tree = useTree(graph);
  const columns = useGridViewColumns(
    tree.nodes.filter(({ hidden }) => !hidden),
    graph.version.id,
    tree.leftId,
    graph.view.id
  );
  const data: readonly Record<string, unknown>[] = graph.rows;
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  return (
    <div className="flex flex-col h-screen">
      <Header graph={graph} />

      <div className="flex items-center p-2 border-b border-gray-300">
        <ViewTab view={graph.view} />
        <HideFieldsButton viewId={graph.view.id} fields={tree.nodes} />
        <DeleteRowsButton selectedRows={selectedRows} />
      </div>

      <div className="flex-grow overflow-y-scroll">
        <GridView
          columns={columns}
          data={data}
          onSelect={(rowIds) => setSelectedRows(rowIds)}
        />
      </div>

      <div className="p-2 border-t border-gray-300">
        <AddRowButton versionId={graph.version.id} />
      </div>
    </div>
  );
}

function BreadcrumbNav({ breadcrumbs }: { breadcrumbs: Breadcrumbs }) {
  const [[name], ...rest] = breadcrumbs;
  return (
    <h2>
      {rest.map(([name, onClick], index) => (
        <span key={index}>
          <button onClick={onClick}>{name}</button>
          {' > '}
        </span>
      ))}
      {name}
    </h2>
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
  return (
    <span
      className={`${
        isSelected ? 'ring-2 ring-offset-2 ring-green-500' : ''
      } absolute inset-0`}
      onClick={select}
      onDoubleClick={edit}
      tabIndex={0}
    >
      {cell.value}
    </span>
  );
}

function Header({ graph }: { graph: Graph }) {
  const transition = useTransition();
  return (
    <header
      className={`flex items-center justify-between ${bgColor(
        graph.color
      )} p-2`}
    >
      <Link to="/" className="text-white">
        <DatabaseIcon className="h-5 w-5" />
      </Link>
      <span className="text-xs text-white w-32 ml-4">
        {transition.state == 'submitting' ? 'Saving...' : null}
      </span>
      <h1 className="flex-1 text-center text-white">{graph.root.name}</h1>
      <span className="w-32"></span>
      <Link to="/account">
        <UserIcon className="h-5 w-5" />
      </Link>
    </header>
  );
}
