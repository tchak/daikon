import type { MetaFunction, LoaderFunction, ActionFunction } from 'remix';
import { useTransition, Form, json, useLoaderData } from 'remix';
import { LockClosedIcon } from '@heroicons/react/solid';

import { authenticator } from '~/util/auth.server';
import { getSession, commitSession } from '~/util/session.server';

import { Button, Input } from '~/components/Form';

export const meta: MetaFunction = () => ({ title: 'Sign In' });
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

export const action: ActionFunction = ({ request }) =>
  authenticator.authenticate('email', request, {
    successRedirect: '/',
    failureRedirect: '/signin',
  });

export default function SignInRoute() {
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
        <Input
          type="email"
          label="Email"
          name="email"
          placeholder="you@example.com"
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
            className="-ml-1 h-5 w-5 text-blue-500 group-hover:text-blue-400"
            aria-hidden="true"
          />
          <span className="mr-5">
            {connecting ? 'Signing In...' : 'Sign In'}
          </span>
          <span></span>
        </Button>
      </Form>
    </div>
  );
}
