import { useSearchParams } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/solid';

import { Breadcrumb } from '~/types';

export function GraphBreadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: ReadonlyArray<Breadcrumb>;
}) {
  const [params, setParams] = useSearchParams();
  const [[name], ...rest] = breadcrumbs;
  const setCellId = (leftId: string | null) => {
    if (leftId) {
      params.set('l', leftId);
    } else {
      params.delete('l');
    }
    setParams(params);
  };
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-2">
        {rest.map(([name, leftId], index) => (
          <li key={index}>
            {leftId ? (
              <div className="flex items-center">
                <SlasheIcon />
                <button
                  onClick={() => setCellId(leftId)}
                  className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  {name}
                </button>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setCellId(null)}
                  className="text-gray-400 hover:text-gray-500 flex items-center"
                >
                  <HomeIcon
                    className="flex-shrink-0 h-5 w-5"
                    aria-hidden="true"
                  />
                  <span className="sr-only">{name}</span>
                </button>
              </div>
            )}
          </li>
        ))}
        <li>
          <div className="flex items-center">
            <SlasheIcon />
            <span className="ml-2 text-sm font-medium text-gray-500">
              {name}
            </span>
          </div>
        </li>
      </ol>
    </nav>
  );
}

function SlasheIcon() {
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
