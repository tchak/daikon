import type { MetaFunction, LoaderFunction, ActionFunction } from 'remix';
import { useLoaderData, useTransition, Form, useFetcher } from 'remix';
import { Link } from 'react-router-dom';
import { TrashIcon, PlusCircleIcon } from '@heroicons/react/outline';
import { DotsVerticalIcon } from '@heroicons/react/solid';
import { Menu } from '@headlessui/react';
import { ReactNode, useState, useCallback } from 'react';
import { usePopper } from 'react-popper';
import clsx from 'clsx';

import { authenticator } from '~/util/auth.server';
import { executeCommand } from '~/util/commands.server';
import { Header, Main } from '~/components/DefaultLayout';
import { getColor, ColorName } from '~/util/color';
import * as Actions from '~/actions';
import * as Organization from '~/models/organization';
import type { FindManyData } from '~/models/organization';

type LoaderData = FindManyData;
type Bucket = LoaderData[0]['buckets'][0];

export const meta: MetaFunction = () => {
  return { title: 'Buckets' };
};
export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });
  return Organization.findMany({ userId: user.id });
};
export const action: ActionFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });
  const form = await request.formData();
  const aggregate = await executeCommand(form, user.id);

  return { aggregateId: aggregate.id };
};

export default function IndexRoute() {
  const organizations = useLoaderData<LoaderData>();

  return (
    <>
      <Header>Buckets</Header>
      <Main>
        <ul>
          {organizations.map((organization) => (
            <li key={organization.id} className="mb-6">
              <OrganizationCard organization={organization} />
            </li>
          ))}
        </ul>
      </Main>
    </>
  );
}

function OrganizationCard({ organization }: { organization: LoaderData[0] }) {
  const pendingForm = useTransition().submission;

  return (
    <div>
      <ul className="mt-3 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {organization.buckets.map((bucket) => (
          <BucketCard key={bucket.id} bucket={bucket} />
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
                  defaultValue={Actions.CreateBucket}
                />
                <input type="hidden" name="name" defaultValue="New Bucket" />
                <input type="hidden" name="color" defaultValue="blue" />
                <input
                  type="hidden"
                  name="organizationId"
                  defaultValue={organization.id}
                />
                <button
                  type="submit"
                  disabled={!!pendingForm}
                  className="text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Create Bucket
                </button>
              </Form>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}

function BucketCard({ bucket }: { bucket: Bucket }) {
  return (
    <li className="col-span-1 flex shadow-sm rounded-md">
      <div
        className={clsx(
          getColor(bucket.color as ColorName),
          'flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md'
        )}
      />
      <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md">
        <div className="flex-1 px-4 py-4 text-sm truncate">
          <Link
            to={`bucket/${bucket.id}`}
            className="text-gray-900 font-medium"
          >
            {bucket.name}
          </Link>
        </div>
        <BucketMenu bucket={bucket} />
      </div>
    </li>
  );
}

function BucketMenu({ bucket }: { bucket: Bucket }) {
  const fetcher = useFetcher();
  const deleteBucket = useCallback(
    () =>
      fetcher.submit(
        { actionType: Actions.DeleteBucket, bucketId: bucket.id },
        { action: '/?index', method: 'post', replace: true }
      ),
    [bucket.id, fetcher]
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
        <span className="sr-only">Open Bucket menu</span>
        <DotsVerticalIcon className="w-5 h-5" aria-hidden="true" />
      </Menu.Button>
      <Menu.Items
        className="w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
        ref={(el: HTMLDivElement) => setMenuElement(el)}
        style={styles.popper}
        {...attributes.popper}
      >
        <MenuItem onClick={deleteBucket}>
          <TrashIcon className="h-5 w-5 mr-2" />
          Delete Bucket
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
