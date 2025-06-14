
import React from "react";

const TABLES = [
  { name: "users", columns: ["id", "name", "email", "created_at"] },
  { name: "orders", columns: ["id", "user_id", "total", "date"] },
  { name: "products", columns: ["id", "name", "price"] },
  { name: "categories", columns: ["id", "title", "description"] },
];

interface TableExplorerProps {
  onTableClick?: (table: string) => void;
}

const TableExplorer: React.FC<TableExplorerProps> = ({ onTableClick }) => (
  <div className="h-full bg-gray-50 border-r border-gray-200 px-4 py-5 min-w-[180px]">
    <h2 className="font-bold text-gray-800 text-base mb-2 uppercase tracking-wider">Tables</h2>
    <ul className="space-y-2">
      {TABLES.map((table) => (
        <li key={table.name}>
          <button
            className="font-mono text-left text-sm w-full px-2 py-1 rounded hover:bg-black hover:text-white transition"
            onClick={() => onTableClick?.(table.name)}
            type="button"
          >
            {table.name}
          </button>
          <ul className="pl-4">
            {table.columns.map((col) => (
              <li key={col} className="font-mono text-xs text-gray-500">{col}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  </div>
);

export default TableExplorer;
