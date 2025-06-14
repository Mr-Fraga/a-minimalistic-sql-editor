import React, { useState, useMemo } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

// Mock data: schemas, tables, columns
const SCHEMA_DATA = [
  {
    schema: "public",
    tables: [
      {
        name: "users",
        columns: ["id", "name", "email", "created_at"],
        description: "All application users currently registered.",
        owner: "admin_account",
      },
      {
        name: "orders",
        columns: ["id", "user_id", "total", "date"],
        description: "Records of all purchases/orders made by users.",
        owner: "orders_ops",
      },
      {
        name: "products",
        columns: ["id", "name", "price"],
        description: "Product catalog items.",
        owner: "shop_manager",
      },
      {
        name: "categories",
        columns: ["id", "title", "description"],
        description: "Product category organization.",
        owner: "shop_manager",
      },
    ],
  },
  {
    schema: "audit",
    tables: [
      {
        name: "logs",
        columns: ["id", "table", "user", "change_type", "date"],
        description: "Audit logs for changes to tables in the database.",
        owner: "security_team",
      },
    ],
  },
];

interface TableExplorerProps {
  onInsertSchemaTable?: (schema: string, table: string) => void;
  onInsertColumn?: (col: string) => void;
}

const TableExplorer: React.FC<TableExplorerProps> = ({
  onInsertSchemaTable,
  onInsertColumn,
}) => {
  const [search, setSearch] = useState("");
  const [openSchemas, setOpenSchemas] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (
      Object.keys(openSchemas).length === 0 &&
      SCHEMA_DATA.length > 0
    ) {
      const collapsed: Record<string, boolean> = {};
      for (const s of SCHEMA_DATA) collapsed[s.schema] = false;
      setOpenSchemas(collapsed);
    }
    // eslint-disable-next-line
  }, []);

  const filteredSchemas = useMemo(() => {
    if (!search.trim()) return SCHEMA_DATA;
    return SCHEMA_DATA.map((schema) => ({
      ...schema,
      tables: schema.tables.filter((t) =>
        t.name.toLowerCase().includes(search.trim().toLowerCase())
      ),
    })).filter((schema) => schema.tables.length > 0);
  }, [search]);

  const toggleSchema = (schema: string) => {
    setOpenSchemas((prev) => ({
      ...prev,
      [schema]: !prev[schema]
    }));
  };

  // Insert column at cursor in editor
  const handleColumnClick = (col: string) => {
    onInsertColumn?.(col);
  };

  // Insert schema.table at cursor in editor
  const handleTableClick = (schema: string, table: string) => {
    onInsertSchemaTable?.(schema, table);
  };

  return (
    <div className="h-full bg-gray-50 border-r border-gray-200 px-4 py-5 min-w-[220px]">
      <h2 className="font-bold text-gray-800 text-base mb-2 uppercase tracking-wider">
        Schemas & Tables
      </h2>
      <div className="mb-4">
        <Input
          placeholder="Search tables..."
          className="h-8 text-sm px-2"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {filteredSchemas.length === 0 && (
        <div className="text-xs text-gray-400 px-2">No tables found</div>
      )}
      <ul className="space-y-2">
        {filteredSchemas.map((schema) => (
          <li key={schema.schema}>
            <Collapsible open={openSchemas[schema.schema]} onOpenChange={() => toggleSchema(schema.schema)}>
              <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => toggleSchema(schema.schema)}>
                {openSchemas[schema.schema] ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <span className="font-mono text-gray-700 text-base font-bold">
                  {schema.schema}
                  <span className="ml-2 text-xs text-gray-400 font-normal">({schema.tables.length})</span>
                </span>
              </div>
              <CollapsibleContent>
                <ul className="pl-6 mt-2 space-y-1">
                  {schema.tables.map((table) => (
                    <li key={table.name}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="font-mono text-left text-sm w-full px-2 py-1 rounded hover:bg-black hover:text-white transition"
                            onClick={() => handleTableClick(schema.schema, table.name)}
                            type="button"
                          >
                            {table.name}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="p-3 max-w-xs break-words">
                          <div>
                            {/* Table description and owner above columns */}
                            <div className="font-bold text-xs uppercase tracking-wider mb-1">
                              {schema.schema}.{table.name}
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
                            <div className="flex flex-wrap gap-x-2">
                              {table.columns.map((col) => (
                                <button
                                  key={col}
                                  className="bg-gray-100 rounded px-2 py-0.5 text-xs text-gray-800 mb-1 hover:bg-gray-300 transition cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleColumnClick(col);
                                  }}
                                  type="button"
                                >
                                  {col}
                                </button>
                              ))}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TableExplorer;
