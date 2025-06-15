import React, { useState, useMemo, useEffect, useCallback } from "react";
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

// --- Extended dummy schemas and tables for exploration! --- //
const rand = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
function range(n: number) {
  return Array.from({ length: n }, (_, i) => i + 1);
}
function randInt(min: number, max: number): number {
  // Inclusive lower bound, inclusive upper bound.
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const SCHEMA_DATA = [
  {
    schema: "public",
    tables: [
      {
        name: "users",
        columns: ["id", "name", "email", "created_at"],
        description: "All application users currently registered.",
        owner: "admin_account",
        rowsSample: range(30).map(i => [
          i + 1,
          rand(["Alice", "Bob", "Cathy", "David", "Erin", "Frank", "Gina", "Helen", "Ian", "Jane", "Kyle", "Lana", "Mike", "Nina", "Ola", "Paul", "Quinn", "Ray", "Sara", "Tom", "Uma", "Viktor", "Wendy", "Xander", "Yana", "Zack"]),
          `user${i+1}@mail.com`,
          `2023-0${rand([1,2,3,4,5,6,7,8,9])}-${(rand([10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29])).toString().padStart(2,"0")}`
        ]),
      },
      {
        name: "orders",
        columns: ["id", "user_id", "total", "date"],
        description: "Records of all purchases/orders made by users.",
        owner: "orders_ops",
        rowsSample: range(28).map(i => [
          i + 1,
          randInt(1, 30),
          `$${(rand([20,35,50,29,79,110,14,7,88,67,99,45,31,59]) + Math.floor(Math.random()*10)).toFixed(2)}`,
          `2023-0${rand([1,2,3,4,5,6,7,8,9])}-${(rand([10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29])).toString().padStart(2,"0")}`
        ]),
      },
      {
        name: "products",
        columns: ["id", "name", "price"],
        description: "Product catalog items.",
        owner: "shop_manager",
        rowsSample: range(22).map(i => [
          i + 1,
          rand(["Pen", "Notebook", "Mug", "Backpack", "T-Shirt", "Sticker", "Lamp", "Laptop", "Phone", "Desk", "Monitor", "Keyboard", "Mouse", "Chair", "Bottle", "Bag", "Headphones", "Book", "USB Stick", "Charger", "Tablet", "Speaker"]),
          `$${(rand([5,20,15,99,49,150,79,9,22,57]) + Math.floor(Math.random()*10))}.00`,
        ]),
      },
      {
        name: "categories",
        columns: ["id", "title", "description"],
        description: "Product category organization.",
        owner: "shop_manager",
        rowsSample: range(15).map(i => [
          i + 1,
          rand(["Books", "Clothing", "Electronics", "Stationery", "Accessories", "Gadgets", "Homeware", "Promo", "Toys", "Drinkware", "Audio", "Attire", "Mobile", "Bags", "Tech"]),
          "Sample category for organizing products",
        ]),
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
        rowsSample: range(35).map(i => [
          i + 1,
          rand(["users","orders","products","categories"]),
          rand(["auditor1","auditor2","admin","sysop","John","Ashley"]),
          rand(["INSERT","UPDATE","DELETE"]),
          `2023-0${rand([1,2,3,4,5,6,7,8,9])}-${(rand([10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29])).toString().padStart(2,"0")}`
        ]),
      },
    ],
  },
  // New schema: sales
  {
    schema: "sales",
    tables: [
      {
        name: "invoices",
        columns: ["invoice_id", "customer", "total", "date_issued", "paid"],
        description: "All sales invoices in the system.",
        owner: "sales_team",
        rowsSample: range(25).map(i => [
          1000 + i,
          rand(["Alice Co.","Bravo LLC","Cathy Corp.","Delta Ltd.","Echo GmbH","Foxtrot Inc.","Golf SA","Hotel AG","India BV"]),
          `$${(rand([150,199,215,110,128,180]) + Math.floor(Math.random()*30)).toFixed(2)}`,
          `2024-0${rand([1,2,3,4,5,6])}-${(rand([10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29])).toString().padStart(2,"0")}`,
          rand(["true","false"])
        ])
      },
      {
        name: "sales_reps",
        columns: ["rep_id", "name", "territory"],
        description: "Sales team staff list.",
        owner: "hr",
        rowsSample: range(12).map(i => [
          200 + i,
          rand(["Anna","Ben","Cara","Dustin","Ella","Fred","Gina","Harry","Ivy","Jen","Karl","Liam"]),
          rand(["North","East","South","West","Central"]),
        ])
      },
    ],
  },
  // New schema: analytics
  {
    schema: "analytics",
    tables: [
      {
        name: "pageviews",
        columns: ["event_id", "page", "user_id", "timestamp"],
        description: "Web analytics page view events.",
        owner: "analytics_bot",
        rowsSample: range(40).map(i => [
          9000 + i,
          rand(["/","/login","/dashboard","/profile","/orders","/about","/products","/categories"]),
          randInt(1, 30),
          `2024-04-${(randInt(1,27)).toString().padStart(2,"0")} 0${randInt(0,8)}:${rand(["05","15","22","38","42","57"])}:00`
        ])
      },
      {
        name: "funnels",
        columns: ["step_id", "step_name", "visits"],
        description: "Track user funnel steps and conversion.",
        owner: "analytics_bot",
        rowsSample: range(8).map(i => [
          i + 1,
          rand(["Landing","Sign Up","Email Entered","Payment","Onboarded","Trial","Upgrade","Churn"]),
          randInt(500,1000),
        ])
      },
    ],
  },
  // New schema: hr
  {
    schema: "hr",
    tables: [
      {
        name: "employees",
        columns: ["emp_id", "name", "dept", "hire_date"],
        description: "Registered company employees.",
        owner: "hr_dept",
        rowsSample: range(38).map(i => [
          3000 + i,
          rand(["Alex","Barbara","Carlos","Diana","Eva","Frank","Grace","Hank","Irene","Jacob","Kate","Leo","Maria","Ned","Olga","Peter","Quincy","Rita","Steve","Tina","Ulysses","Veronica","Will","Xena","Yuri","Zora"]),
          rand(["IT","Sales","HR","Finance","Legal","Analytics"]),
          `20${rand([11,12,13,14,15,16,17,18,19,20,21,22])}-0${randInt(1,8)}-${(randInt(1,27)).toString().padStart(2,"0")}`
        ])
      },
      {
        name: "departments",
        columns: ["dept_id", "dept_name", "manager"],
        description: "All business units.",
        owner: "hr_dept",
        rowsSample: range(6).map(i => [
          i + 1,
          rand(["HR","Sales","Finance","IT","Analytics","Legal"]),
          rand(["Yana","Ola","Paul","Grace","Ulysses","Tina","Leo"])
        ])
      }
    ],
  }
];

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

  // --- NEW: Find details about a pinned table ---
  function getPinnedTableMeta(schema: string, table: string) {
    const schemaObj = SCHEMA_DATA.find(s => s.schema === schema);
    if (!schemaObj) return null;
    const tableObj = schemaObj.tables.find(t => t.name === table);
    if (!tableObj) return null;
    return tableObj;
  }

  // --- NEW: Pin icon for table list row ---
  const renderTablePinIcon = (schema: string, table: string) => {
    const isPinned = pinnedTables.some(pt => pt.schema === schema && pt.table === table);
    return (
      <button
        type="button"
        aria-label={isPinned ? "Unpin table" : "Pin table"}
        tabIndex={0}
        className={`p-1 ml-2 rounded ${isPinned ? "text-yellow-500" : "text-gray-400 hover:text-gray-500"}`}
        onClick={e => {
          e.stopPropagation();
          togglePinTable(schema, table);
        }}
      >
        <Pin fill={isPinned ? "#facc15" : "none"} strokeWidth={2} size={16} />
      </button>
    );
  };

  // --- NEW: Custom SchemaExplorerList with pin icons passed as render prop ---
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
                          {table.name}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="p-3 max-w-xs break-words">
                        {/* TableTooltipContent is hidden for brevity */}
                        <div>
                          <div className="font-bold">{schema.schema}.{table.name}</div>
                          {table.description && <div className="text-xs mt-1">{table.description}</div>}
                        </div>
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

  // --- NEW: Render pinned tables section ---
  const renderPinnedTables = () => {
    if (!pinnedTables.length) return null;
    return (
      <div className="mb-2 px-4">
        <div className="text-xs text-gray-400 font-semibold mb-1 tracking-wide">Pinned Tables</div>
        <ul>
          {pinnedTables.map(({ schema, table }) => {
            const meta = getPinnedTableMeta(schema, table);
            if (!meta) return null;
            return (
              <li key={pinnedId(schema, table)}>
                <button
                  className="flex items-center gap-2 px-2 py-1 rounded group hover:bg-black hover:text-white text-sm w-full"
                  onClick={() => handleTableClick(schema, table)}
                >
                  <Pin fill="#facc15" className="shrink-0" size={14} />
                  <span className="font-medium">{schema}.{table}</span>
                  <span className="ml-1 text-xs text-gray-400 group-hover:text-white">{meta.description ? meta.description.slice(0, 22) : ""}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  // Remove vertical margin and start with flush title for better alignment in TabView
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
      {/* Title uses 'Explorer' in sentence case, styled for tab view consistency */}
      <h2 className="font-bold text-base text-gray-800 mb-2 ml-4" style={{ letterSpacing: "0.04em", textTransform: "none" }}>
        Explorer
      </h2>
      {/* Environment ToggleGroup */}
      <div className="mb-3 px-4 flex justify-start">
        <EnvToggle
          value={env}
          onChange={setEnv}
        />
      </div>
      {/* Pinned Tables Section */}
      {renderPinnedTables()}
      {/* Search Input */}
      <div className="mb-4 px-2">
        <input
          placeholder="Search tables..."
          className="h-8 text-sm px-3 border rounded-lg w-full bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {/* No tables found message */}
      {filteredSchemas.length === 0 && (
        <div className="text-xs text-gray-400 px-2">No tables found</div>
      )}
      {/* Schema List with pin icons */}
      {renderSchemaExplorerList()}
    </div>
  );
};

export default TableExplorer;
