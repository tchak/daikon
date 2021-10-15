import { useFetcher } from 'remix';
import { useState } from 'react';
import { Popover } from '@headlessui/react';
import { usePopper } from 'react-popper';
import { PlusCircleIcon } from '@heroicons/react/outline';

import { Action } from '~/actions';

export function AddFieldButton({
  versionId,
  leftId,
}: {
  versionId: string;
  leftId: string;
}) {
  const fetcher = useFetcher();
  const [popoverButtonElement, setPopoverButtonElement] =
    useState<HTMLButtonElement>();
  const [popoverElement, setPopoverElement] = useState<HTMLUListElement>();
  const { styles, attributes } = usePopper(
    popoverButtonElement,
    popoverElement,
    {
      placement: 'bottom-end',
    }
  );

  return (
    <Popover>
      <Popover.Button
        ref={(el: HTMLButtonElement) => setPopoverButtonElement(el)}
        className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mx-4"
      >
        <PlusCircleIcon className="h-5 w-5" />
      </Popover.Button>
      <Popover.Panel
        as="ul"
        ref={(el: HTMLUListElement) => setPopoverElement(el)}
        className="rounded-md shadow-lg p-2 bg-white"
        style={styles.popper}
        {...attributes.popper}
      >
        <fetcher.Form method="post" replace>
          <input
            type="hidden"
            name="_action"
            defaultValue={Action.CreateField}
          />
          <input type="hidden" name="versionId" defaultValue={versionId} />
          <input type="hidden" name="leftId" defaultValue={leftId} />
          <fieldset
            className="flex flex-col"
            disabled={fetcher.state == 'submitting'}
          >
            <label htmlFor="node_name" className="sr-only">
              Column name
            </label>
            <input
              id="node_name"
              type="text"
              name="name"
              placeholder="Column name"
              className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
            />
            <label htmlFor="node_type" className="sr-only">
              Column type
            </label>
            <select
              id="node_type"
              name="type"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
            >
              {['text', 'bloc'].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </fieldset>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="submit"
              disabled={fetcher.state == 'submitting'}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm"
            >
              Create column
            </button>
            <button
              type="button"
              disabled={fetcher.state == 'submitting'}
              onClick={() => popoverButtonElement?.click()}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </fetcher.Form>
      </Popover.Panel>
    </Popover>
  );
}
