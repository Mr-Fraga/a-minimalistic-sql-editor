
import React from "react";

interface TableColumnHandlerProps {
  columns: string[];
  onInsertColumn?: (col: string) => void;
}
function TableColumns({ columns, onInsertColumn }: TableColumnHandlerProps) {
  return (
    <div className="flex flex-wrap gap-x-2">
      {columns.map((col) => (
        <button
          key={col}
          className="bg-gray-100 rounded px-2 py-0.5 text-xs text-gray-800 mb-1 hover:bg-gray-300 transition cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onInsertColumn?.(col);
          }}
          type="button"
        >
          {col}
        </button>
      ))}
    </div>
  );
}

interface TableTooltipContentProps {
  schema: string;
  table: {
    name: string;
    columns: string[];
    description?: string;
    owner?: string;
  };
  onInsertColumn?: (col: string) => void;
}
const TableTooltipContent: React.FC<TableTooltipContentProps> = ({
  schema,
  table,
  onInsertColumn,
}) => (
  <div>
    <div className="font-bold text-xs uppercase tracking-wider mb-1">
      {schema}.{table.name}
    </div>
    <div className="mb-1">
      <span className="block text-xs text-gray-600 font-semibold mb-0.5">
        Description:
      </span>
      <span className="block text-xs text-gray-800 mb-1">
        {table.description || "No description."}
      </span>
      <span className="block text-xs text-gray-600 font-semibold mb-0.5">
        Owner:
      </span>
      <span className="block text-xs text-gray-800 mb-2">
        {table.owner || "Unknown"}
      </span>
    </div>
    <div className="text-xs text-gray-600 mb-1">Columns:</div>
    <TableColumns columns={table.columns} onInsertColumn={onInsertColumn} />
  </div>
);

export default TableTooltipContent;
