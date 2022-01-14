import { DefaultLayout } from '~/components/DefaultLayout';
import { Outlet } from 'remix';

export default function LayoutRoute() {
  return (
    <DefaultLayout profile={{ name: 'Paul', email: 'paul@test.com' }}>
      <Outlet />
    </DefaultLayout>
  );
}
