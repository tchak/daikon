import type { LoaderFunction, ActionFunction, RouteHandle } from 'remix';
import { useLoaderData, useFetcher, useTransition } from 'remix';
import {
  FormEventHandler,
  useState,
  useCallback,
  FormEvent,
  useMemo,
} from 'react';
import { Link } from 'react-router-dom';
import {
  TrashIcon,
  PlusCircleIcon,
  DatabaseIcon,
  UserIcon,
  PencilIcon,
  EyeOffIcon,
  ClipboardCopyIcon,
} from '@heroicons/react/outline';
import { Popover, Switch } from '@headlessui/react';
import { isHotkey } from 'is-hotkey';
import { usePopper } from 'react-popper';
import type { Column, CellProps } from 'react-table';
import useClipboard from 'react-use-clipboard';
import clsx from 'clsx';

import { GridView, DataRow } from '~/components/GridView';
import { TabMenu, TabMenuItem } from '~/components/TabMenu';
import { bgColor } from '~/components/utils';
import {
  query,
  mutation,
  FindGraphDocument,
  FindGraphQuery,
  CreateTextNodeDocument,
  CreateBlocNodeDocument,
  DeleteNodeDocument,
  UpdateNodeNameDocument,
  DeleteViewDocument,
} from '~/api.server';

const isEscKey = isHotkey('esc');

type Graph = NonNullable<FindGraphQuery['graph']>;
type View = Graph['view'];
type Edge = Graph['version']['edges'][0];
type Node = Edge['right'] & { hidden: boolean };

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
  RenameNode = 'RenameNode',
  HideNode = 'HideNode',
  RenameView = 'RenameView',
  DeleteView = 'DeleteView',
  DeleteRows = 'DeleteRows',
}

