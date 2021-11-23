import type { LoaderFunction, ActionFunction, RouteHandle } from 'remix';
import { useLoaderData, useFetcher } from 'remix';
import { useCallback, useMemo, useState } from 'react';

import {
  query,
  mutation,
  FindGraphDocument,
  FindGraphQuery,
  CreateTextNodeDocument,
  CreateBlocNodeDocument,
  DeleteNodeDocument,
} from '~/api.server';

export const handle: RouteHandle = { layout: false };
export const loader: LoaderFunction = async ({ params }) => {
  const { graph } = await query(FindGraphDocument, { graphId: params.id });
  if (graph) {
    return graph;
  }
  throw new Error('Not Found');
};

enum Action {
  DeleteNode = 'DeleteNode',
  CreateNode = 'CreateNode',
}

export const action: ActionFunction = async ({ request }) => {
  const params = new URLSearchParams(await request.text());

  switch (params.get('_action')) {
    case Action.DeleteNode:
      return mutation(DeleteNodeDocument, {
        input: {
          versionId: params.get('versionId')!,
          nodeId: params.get('nodeId')!,
        },
      });
    case Action.CreateNode:
      switch (params.get('type')) {
        case 'bloc':
          return mutation(CreateBlocNodeDocument, {
            input: {
              versionId: params.get('versionId')!,
              leftId: params.get('leftId')!,
              name: params.get('name')!,
            },
          });
        default:
          return mutation(CreateTextNodeDocument, {
            input: {
              versionId: params.get('versionId')!,
              leftId: params.get('leftId')!,
              name: params.get('name')!,
            },
          });
      }
  }
};

type Graph = NonNullable<FindGraphQuery['graph']>;
type Edge = Graph['version']['edges'][0];
type Node = Edge['right'];

function makeTree(edges: readonly Edge[], leftId: string): Node[] {
  return edges
    .filter(({ left }) => left.id == leftId)
    .map(({ right }) => right);
}

type Breadcrumb = readonly [name: string, open: () => void];
type Breadcrumbs = Breadcrumb[];

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
  nodes: Node[];
  breadcrumbs: Breadcrumbs;
  open: (node: Node) => void;
  close: () => void;
  add: (type: 'text' | 'bloc', name: string) => void;
  remove: (node: Node) => void;
} {
  const edges = graph.version.edges;
  const versionId = graph.version.id;
  const [leftId, setLeftId] = useState<string>(graph.root.id);
  const close = useCallback(() => setLeftId(graph.root.id), [graph.id]);
  const breadcrumbs: Breadcrumbs = useMemo(
    () => [
      ...makeBreadcrumbs(edges, leftId, setLeftId),
      [graph.root.name, close],
    ],
    [graph.id, leftId]
  );
  const createFetcher = useFetcher();
  const deleteFetcher = useFetcher();

  return {
    nodes: makeTree(edges, leftId),
    breadcrumbs,
    open: (node) => setLeftId(node.id),
    close,
    add: (type, name) =>
      createFetcher.submit(
        {
          _action: Action.CreateNode,
          versionId,
          leftId,
          type,
          name,
        },
        { method: 'post' }
      ),
    remove: (node) =>
      deleteFetcher.submit(
        {
          _action: Action.DeleteNode,
          versionId,
          nodeId: node.id,
        },
        { method: 'post' }
      ),
  };
}

export default function GraphRoute() {
  const data = useLoaderData<Graph>();
  const tree = useTree(data);
  const rows = [{}];

  return (
    <div>
      <BreadcrumbNav breadcrumbs={tree.breadcrumbs} />
      <table>
        <thead>
          <tr>
            {tree.nodes.map((node) => (
              <th key={node.id}>
                {node.name} <button onClick={() => tree.remove(node)}></button>
              </th>
            ))}
            <th>
              <button onClick={() => tree.add('text', 'New text field')}>
                Add text field
              </button>
              <button onClick={() => tree.add('bloc', 'New bloc field')}>
                Add bloc field
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((_, index) => (
            <tr key={index}>
              {tree.nodes.map((node) => (
                <td key={node.id}>
                  <NodeCell node={node} open={() => tree.open(node)} />
                </td>
              ))}
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => {}}>Add Row</button>
    </div>
  );
}

type NodeCellProps = {
  node: Node;
  open: (node: Node) => void;
};

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

function NodeCell({ node, open }: NodeCellProps) {
  switch (node.__typename) {
    case 'BlocNode':
      return <BlocNodeCell node={node} open={open} />;
    default:
      return <TextNodeCell node={node} open={open} />;
  }
}

function TextNodeCell({ node }: NodeCellProps) {
  return (
    <div>
      <input name={node.id} />
    </div>
  );
}

function BlocNodeCell({ node, open }: NodeCellProps) {
  return <button onClick={() => open(node)}>Open</button>;
}
