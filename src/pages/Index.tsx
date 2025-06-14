import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  Sidebar,
} from "@/components/ui/sidebar"; // use shadcn/ui sidebar
import TableExplorer from "@/components/TableExplorer";

import TabView from "@/components/TabView";
import AccountSection from "@/components/AccountSection";
import { SqlEditorImperativeHandle } from "@/components/SqlEditor";
import TableTooltipContent from "@/components/TableTooltipContent";
import { Plus } from "lucide-react";

// Add simple local implementations for useLocalStorage and useDebounce

function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  const setStoredValue = (val: T) => {
    setValue(val);
    try {
      window.localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  };
  return [value, setStoredValue];
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounced(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

// Add this DEFAULT_SQL definition just before the Index component
const DEFAULT_SQL = `SELECT * FROM users LIMIT 10;`;

const MOCK_RESULT = {
  columns: ["id", "name", "email"],
  rows: [
    [1, "Alice", "alice@email.com"],
    [2, "Bob", "bob@email.com"],
    [3, "Charlie", "charlie@email.com"],
  ]
};

const Index: React.FC = () => {
  // SQL Editor ref (shared so TableExplorer can write to editor)
  const sqlEditorRef = useRef<SqlEditorImperativeHandle | null>(null);

  return (
    <div className="min-h-screen h-screen w-full flex flex-col bg-white">
      {/* Top horizontal panel */}
      <div
        className="w-full bg-white flex items-center" // removed shadow-sm and border styles here
        style={{ zIndex: 10, minHeight: "56px" }}
      >
        <div className="px-0 py-0 w-full flex items-center justify-end">
          <AccountSection account="john@example.com" role="readonly" />
        </div>
      </div>
      {/* Main content area */}
      <div className="flex-1 flex flex-row w-full min-h-0 h-full bg-white">
        {/* Sidebar with TableExplorer, passing callbacks */}
        <div className="h-full flex flex-col min-h-0">
          <TableExplorer
            onInsertSchemaTable={(schema, table) => {
              if (sqlEditorRef.current) {
                // Insert schema.table at cursor
                sqlEditorRef.current.insertAtCursor(`${schema}.${table}`);
              }
            }}
            onInsertColumn={(col) => {
              if (sqlEditorRef.current) {
                sqlEditorRef.current.insertAtCursor(col);
              }
            }}
          />
        </div>
        <div className="flex-1 min-h-0 flex flex-col h-full">
          <PageContent sqlEditorRef={sqlEditorRef} />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Page Content
// ============================================================================

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

// MODIFY: result will always be set to MOCK_RESULT by default
type TabType = {
  id: string;
  name: string;
  sql: string;
  result: { columns: string[]; rows: Array<any[]> } | null;
  error: string | null;
  isRunning: boolean;
};

const DEFAULT_TAB: Omit<TabType, "id"> = {
  name: "New Tab",
  sql: DEFAULT_SQL,
  result: MOCK_RESULT, // show mock result by default
  error: null,
  isRunning: false,
};

interface PageContentProps {
  sqlEditorRef: React.RefObject<SqlEditorImperativeHandle | null>;
}

const PageContent: React.FC<PageContentProps> = ({ sqlEditorRef }) => {
  // Initial tab should have mock results by default
  const [tabs, setTabs] = useLocalStorage<TabType[]>("tabs", [
    { ...DEFAULT_TAB, id: generateId(), name: "Tab 1" },
  ]);
  const [activeTabId, setActiveTabId] = useLocalStorage<string>(
    "activeTabId",
    tabs[0]?.id
  );

  // Find the active tab
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  // ========================= TABS =========================
  const addTab = useCallback(() => {
    // new tabs should show mock result by default
    const newTab: TabType = {
      ...DEFAULT_TAB,
      id: generateId(),
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  }, [tabs, setTabs, setActiveTabId]);

  const closeTab = useCallback(
    (id: string) => {
      const newTabs = tabs.filter((tab) => tab.id !== id);
      setTabs(newTabs);
      if (activeTabId === id) {
        setActiveTabId(newTabs[0]?.id || null);
      }
    },
    [tabs, setTabs, activeTabId, setActiveTabId]
  );

  const updateTab = useCallback(
    (id: string, updates: Partial<TabType>) => {
      const newTabs = tabs.map((tab) =>
        tab.id === id ? { ...tab, ...updates } : tab
      );
      setTabs(newTabs);
    },
    [tabs, setTabs]
  );

  const renameTab = useCallback(
    (id: string, newName: string) => {
      updateTab(id, { name: newName });
    },
    [updateTab]
  );

  const onSqlChange = useCallback(
    (sql: string) => {
      if (!activeTab) return;
      updateTab(activeTab.id, { sql });
    },
    [activeTab, updateTab]
  );

  // ========================= API =========================

  // Default to the local backend URL
  const apiUrl = "http://localhost:8000";

  // Add a flag to use mock responses for queries
  const USE_MOCK_QUERY = true;

  const runSql = useCallback(
    async (sql: string, tabId: string) => {
      updateTab(tabId, { isRunning: true, error: null, result: null });
      try {
        if (USE_MOCK_QUERY) {
          // Always resolve with mock data
          await new Promise((res) => setTimeout(res, 350));
          updateTab(tabId, { result: MOCK_RESULT, error: null });
        } else {
          const response = await fetch(`${apiUrl}/query`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sql }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Unknown error occurred");
          }

          const data = await response.json();
          updateTab(tabId, { result: data, error: null });
        }
      } catch (error: any) {
        console.error("Query failed!", error);
        updateTab(tabId, { error: error.message, result: null });
        toast({
          title: "Query failed!",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        updateTab(tabId, { isRunning: false });
      }
    },
    [updateTab]
  );

  const onRun = useCallback(
    (selection?: string) => {
      if (!activeTab) return;
      const sql = selection || activeTab.sql;
      runSql(sql, activeTab.id);
    },
    [activeTab, runSql]
  );

  const onRunAll = useCallback(() => {
    if (!activeTab) return;
    runSql(activeTab.sql, activeTab.id);
  }, [activeTab, runSql]);

  const onFormat = useCallback(async () => {
    if (!activeTab) return;
    try {
      const response = await fetch(`${apiUrl}/format`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql: activeTab.sql }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unknown error occurred");
      }

      const data = await response.json();
      onSqlChange(data.formatted);
      toast({
        title: "SQL Formatted!",
        description: "Your SQL has been formatted.",
      });
    } catch (error: any) {
      console.error("Format failed!", error);
      toast({
        title: "Format failed!",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [activeTab, apiUrl, toast, onSqlChange]);

  // ========================= Download CSV =========================

  const onDownloadCsv = useCallback(
    (rowsToExport?: Array<any[]>) => {
      if (!activeTab || !activeTab.result) {
        toast({
          title: "No results to download!",
          description: "Run a query first.",
          variant: "destructive",
        });
        return;
      }

      const rows = rowsToExport || activeTab.result.rows;
      const columns = activeTab.result.columns;

      if (!rows || rows.length === 0) {
        toast({
          title: "No rows to download!",
          description: "The query returned no rows.",
          variant: "destructive",
        });
        return;
      }

      // Convert data to CSV format
      const csvRows = [];
      csvRows.push(columns.join(",")); // Add headers

      for (const row of rows) {
        const values = row.map((value) => {
          if (typeof value === "string") {
            return `"${value.replace(/"/g, '""')}"`; // Escape double quotes
          }
          return value;
        });
        csvRows.push(values.join(","));
      }

      const csvString = csvRows.join("\n");

      // Create a download link
      const blob = new Blob([csvString], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("href", url);
      a.setAttribute("download", `${activeTab.name}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast({
        title: "CSV Download Started!",
        description: "Your download should start automatically.",
      });
    },
    [activeTab, toast]
  );

  // ========================= Render =========================

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center bg-white border-b border-black px-2 transition-colors duration-100">
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            id={tab.id}
            name={tab.name}
            isActive={tab.id === activeTabId}
            onTabClick={() => setActiveTabId(tab.id)}
            onTabClose={closeTab}
            onTabRename={renameTab}
          />
        ))}
        {/* Replace "New Tab" button with only a + icon */}
        <Button variant="ghost" size="sm" onClick={addTab}>
          <Plus className="w-4 h-4" />
        </Button>
        <div className="flex-1" />
        {/* Settings button has been removed */}
      </div>

      {/* Tab View with horizontal padding */}
      <div className="flex-1 flex flex-col px-6 md:px-8">
        {activeTab ? (
          <TabView
            tab={activeTab}
            sqlEditorRef={sqlEditorRef}
            onSqlChange={onSqlChange}
            onFormat={onFormat}
            onRun={onRun}
            onRunAll={onRunAll}
            onDownloadCsv={onDownloadCsv}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">No tab selected.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Tab Component
// ============================================================================

interface TabProps {
  id: string;
  name: string;
  isActive: boolean;
  onTabClick: () => void;
  onTabClose: (id: string) => void;
  onTabRename: (id: string, newName: string) => void;
}

const Tab: React.FC<TabProps> = ({
  id,
  name,
  isActive,
  onTabClick,
  onTabClose,
  onTabRename,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRename = () => {
    if (newName.trim() !== "") {
      onTabRename(id, newName);
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setNewName(name);
      setIsRenaming(false);
    }
  };

  return (
    <div
      className={`flex items-center px-3 py-2 rounded-t-md text-sm font-medium transition-colors hover:bg-gray-100 cursor-pointer select-none border
        ${isActive ? "bg-gray-100 border-black" : "bg-white border-black"}`}
      style={{
        borderBottom: isActive ? "2px solid black" : "2px solid black",
        borderLeft: "1px solid black",
        borderRight: "1px solid black",
        borderTop: "1px solid black"
      }}
      onDoubleClick={() => setIsRenaming(true)}
      onClick={onTabClick}
    >
      {isRenaming ? (
        <Input
          ref={inputRef}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleRename}
          className="text-sm font-medium rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 border-none shadow-none outline-none bg-transparent w-24"
        />
      ) : (
        <span className={`w-24 truncate ${isActive ? "font-bold" : ""}`}>{name}</span>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onTabClose(id);
        }}
        className="ml-1 -mr-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-x w-3 h-3"
        >
          <path d="M18 6 6 18" />
          <path d="M6 6 18 18" />
        </svg>
        <span className="sr-only">Close tab</span>
      </Button>
    </div>
  );
};

export default Index;
