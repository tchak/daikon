import { Authenticator, AuthorizationError } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';

import { sessionStorage } from './session.server';
import * as User from '~/models/user';

export const authenticator = new Authenticator<{ id: string }>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get('email') as string;
    //const password = form.get('password');

    const user = await User.findByEmail(email);
    if (user) {
      return user;
    }
    throw new AuthorizationError('Invalid email');
  }),
  'email'
);
