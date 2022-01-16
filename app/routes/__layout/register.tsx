import type { MetaFunction, LoaderFunction, ActionFunction } from 'remix';
import { useTransition, Form, json, useLoaderData, redirect } from 'remix';
import { LockClosedIcon } from '@heroicons/react/solid';

import { authenticator } from '~/util/auth.server';
import { getSession, commitSession } from '~/util/session.server';
import { executeCommand } from '~/util/commands.server';
import { Button, Input } from '~/components/Form';
import * as Actions from '~/actions';

export const meta: MetaFunction = () => ({ title: 'Register' });
export const handle = { hydrate: true };

export const loader: LoaderFunction = async ({ request }) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  });

  const session = await getSession(request.headers.get('cookie'));
  const error = session.get('auth:error');

  return json(
    { errorMessage: error?.message },
    { headers: { 'set-cookie': await commitSession(session) } }
  );
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('cookie'));
  const form = await request.formData();

  const aggregate = await executeCommand(form);
  session.set(authenticator.sessionKey, { id: aggregate.id });

  return redirect('/', {
    headers: { 'set-cookie': await commitSession(session) },
  });
};

export default function RegisterRoute() {
  const data = useLoaderData<{ errorMessage?: string }>();
  const transition = useTransition();
  const connecting = transition.state == 'submitting';

  return (
    <div>
      <Form
        method="post"
        replace
        noValidate
        className="mt-6 space-y-6 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <input
          type="hidden"
          name="actionType"
          defaultValue={Actions.RegisterUser}
        />
        <Input
          type="email"
          label="Email"
          name="email"
          placeholder="you@example.com"
          disabled={connecting}
          errorMessage={data.errorMessage}
          required
        />
        <Input
          type="password"
          label="Password"
          name="password"
          disabled={connecting}
          errorMessage={data.errorMessage}
          required
        />

        <Button
          type="submit"
          full
          primary
          size="lg"
          disabled={connecting}
          className="justify-between group"
        >
          <LockClosedIcon
            className="-ml-1 h-5 w-5 text-green-500 group-hover:text-green-400"
            aria-hidden="true"
          />
          <span className="mr-5">
            {connecting ? (
              <>
                <Spinner />
                Registering...
              </>
            ) : (
              'Register'
            )}
          </span>
          <span></span>
        </Button>
      </Form>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="hidden motion-safe:block animate-spin -ml-1 mr-3 h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}
