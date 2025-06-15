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
      {/* Search Input */}
      <div className="mb-4 px-2">
        <input
          placeholder="Search tables..."
          className="h-8 text-sm px-3 border rounded-lg w-full bg-white focus:outline-none focus:ring-2 focus:ring-primary" // Use rounded-lg for rounded rectangle
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {/* No tables found message */}
      {filteredSchemas.length === 0 && (
        <div className="text-xs text-gray-400 px-2">No tables found</div>
      )}
      {/* Schema List */}
      <SchemaExplorerList
        schemas={filteredSchemas}
        openSchemas={openSchemas}
        onToggleOpen={toggleSchema}
        onInsertSchemaTable={onInsertSchemaTable}
        onInsertColumn={onInsertColumn}
      />
    </div>
  );
};

export default TableExplorer;