export const action: ActionFunction = async ({ request }) => {
  const params = new URLSearchParams(await request.text());

  switch (params.get('_action')) {
    case Action.RenameNode:
      return mutation(UpdateNodeNameDocument, {
        input: {
          versionId: params.get('versionId')!,
          nodeId: params.get('nodeId')!,
          name: params.get('name'),
        },
      });
    case Action.DeleteNode:
      return mutation(DeleteNodeDocument, {
        input: {
          versionId: params.get('versionId')!,
          nodeId: params.get('nodeId')!,
        },
      });
    case Action.DeleteView:
      return mutation(DeleteViewDocument, {
        input: {
          viewId: params.get('viewId')!,
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

function makeTree(
  edges: readonly Edge[],
  leftId: string,
  inViewEdges: Set<string>
): Node[] {
  return edges
    .filter(({ left }) => left.id == leftId)
    .map(({ id, right }) => ({ ...right, hidden: !inViewEdges.has(id) }));
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
  leftId: string;
  nodes: Node[];
  breadcrumbs: Breadcrumbs;
  open: (node: Node) => void;
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
  nodes: Node[],
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
          <NodeTab node={node} versionId={versionId} viewId={viewId} />
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
        Header: () => <AddNodeButton versionId={versionId} leftId={leftId} />,
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
  const data: Record<string, unknown>[] = [];
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  return (
    <div className="flex flex-col h-screen">
      <Header graph={graph} />

      <div className="flex items-center p-2 border-b border-gray-300">
        <ViewTab view={graph.view} />
        <HideNodesButton view={graph.view} nodes={tree.nodes} />
        <DeleteRowsButton graphId={graph.id} selectedRows={selectedRows} />
      </div>

      <div className="flex-grow overflow-y-scroll">
        <GridView columns={columns} data={data} onSelect={() => {}} />
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

function ViewTab({ view }: { view: View }) {
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
    return view.name;
  }, [fetcher.type, view.id, view.name]);

  return (
    <div className="flex items-center px-1 text-sm mr-2">
      {isEditing ? (
        <NameForm
          name={view.name}
          onSubmit={(event) => {
            updateName(event);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
          data={{ viewId: view.id }}
        />
      ) : (
        <div>{name}</div>
      )}
      <ViewMenu
        view={view}
        views={[]}
        rename={() => {
          setTimeout(() => setEditing(true), 50);
        }}
      />
    </div>
  );
}

function NodeTab({
  node,
  versionId,
  viewId,
}: {
  node: Node;
  versionId: string;
  viewId: string;
}) {
  const [isEditing, setEditing] = useState(false);
  const fetcher = useFetcher();
  const updateName = useCallback(
    (event: FormEvent<HTMLFormElement>) =>
      fetcher.submit(event.currentTarget, {
        action: '/controllers/columns',
        method: 'put',
        replace: true,
      }),
    []
  );
  const name = useMemo(() => {
    if (fetcher.type == 'actionSubmission' || fetcher.type == 'actionReload') {
      return fetcher.submission.formData.get('name') as string;
    }
    return node.name;
  }, [fetcher.type, node.id, node.name]);

  return (
    <li className="flex items-center">
      <div className="flex items-center">
        {isEditing ? (
          <NameForm
            name={node.name}
            onSubmit={(event) => {
              updateName(event);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
            data={{ versionId, nodeId: node.id }}
          />
        ) : (
          <div>{name}</div>
        )}
        <NodeMenu
          versionId={versionId}
          viewId={viewId}
          nodeId={node.id}
          rename={() => {
            setTimeout(() => setEditing(true), 50);
          }}
        />
      </div>
    </li>
  );
}

function NodeMenu({
  versionId,
  viewId,
  nodeId,
  rename: renameColumn,
}: {
  versionId: string;
  viewId: string;
  nodeId: string;
  rename: () => void;
}) {
  const fetcher = useFetcher();
  const hideNode = () =>
    fetcher.submit(
      { _action: Action.HideNode, viewId, nodeId, hidden: 'true' },
      { method: 'post', replace: true }
    );
  const deleteNode = () =>
    fetcher.submit(
      { _action: Action.DeleteNode, versionId, nodeId },
      { method: 'post', replace: true }
    );

  return (
    <TabMenu>
      <TabMenuItem onClick={renameColumn}>
        <PencilIcon className="h-4 w-4 mr-2" />
        Rename column
      </TabMenuItem>
      <TabMenuItem onClick={hideNode} disabled={!!fetcher.submission}>
        <EyeOffIcon className="h-4 w-4 mr-2" />
        Hide column
      </TabMenuItem>
      <TabMenuItem onClick={deleteNode} disabled={!!fetcher.submission}>
        <TrashIcon className="h-4 w-4 mr-2" />
        Delete column
      </TabMenuItem>
    </TabMenu>
  );
}

function ViewMenu({
  views,
  view,
  rename: renameView,
}: {
  views: View[];
  view: View;
  rename: () => void;
}) {
  const fetcher = useFetcher();
  const deleteView = () =>
    fetcher.submit(
      { _action: Action.DeleteView, viewId: view.id },
      { method: 'post', replace: true }
    );

  return (
    <TabMenu>
      <TabMenuItem onClick={renameView}>
        <PencilIcon className="h-4 w-4 mr-2" />
        Rename view
      </TabMenuItem>
      {views.length > 1 ? (
        <TabMenuItem
          onClick={deleteView}
          disabled={fetcher.state == 'submitting'}
        >
          <TrashIcon className="h-4 w-4 mr-2" />
          Delete view
        </TabMenuItem>
      ) : null}
    </TabMenu>
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

function NameForm({
  name,
  onSubmit,
  onCancel,
  data,
}: {
  name: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
  data?: Record<string, string>;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(event);
      }}
    >
      {Object.entries(data ?? {}).map(([name, value]) => (
        <input type="hidden" key={name} name={name} defaultValue={value} />
      ))}
      <input
        type="text"
        name="name"
        defaultValue={name}
        autoFocus
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        className=""
        onBlur={({ currentTarget: { form } }) => form?.requestSubmit()}
        onKeyDown={({ nativeEvent }) => {
          if (isEscKey(nativeEvent)) {
            onCancel();
          }
        }}
      />
    </form>
  );
}

function AddNodeButton({
  versionId,
  leftId,
}: {
  versionId: string;
  leftId: string;
}) {
  const fetcher = useFetcher();
  const [popoverButtonElement, setPopoverButtonElement] =
    useState<HTMLButtonElement>();
  const [popoverElement, setPopoverElement] = useState<HTMLUListElement>();
  const { styles, attributes } = usePopper(
    popoverButtonElement,
    popoverElement,
    {
      placement: 'bottom-end',
    }
  );

  return (
    <Popover>
      <Popover.Button
        ref={(el: HTMLButtonElement) => setPopoverButtonElement(el)}
        className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mx-4"
      >
        <PlusCircleIcon className="h-5 w-5" />
      </Popover.Button>
      <Popover.Panel
        as="ul"
        ref={(el: HTMLUListElement) => setPopoverElement(el)}
        className="rounded-md shadow-lg p-2 bg-white"
        style={styles.popper}
        {...attributes.popper}
      >
        <fetcher.Form method="post" replace>
          <input
            type="hidden"
            name="_action"
            defaultValue={Action.CreateNode}
          />
          <input type="hidden" name="versionId" defaultValue={versionId} />
          <input type="hidden" name="leftId" defaultValue={leftId} />
          <fieldset
            className="flex flex-col"
            disabled={fetcher.state == 'submitting'}
          >
            <label htmlFor="node_name" className="sr-only">
              Column name
            </label>
            <input
              id="node_name"
              type="text"
              name="name"
              placeholder="Column name"
              className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
            />
            <label htmlFor="node_type" className="sr-only">
              Column type
            </label>
            <select
              id="node_type"
              name="type"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
            >
              {['text', 'bloc'].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </fieldset>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="submit"
              disabled={fetcher.state == 'submitting'}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm"
            >
              Create column
            </button>
            <button
              type="button"
              disabled={fetcher.state == 'submitting'}
              onClick={() => popoverButtonElement?.click()}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </fetcher.Form>
      </Popover.Panel>
    </Popover>
  );
}

function HideNodesButton({ view, nodes }: { view: View; nodes: Node[] }) {
  const [popoverButtonElement, setPopoverButtonElement] =
    useState<HTMLButtonElement>();
  const [popoverElement, setPopoverElement] = useState<HTMLUListElement>();
  const { styles, attributes } = usePopper(
    popoverButtonElement,
    popoverElement,
    {
      placement: 'bottom-end',
    }
  );

  return (
    <Popover>
      <Popover.Button
        ref={(el: HTMLButtonElement) => setPopoverButtonElement(el)}
        className="flex items-center text-xs focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <EyeOffIcon className="h-3 w-3 mr-1" />
        Hide columns
      </Popover.Button>
      <Popover.Panel
        as="ul"
        ref={(el: HTMLUListElement) => setPopoverElement(el)}
        className="rounded-md shadow-lg py-1 bg-white"
        style={styles.popper}
        {...attributes.popper}
      >
        {nodes.map((node) => (
          <li
            key={node.id}
            className="px-2 py-1 text-sm text-gray-700 flex items-center"
          >
            <HideNodeToggle viewId={view.id} node={node} />
          </li>
        ))}
      </Popover.Panel>
    </Popover>
  );
}

function HideNodeToggle({ viewId, node }: { viewId: string; node: Node }) {
  const fetcher = useFetcher();
  const toggleColumn = () =>
    fetcher.submit(
      {
        _action: Action.HideNode,
        viewId,
        nodeId: node.id,
        hidden: node.hidden ? 'false' : 'true',
      },
      { method: 'post', replace: true }
    );
  const enabled = useMemo(() => {
    if (fetcher.type == 'actionSubmission' || fetcher.type == 'actionReload') {
      return fetcher.submission.formData.get('hidden') != 'true';
    }
    return !node.hidden;
  }, [fetcher.type, node.id]);

  return (
    <Switch.Group as="div" className="flex items-center">
      <Switch
        checked={enabled}
        disabled={fetcher.state == 'submitting'}
        onChange={() => toggleColumn()}
        className={clsx(
          enabled ? 'bg-green-600' : 'bg-gray-200',
          'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
        )}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={clsx(
            enabled ? 'translate-x-5' : 'translate-x-0',
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
          )}
        />
      </Switch>
      <Switch.Label as="span" className="ml-3">
        <span className="text-sm">{node.name}</span>
      </Switch.Label>
    </Switch.Group>
  );
}

function DeleteRowsButton({
  graphId,
  selectedRows,
}: {
  graphId: string;
  selectedRows: string[];
}) {
  const fetcher = useFetcher();
  if (selectedRows.length == 0 || fetcher.state == 'submitting') {
    return null;
  }
  return (
    <div className="text-xs ml-2">
      <fetcher.Form method="post" replace>
        <input type="hidden" name="_action" value={Action.DeleteRows} />
        <input type="hidden" name="graphId" value={graphId} />
        {selectedRows.map((rowId) => (
          <input type="hidden" name="rowIds[]" value={rowId} key={rowId} />
        ))}
        <button
          type="submit"
          className="flex items-center text-xs focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <TrashIcon className="h-3 w-3 mr-1" />
          Delete {selectedRows.length}{' '}
          {selectedRows.length > 1 ? 'rows' : 'row'}
        </button>
      </fetcher.Form>
    </div>
  );
}
