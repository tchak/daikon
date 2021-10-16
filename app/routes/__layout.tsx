import { DefaultLayout } from '~/components/DefaultLayout';
import { Outlet } from 'react-router-dom';

export default function LayoutRoute() {
  return (
    <DefaultLayout profile={{ name: 'Paul', email: 'paul@test.com' }}>
      <Outlet />
    </DefaultLayout>
  );
}
