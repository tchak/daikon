import { createCookieSessionStorage } from 'remix';
import { addYears } from 'date-fns';

import { getEnv } from '.';

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: [getEnv('SESSION_SECRET')],
    expires: addYears(new Date(), 1),
    secure: process.env.NODE_ENV == 'production',
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
