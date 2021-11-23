import { Fragment, ReactNode } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { BellIcon, MenuIcon, XIcon } from '@heroicons/react/outline';
import { DatabaseIcon } from '@heroicons/react/solid';
import { NavLink, Link } from 'react-router-dom';

import { classNames, defaultInitials } from './utils';

export function Header({ children }: { children: ReactNode }) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <h1 className="text-lg leading-6 font-semibold text-gray-900">
          {children}
        </h1>
      </div>
    </header>
  );
}

export function Main({ children }: { children: ReactNode }) {
  return (
    <main>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}

type Profile = {
  name: string;
  email: string;
};

export function DefaultLayout({
  children,
  profile,
}: {
  children: ReactNode;
  profile: Profile;
}) {
  return (
    <div>
      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => (
          <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DatabaseIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                      <Navigation />
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="ml-4 flex items-center md:ml-6">
                    <button className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                    </button>

                    <ProfileDropdown profile={profile} />
                  </div>
                </div>
                <div className="-mr-2 flex md:hidden">
                  <Disclosure.Button className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Navigation />
              </div>

              <ProfileInline profile={profile} />
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {children}
    </div>
  );
}

const profileLinks = [
  ['Your Profile', '/profile'],
  ['Settings', '/settings'],
  ['Sign out', '/signout'],
];

function ProfileInline({ profile }: { profile: Profile }) {
  return (
    <div className="pt-4 pb-3 border-t border-gray-700">
      <div className="flex items-center px-5">
        <div className="flex-shrink-0">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-500">
            <span className="text-sm font-medium leading-none text-white">
              {defaultInitials(profile.name)}
            </span>
          </div>
        </div>
        <div className="ml-3">
          <div className="text-base font-medium text-white">{profile.name}</div>
          <div className="text-sm font-medium text-gray-400">
            {profile.email}
          </div>
        </div>
        <button className="ml-auto bg-gray-800 flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
          <span className="sr-only">View notifications</span>
          <BellIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-3 px-2 space-y-1">
        {profileLinks.map(([title, to], index) => (
          <NavLink
            key={index}
            to={to}
            end
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
          >
            {title}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function ProfileDropdown({ profile }: { profile: Profile }) {
  return (
    <Menu as="div" className="ml-3 relative">
      {({ open }) => (
        <>
          <div>
            <Menu.Button className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
              <span className="sr-only">Open user menu</span>
              <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-500">
                <span className="text-sm font-medium leading-none text-white">
                  {defaultInitials(profile.name)}
                </span>
              </div>
            </Menu.Button>
          </div>
          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              static
              className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              {profileLinks.map(([title, to], index) => (
                <Menu.Item key={index}>
                  {({ active }) => (
                    <Link
                      to={to}
                      className={classNames(
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700'
                      )}
                    >
                      {title}
                    </Link>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}

function Navigation() {
  const navigation: string[][] = [
    ['Graphs', '/'],
    ['About', '/about'],
  ];
  return (
    <>
      {navigation.map(([title, to], index) => (
        <NavLink
          key={index}
          to={to}
          end
          className={({ isActive }) =>
            `text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium ${
              isActive ? 'bg-gray-900 text-white' : ''
            }`
          }
        >
          {title}
        </NavLink>
      ))}
    </>
  );
}
