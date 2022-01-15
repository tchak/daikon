import { Authenticator, AuthorizationError } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';

import { sessionStorage } from './session.server';
import { findByEmail, User } from '~/models/user';

export { User };
export const authenticator = new Authenticator<User>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get('email') as string;
    //const password = form.get('password');

    const user = await findByEmail({ email });
    if (user) {
      return user;
    }
    throw new AuthorizationError('Invalid email');
  }),
  'email'
);

export function extractToken(request: Request): string | null {
  let token: string | null = null;

  if (request.headers.has('authorization')) {
    const parts = request.headers.get('authorization')?.split(' ') ?? [];

    if (parts.length < 2) {
      return null;
    }
    const [scheme, credentials] = parts;

    if (/^Bearer$/i.test(scheme)) {
      token = credentials;
    }
  }

  return token;
}
