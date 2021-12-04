import type { MetaFunction, LoaderFunction, ActionFunction } from 'remix';
import { useLoaderData, useTransition, Form, useFetcher } from 'remix';
import { Link } from 'react-router-dom';
import { TrashIcon, PlusCircleIcon } from '@heroicons/react/outline';
import { DotsVerticalIcon } from '@heroicons/react/solid';
import { Menu } from '@headlessui/react';
import { ReactNode, useState, useCallback } from 'react';
import { usePopper } from 'react-popper';
import clsx from 'clsx';

import { query, FindGraphsDocument, FindGraphsQuery } from '~/urql.server';
import { Header, Main } from '~/components/DefaultLayout';
import { bgColor } from '~/components/utils';
import { ActionType, processAction } from '~/actions';

type Graph = FindGraphsQuery['graphs'][0];

export const meta: MetaFunction = () => {
  return { title: 'Graphs' };
};
export const loader: LoaderFunction = async () => {
  const { graphs } = await query(FindGraphsDocument);
  return graphs;
};
export const action: ActionFunction = ({ request }) => processAction(request);

export default function IndexRoute() {
  const data = useLoaderData<Graph[]>();

  return (
    <>
      <Header>Graphs</Header>
      <Main>
        <ul>
          <li className="mb-6">
            <OrganizationCard graphs={data} />
          </li>
        </ul>
      </Main>
    </>
  );
}

function OrganizationCard({ graphs }: { graphs: Graph[] }) {
  const pendingForm = useTransition().submission;

  return (
    <div>
      <ul className="mt-3 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {graphs.map((graph) => (
          <GraphCard key={graph.id} graph={graph} />
        ))}
        <li className="col-span-1 flex shadow-sm rounded-md">
          <div className="flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md bg-gray-400">
            <PlusCircleIcon className="h-7 w-7" />
          </div>
          <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
            <div className="flex-1 px-4 py-4 text-sm truncate">
              <Form method="post" replace>
                <input
                  type="hidden"
                  name="actionType"
                  defaultValue={ActionType.CreateGraph}
                />
                <input type="hidden" name="name" defaultValue="New Graph" />
                <button
                  type="submit"
                  disabled={!!pendingForm}
                  className="text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Add a graph
                </button>
              </Form>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}

function GraphCard({ graph }: { graph: Graph }) {
  return (
    <li className="col-span-1 flex shadow-sm rounded-md">
      <div
        className={clsx(
          bgColor(graph.color),
          'flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md'
        )}
      />
      <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md">
        <div className="flex-1 px-4 py-4 text-sm truncate">
          <Link to={`graph/${graph.id}`} className="text-gray-900 font-medium">
            {graph.root.name}
          </Link>
        </div>
        <GraphMenu graph={graph} />
      </div>
    </li>
  );
}

function GraphMenu({ graph }: { graph: Graph }) {
  const fetcher = useFetcher();
  const deleteGraph = useCallback(
    () =>
      fetcher.submit(
        { actionType: ActionType.DeleteGraph, id: graph.id },
        { method: 'delete', replace: true }
      ),
    [graph.id, fetcher]
  );
  const [menuButtonElement, setMenuButtonElement] =
    useState<HTMLButtonElement>();
  const [menuElement, setMenuElement] = useState<HTMLDivElement>();
  const { styles, attributes } = usePopper(menuButtonElement, menuElement, {
    placement: 'bottom-end',
  });

  return (
    <Menu as="div" className="flex-shrink-0 pr-2">
      <Menu.Button
        ref={(el: HTMLButtonElement) => setMenuButtonElement(el)}
        className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full bg-transparent hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <span className="sr-only">Open graph menu</span>
        <DotsVerticalIcon className="w-5 h-5" aria-hidden="true" />
      </Menu.Button>
      <Menu.Items
        className="w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
        ref={(el: HTMLDivElement) => setMenuElement(el)}
        style={styles.popper}
        {...attributes.popper}
      >
        <MenuItem onClick={deleteGraph}>
          <TrashIcon className="h-5 w-5 mr-2" />
          Delete graph
        </MenuItem>
      </Menu.Items>
    </Menu>
  );
}

function MenuItem({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Menu.Item onClick={onClick} disabled={disabled}>
      {({ active }) => (
        <span
          className={clsx(
            active ? 'bg-gray-100' : '',
            'px-4 py-2 text-sm text-gray-700 flex items-center'
          )}
        >
          {children}
        </span>
      )}
    </Menu.Item>
  );
}
