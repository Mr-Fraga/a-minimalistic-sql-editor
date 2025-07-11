import React, { useState, useMemo, useEffect, useCallback } from "react";
// Import SCHEMA_DATA and helpers from the new file
import { SCHEMA_DATA, rand, range, randInt } from "./mockSchemaData";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Pin } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import SchemaExplorer from "./SchemaExplorer";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import EnvToggle from "./EnvToggle";
import SchemaExplorerList from "./SchemaExplorerList";
import TableTooltipContent from "./TableTooltipContent";

interface TableExplorerProps {
  onInsertSchemaTable?: (schema: string, table: string) => void;
  onInsertColumn?: (col: string) => void;
  style?: React.CSSProperties;
  role: string; // Add a role prop
}

// Helper to detect sensitive table
function isSensitiveTable(tableName: string): boolean {
  const name = tableName.toLowerCase();
  return name.includes("user") || name.includes("employee");
}

// --- NEW: Helper to create a stable pinned-table id ---
function pinnedId(schema: string, table: string) {
  return `${schema}.${table}`;
}

const PINNED_TABLES_STORAGE_KEY = "pinned_tables_v1";

const TableExplorer: React.FC<TableExplorerProps> = ({
  onInsertSchemaTable,
  onInsertColumn,
  style = {},
  role,
}) => {
  const [search, setSearch] = useState("");
  const [openSchemas, setOpenSchemas] = useState<Record<string, boolean>>({});
  // Add environment state
  const [env, setEnv] = useState<"DEV" | "STG" | "PRD">("DEV");
  // --- NEW: Pinned tables state ---
  const [pinnedTables, setPinnedTables] = useState<
    { schema: string; table: string }[]
  >([]);

  // --- Load/store pinned tables from localStorage ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PINNED_TABLES_STORAGE_KEY);
      if (saved) {
        setPinnedTables(JSON.parse(saved));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PINNED_TABLES_STORAGE_KEY, JSON.stringify(pinnedTables));
    } catch {}
  }, [pinnedTables]);

  const togglePinTable = useCallback(
    (schema: string, table: string) => {
      setPinnedTables((prev) => {
        const alreadyPinned = prev.some(
          (pt) => pt.schema === schema && pt.table === table
        );
        if (alreadyPinned) {
          toast({
            title: "Table unpinned",
            description: `${schema}.${table} removed from Pinned Tables`,
          });
          return prev.filter((pt) => pt.schema !== schema || pt.table !== table);
        } else {
          toast({
            title: "Table pinned",
            description: `${schema}.${table} added to Pinned Tables`,
          });
          return [...prev, { schema, table }];
        }
      });
    },
    [setPinnedTables]
  );

  // Reset openSchemas when the list of schemas, or the role, changes
  React.useEffect(() => {
    const collapsed: Record<string, boolean> = {};
    for (const s of SCHEMA_DATA) collapsed[s.schema] = false;
    setOpenSchemas(collapsed);
  }, [role]);

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
    const filterTables = (tables: any[]) => {
      if (role === "sensitive") {
        // Only show sensitive tables
        return tables.filter((t) => isSensitiveTable(t.name));
      }
      // For other roles, only show non-sensitive tables
      return tables.filter((t) => !isSensitiveTable(t.name));
    };

    if (!search.trim()) {
      return SCHEMA_DATA.map(schema => ({
        ...schema,
        tables: filterTables(schema.tables),
      })).filter(schema => schema.tables.length > 0);
    }
    // With search, still filter based on sensitive access
    return SCHEMA_DATA.map((schema) => ({
      ...schema,
      tables: filterTables(
        schema.tables.filter((t) =>
          t.name.toLowerCase().includes(search.trim().toLowerCase())
        )
      ),
    })).filter((schema) => schema.tables.length > 0);
  }, [search, role]);


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

  // Helper: highlight letters in 'label' matching 'search'
  function highlightMatch(label: string, search: string) {
    if (!search) return label;
    const idx = label.toLowerCase().indexOf(search.toLowerCase());
    if (idx === -1) return label;
    // Highlight only the first occurrence
    return (
      <>
        {label.slice(0, idx)}
        <span className="bg-yellow-200 font-semibold rounded">{label.slice(idx, idx + search.length)}</span>
        {label.slice(idx + search.length)}
      </>
    );
  }

  // --- NEW: Find details about a pinned table ---
  function getPinnedTableMeta(schema: string, table: string) {
    const schemaObj = SCHEMA_DATA.find(s => s.schema === schema);
    if (!schemaObj) return null;
    const tableObj = schemaObj.tables.find(t => t.name === table);
    if (!tableObj) return null;
    return tableObj;
  }

  // --- UPDATED: Pin icon for table list row ---
  const renderTablePinIcon = (schema: string, table: string) => {
    const isPinned = pinnedTables.some(pt => pt.schema === schema && pt.table === table);
    return (
      <button
        type="button"
        aria-label={isPinned ? "Unpin table" : "Pin table"}
        tabIndex={0}
        className={`p-1 ml-2 rounded text-gray-400 hover:text-gray-500`}
        onClick={e => {
          e.stopPropagation();
          togglePinTable(schema, table);
        }}
      >
        <Pin fill="none" color="#9ca3af" strokeWidth={2} size={16} />
      </button>
    );
  };

  // --- UPDATED: Custom SchemaExplorerList with pin icons passed as render prop ---
  const renderSchemaExplorerList = () => (
    <ul className="space-y-2 flex-1 overflow-y-auto px-2">
      {filteredSchemas.map((schema) => (
        <li key={schema.schema}>
          <Collapsible open={openSchemas[schema.schema]} onOpenChange={() => toggleSchema(schema.schema)}>
            <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => toggleSchema(schema.schema)}>
              {openSchemas[schema.schema] ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <span className="text-gray-700 text-base font-bold">
                {schema.schema}
                <span className="ml-2 text-xs text-gray-400 font-normal">
                  ({schema.tables.length})
                </span>
              </span>
            </div>
            <CollapsibleContent>
              <ul className="pl-6 mt-2 space-y-1">
                {schema.tables.map((table) => (
                  <li key={table.name} className="flex items-center w-full">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="text-left text-sm w-full px-2 py-1 rounded hover:bg-black hover:text-white transition flex-1"
                          onClick={() => handleTableClick(schema.schema, table.name)}
                          type="button"
                        >
                          {highlightMatch(table.name, search)}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="p-3 max-w-xs break-words">
                        <TableTooltipContent
                          schema={schema.schema}
                          table={table}
                          onInsertColumn={onInsertColumn}
                        />
                      </TooltipContent>
                    </Tooltip>
                    {/* Pin icon */}
                    {renderTablePinIcon(schema.schema, table.name)}
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </li>
      ))}
    </ul>
  );

  // --- Collapsible state for pinned tables ---
  const [showPinned, setShowPinned] = useState(true);

  // Ensure that when pinnedTables gets non-empty, pinned section is opened by default
  React.useEffect(() => {
    if (pinnedTables.length > 0) {
      setShowPinned(true);
    }
  }, [pinnedTables.length]);

  // --- UPDATED: Collapsible for pinned tables, now at the top, WITHOUT chevron icon ---
  const renderPinnedTables = () => {
    if (!pinnedTables.length) return null;
    return (
      <Collapsible open={showPinned} onOpenChange={setShowPinned}>
        <div
          className="flex items-center justify-between px-4 pt-4 select-none cursor-pointer"
        >
          <span
            className="font-bold text-base text-gray-800"
            style={{ letterSpacing: "0.04em", textTransform: "none", cursor: "pointer" }}
            onClick={() => setShowPinned((v) => !v)}
          >
            Pinned Tables
          </span>
        </div>
        <CollapsibleContent>
          <ul className="my-2">
            {pinnedTables.map(({ schema, table }) => {
              const tableMeta = getPinnedTableMeta(schema, table);
              const isSelected = false;
              return (
                <li key={pinnedId(schema, table)}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="flex items-center gap-2 px-6 py-1 rounded group hover:bg-black hover:text-white text-sm w-full justify-between"
                        onClick={() => handleTableClick(schema, table)}
                        type="button"
                      >
                        <span className="flex-1 text-left">
                          {highlightMatch(`${schema}.${table}`, search)}
                        </span>
                        <Pin
                          fill="none"
                          color={"#9ca3af"}
                          className="shrink-0 ml-2"
                          size={16}
                        />
                      </button>
                    </TooltipTrigger>
                    {tableMeta && (
                      <TooltipContent className="p-3 max-w-xs break-words" side="right">
                        <TableTooltipContent
                          schema={schema}
                          table={tableMeta}
                          onInsertColumn={onInsertColumn}
                        />
                      </TooltipContent>
                    )}
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  // --- Collapsible state for Explorer (schema section), open by default ---
  const [showExplorer, setShowExplorer] = useState(true);

  // Move pinned tables above Explorer title, and restyle as requested
  return (
    <div
      className="h-full border-l bg-white min-w-[220px] flex flex-col"
      style={{
        marginTop: 0,
        paddingTop: 8,
        height: "100%",
        ...style
      }}
    >
      {/* Pinned Tables as first section */}
      {renderPinnedTables()}
      {/* Explorer section: NO chevron, collapse only with title click */}
      <Collapsible open={showExplorer} onOpenChange={setShowExplorer}>
        <div
          className="flex items-center justify-between px-4 mt-4 select-none"
        >
          <h2
            className="font-bold text-base text-gray-800 mb-2 mt-0"
            style={{ letterSpacing: "0.04em", textTransform: "none", cursor: "pointer" }}
            onClick={() => setShowExplorer(v => !v)}
          >
            Explorer
          </h2>
        </div>
        <CollapsibleContent>
          <div className="mb-3 px-4 flex justify-start">
            <EnvToggle
              value={env}
              onChange={setEnv}
            />
          </div>
          <div className="mb-4 px-2">
            <input
              placeholder="Search tables..."
              className="h-8 text-sm px-3 border rounded-lg w-full bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {filteredSchemas.length === 0 && (
            <div className="text-xs text-gray-400 px-2">No tables found</div>
          )}
          {renderSchemaExplorerList()}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default TableExplorer;
