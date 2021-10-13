import type { LinksFunction } from 'remix';
import {
  Meta,
  Links,
  Scripts,
  useTransition,
  useMatches,
  LiveReload,
  useCatch,
} from 'remix';
import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

import stylesUrl from './styles/index.css';
import { DefaultLayout } from './components/DefaultLayout';
import { Progress } from './components/Progress';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

export const unstable_shouldReload = () => false;

function Document({
  children,
  pendingLocation = false,
}: {
  children: ReactNode;
  pendingLocation?: boolean;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <Meta />
        <Links />
      </head>
      <body>
        <Progress isAnimating={pendingLocation} />
        {children}
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  );
}

export default function App() {
  const pendingLocation = useTransition().state == 'loading';
  const noLayout = useMatches().some(({ handle }) => handle?.layout == false);
  return (
    <Document pendingLocation={!!pendingLocation}>
      {noLayout ? (
        <Outlet />
      ) : (
        <DefaultLayout profile={{ name: 'Paul', email: 'paul@test.com' }}>
          <Outlet />
        </DefaultLayout>
      )}
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document>
      <h1>App Error</h1>
      <pre>{error.message}</pre>
      <p>
        Replace this UI with what you want users to see when your app throws
        uncaught errors.
      </p>
    </Document>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  switch (caught.status) {
    case 401:
    case 404:
      return (
        <Document>
          <h1>
            {caught.status} {caught.statusText}
          </h1>
          <p>Page not found</p>
        </Document>
      );

    default:
      throw new Error(
        `Unexpected caught response with status: ${caught.status}`
      );
  }
}
