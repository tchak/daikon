import { Authenticator, AuthorizationError } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';

import { verify } from './argon2.server';
import { sessionStorage } from './session.server';
import { findByEmail, User } from '~/models/user';
import { z } from 'zod';

export { User };
export const authenticator = new Authenticator<User>(sessionStorage);

const AuthForm = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const { email, password } = AuthForm.parse(Object.fromEntries(form));
    const user = await findByEmail({ email });

    if (user && (await verify(user.password, password))) {
      return { id: user.id };
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
