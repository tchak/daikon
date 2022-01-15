import type { LoaderFunction, ActionFunction } from 'remix';
import { useLoaderData, useTransition, Link } from 'remix';
import { useState } from 'react';
import { DatabaseIcon, UserIcon } from '@heroicons/react/outline';
import { z } from 'zod';

import { authenticator } from '~/util/auth.server';
import { GridView } from '~/components/GridView';
import { useTableColumns } from '~/components/FieldCell';
import { ViewTab } from '~/components/ViewTab';
import { AddRowButton } from '~/components/AddRowButton';
import { HideFieldsButton } from '~/components/HideFieldsButton';
import { DeleteRowsButton } from '~/components/DeleteRowsButton';
import { getColor, ColorName } from '~/util/color';
import { executeCommand } from '~/util/commands.server';
import * as Bucket from '~/models/bucket';
import type { FindOneData } from '~/models/bucket';

type LoaderData = FindOneData;

const ID = z.string().uuid();

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const viewId = ID.nullish().parse(url.searchParams.get('view'));
  const bucketId = ID.parse(params.id);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  return Bucket.findOne({ bucketId, viewId, userId: user.id });
};

export const action: ActionFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });
  const form = await request.formData();
  const aggregate = await executeCommand(form, user.id);

  return { aggregateId: aggregate.id };
};

export default function BucketRoute() {
  const bucket = useLoaderData<LoaderData>();
  const columns = useTableColumns({
    fields: bucket.fields.filter(({ hidden }) => !hidden),
    bucketId: bucket.id,
    viewId: bucket.view.id,
  });
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  return (
    <div className="flex flex-col h-screen">
      <Header name={bucket.name} color={bucket.color} />

      <div className="flex items-center p-2 border-b border-gray-300">
        <ViewTab bucketId={bucket.id} view={bucket.view} />
        <HideFieldsButton
          bucketId={bucket.id}
          viewId={bucket.view.id}
          fields={bucket.fields}
        />
        <DeleteRowsButton selectedRows={selectedRows} />
      </div>

      {/* {bucket.breadcrumbs.length > 1 ? (
        <div className="p-2 border-b border-gray-300">
          <BreadcrumbsPanel breadcrumbs={bucket.breadcrumbs} />
        </div>
      ) : null} */}

      <div className="flex-grow overflow-y-scroll">
        <GridView
          columns={columns}
          data={[]}
          onSelect={(rowIds) => setSelectedRows(rowIds)}
        />
      </div>

      {/* <div className="p-2 border-t border-gray-300">
        {bucket.parentId || bucket.breadcrumbs.length == 1 ? (
          <AddRowButton
            bucketId={bucket.id}
            parent={
              bucket.parentId
                ? { id: bucket.parentId, fieldId: bucket.leftId }
                : undefined
            }
          />
        ) : null}
      </div> */}
    </div>
  );
}

function Header({ name, color }: { name: string; color: ColorName }) {
  const transition = useTransition();
  return (
    <header
      className={`flex items-center justify-between ${getColor(color)} p-2`}
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
