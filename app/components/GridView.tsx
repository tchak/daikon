import { useEffect } from 'react';
import {
  useTable,
  Column,
  useRowSelect,
  UseRowSelectRowProps,
  UseRowSelectState,
} from 'react-table';

export type DataRow = { id: string; data: Record<string, unknown> };

export function GridView<T extends DataRow = DataRow>({
  columns,
  data,
  onSelect,
}: {
  columns: Column<T>[];
  data: T[];
  onSelect?: (rowIds: string[]) => void;
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
  } = useTable<T>({ columns, data }, useRowSelect, (hooks) => {
    hooks.visibleColumns.push((columns) => [
      {
        id: 'selection',
        Header: () => null,
        Cell: ({ row }: { row: UseRowSelectRowProps<DataRow> }) => {
          const { indeterminate, ...props } = row.getToggleRowSelectedProps();
          return (
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                ref={(input) => {
                  if (input) {
                    input.indeterminate = indeterminate ?? false;
                  }
                }}
                {...props}
              />
            </div>
          );
        },
      },
      ...columns,
    ]);
  });
  const { selectedRowIds } = state as UseRowSelectState<DataRow>;
  useEffect(() => {
    if (onSelect) {
      const ids = Object.keys(selectedRowIds)
        .filter((index) => data[Number(index)])
        .map((index) => data[Number(index)].id as string);
      onSelect(ids);
    }
  }, [selectedRowIds]);

  return (
    <table {...getTableProps()} className="divide-y divide-gray-200 text-sm">
      <thead className="bg-gray-50">
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th
                {...column.getHeaderProps()}
                scope="col"
                className="px-3 py-2 text-left text-gray-500 tracking-wider font-normal border-gray-300 border-r"
              >
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody
        {...getTableBodyProps()}
        className="bg-white divide-y divide-gray-200 text-xs"
      >
        {rows?.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return (
                  <td
                    {...cell.getCellProps()}
                    className="p-1 whitespace-nowrap text-gray-500 border-gray-300 border-r"
                  >
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
