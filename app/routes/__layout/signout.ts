import type { LoaderFunction } from 'remix';
import { redirect } from 'remix';

import { getSession, destroySession } from '~/util/session.server';

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('cookie'));

  return redirect('/', {
    headers: { 'set-cookie': await destroySession(session) },
  });
};
