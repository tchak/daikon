import { useState, ReactNode } from 'react';
import { ChevronDownIcon } from '@heroicons/react/outline';
import { Menu } from '@headlessui/react';
import { usePopper } from 'react-popper';
import clsx from 'clsx';

export function TabMenu({ children }: { children: ReactNode }) {
  const [menuButtonElement, setMenuButtonElement] =
    useState<HTMLButtonElement>();
  const [menuElement, setMenuElement] = useState<HTMLDivElement>();
  const { styles, attributes } = usePopper(menuButtonElement, menuElement, {
    placement: 'bottom-end',
  });

  return (
    <Menu as="div" className="pl-1">
      <Menu.Button
        ref={(el: HTMLButtonElement) => setMenuButtonElement(el)}
        className="w-6 h-6 bg-white inline-flex items-center justify-center text-gray-400 rounded-full bg-transparent hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <span className="sr-only">Open menu</span>
        <ChevronDownIcon className="w-4 h-4" aria-hidden="true" />
      </Menu.Button>
      <Menu.Items
        className="w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
        ref={(el: HTMLDivElement) => setMenuElement(el)}
        style={styles.popper}
        {...attributes.popper}
      >
        {children}
      </Menu.Items>
    </Menu>
  );
}

export function TabMenuItem({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Menu.Item onClick={onClick} disabled={disabled}>
      {({ active }) => (
        <span
          className={clsx(
            active ? 'bg-gray-100' : '',
            'px-4 py-2 text-sm text-gray-700 flex items-center'
          )}
        >
          {children}
        </span>
      )}
    </Menu.Item>
  );
}
