
import React, { useState, useMemo } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

const TABLES = [
  { name: "users", columns: ["id", "name", "email", "created_at"] },
  { name: "orders", columns: ["id", "user_id", "total", "date"] },
  { name: "products", columns: ["id", "name", "price"] },
  { name: "categories", columns: ["id", "title", "description"] },
];

interface TableExplorerProps {
  onTableClick?: (table: string) => void;
}

const TableExplorer: React.FC<TableExplorerProps> = ({ onTableClick }) => {
  const [search, setSearch] = useState("");

  const filteredTables = useMemo(() => {
    if (!search.trim()) return TABLES;
    return TABLES.filter((table) =>
      table.name.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [search]);

  return (
    <div className="h-full bg-gray-50 border-r border-gray-200 px-4 py-5 min-w-[180px]">
      <h2 className="font-bold text-gray-800 text-base mb-2 uppercase tracking-wider">Tables</h2>
      <div className="mb-4">
        <Input
          placeholder="Search tables..."
          className="h-8 text-sm px-2"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <ul className="space-y-2">
        {filteredTables.length === 0 && (
          <li className="text-xs text-gray-400 px-2">No tables found</li>
        )}
        {filteredTables.map((table) => (
          <li key={table.name}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="font-mono text-left text-sm w-full px-2 py-1 rounded hover:bg-black hover:text-white transition"
                  onClick={() => onTableClick?.(table.name)}
                  type="button"
                >
                  {table.name}
                </button>
              </TooltipTrigger>
              <TooltipContent className="p-3 max-w-xs break-words">
                <div>
                  <div className="font-bold text-xs uppercase tracking-wider mb-1">{table.name}</div>
                  <div className="text-xs text-gray-600 mb-1">Columns:</div>
                  <ul className="list-disc list-inside text-xs text-gray-800">
                    {table.columns.map((col) => (
                      <li key={col} className="">{col}</li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TableExplorer;

