import type { LinksFunction, LoaderFunction } from 'remix';
import {
  Meta,
  Links,
  Scripts,
  useTransition,
  useMatches,
  LiveReload,
} from 'remix';
import { Outlet } from 'react-router-dom';

import stylesUrl from './styles/index.css';
import { DefaultLayout } from './components/DefaultLayout';
import { Progress } from './components/Progress';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

export const loader: LoaderFunction = async () => {
  return { date: new Date() };
};

export const unstable_shouldReload = () => false;

function Document({
  children,
  pendingLocation,
}: {
  children: React.ReactNode;
  pendingLocation: boolean;
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
  const pendingLocation = useTransition().location;
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
    <Document pendingLocation={false}>
      <h1>App Error</h1>
      <pre>{error.message}</pre>
      <p>
        Replace this UI with what you want users to see when your app throws
        uncaught errors.
      </p>
    </Document>
  );
}
