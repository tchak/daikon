import { useFetcher } from 'remix';
import { useState, useMemo } from 'react';
import { Popover, Switch } from '@headlessui/react';
import { usePopper } from 'react-popper';
import { EyeOffIcon } from '@heroicons/react/outline';
import clsx from 'clsx';

import { ActionType } from '~/actions';
import { Field } from '~/types';

export function HideFieldsButton({
  viewId,
  fields,
}: {
  viewId: string;
  fields: ReadonlyArray<Field>;
}) {
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
        className="flex items-center text-xs focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <EyeOffIcon className="h-3 w-3 mr-1" />
        Hide fields
      </Popover.Button>
      <Popover.Panel
        as="ul"
        ref={(el: HTMLUListElement) => setPopoverElement(el)}
        className="rounded-md shadow-lg py-1 bg-white"
        style={styles.popper}
        {...attributes.popper}
      >
        {fields.map((field) => (
          <li
            key={field.id}
            className="px-2 py-1 text-sm text-gray-700 flex items-center"
          >
            <Toggle viewId={viewId} field={field} />
          </li>
        ))}
      </Popover.Panel>
    </Popover>
  );
}

function Toggle({ viewId, field }: { viewId: string; field: Field }) {
  const fetcher = useFetcher();
  const toggle = () =>
    fetcher.submit(
      {
        actionType: ActionType.HideField,
        viewId,
        nodeId: field.id,
        hidden: field.hidden ? 'false' : 'true',
      },
      { method: 'post', replace: true }
    );
  const enabled = useMemo(() => {
    if (fetcher.type == 'actionSubmission' || fetcher.type == 'actionReload') {
      return fetcher.submission.formData.get('hidden') != 'true';
    }
    return !field.hidden;
  }, [fetcher.type, field.id, field.hidden]);

  return (
    <Switch.Group as="div" className="flex items-center">
      <Switch
        checked={enabled}
        disabled={fetcher.state == 'submitting'}
        onChange={toggle}
        className={clsx(
          enabled ? 'bg-green-600' : 'bg-gray-200',
          'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
        )}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={clsx(
            enabled ? 'translate-x-5' : 'translate-x-0',
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
          )}
        />
      </Switch>
      <Switch.Label as="span" className="ml-3">
        <span className="text-sm">{field.name}</span>
      </Switch.Label>
    </Switch.Group>
  );
}
