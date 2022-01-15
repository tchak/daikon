import { useSearchParams } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/solid';

type Breadcrumb = {
  name: string;
  parent?: { recordId: string; fieldId: string };
};

export function BreadcrumbsPanel({
  breadcrumbs,
}: {
  breadcrumbs: Breadcrumb[];
}) {
  const [params, setParams] = useSearchParams();
  const setCellId = (id: string | null) => {
    if (id) {
      params.set('p', id);
    } else {
      params.delete('p');
    }
    setParams(params);
  };
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-2">
        {breadcrumbs.map(({ name, parent }, index) => (
          <li key={index}>
            <BreadcrumbSlot
              name={name}
              parent={parent}
              isLast={index == breadcrumbs.length - 1}
              onClick={setCellId}
            />
          </li>
        ))}
        <li></li>
      </ol>
    </nav>
  );
}

function BreadcrumbSlot({
  name,
  parent,
  isLast,
  onClick,
}: {
  name: string;
  parent: Breadcrumb['parent'];
  isLast: boolean;
  onClick: (id: string | null) => void;
}) {
  if (isLast) {
    return (
      <div className="flex items-center">
        <SlashIcon />
        <span className="ml-2 text-sm font-medium text-gray-500">{name}</span>
      </div>
    );
  }
  if (parent) {
    return (
      <div className="flex items-center">
        <SlashIcon />
        <button
          onClick={() =>
            onClick(
              parent.recordId
                ? `${parent.fieldId}:${parent.recordId}`
                : parent.fieldId
            )
          }
          data-link={`${
            parent.recordId
              ? `${parent.fieldId}:${parent.recordId}`
              : parent.fieldId
          }`}
          className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          {name}
        </button>
      </div>
    );
  }
  return (
    <div>
      <button
        onClick={() => onClick(null)}
        className="text-gray-400 hover:text-gray-500 flex items-center"
      >
        <HomeIcon className="flex-shrink-0 h-5 w-5" aria-hidden="true" />
        <span className="sr-only">{name}</span>
      </button>
    </div>
  );
}

function SlashIcon() {
  return (
    <svg
      className="flex-shrink-0 h-5 w-5 text-gray-300"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
    </svg>
  );
}
