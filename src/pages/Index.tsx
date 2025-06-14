import React, { useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Copy, Plus, Settings, ChevronDown } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useHotkeys } from "react-hotkeys-hook";

import Sidebar from "@/components/Sidebar";
import TabView from "@/components/TabView";
import AccountSection from "@/components/AccountSection";
import { SqlEditorImperativeHandle } from "@/components/SqlEditor";
import TableTooltipContent from "@/components/TableTooltipContent";

const DEFAULT_SQL = `SELECT * FROM users LIMIT 10;`;

const Index: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Top horizontal panel */}
      <div className="w-full bg-white shadow-sm flex items-center" style={{ zIndex: 10, minHeight: "56px" }}>
        {/* Example: Place AccountSection and any other top-panel components here */}
        <div className="px-0 py-0 w-full flex items-center justify-end">
          <AccountSection account="john@example.com" role="readonly" />
        </div>
      </div>
      {/* Main content area */}
      <div className="flex-1 w-full flex flex-row gap-0 bg-gray-50">
        <Sidebar />
        <PageContent />
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
  result: null,
  error: null,
  isRunning: false,
};

const PageContent: React.FC = () => {
  const [tabs, setTabs] = useLocalStorage<TabType[]>("tabs", [
    { ...DEFAULT_TAB, id: generateId(), name: "Tab 1" },
  ]);
  const [activeTabId, setActiveTabId] = useLocalStorage<string>(
    "activeTabId",
    tabs[0]?.id
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings
  const [settings, setSettings] = useLocalStorage("settings", {
    apiUrl: process.env.API_URL || "http://localhost:8000",
    autoFormat: true,
  });

  // Find the active tab
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  // SQL Editor ref
  const sqlEditorRef = useRef<SqlEditorImperativeHandle | null>(null);

  // ========================= TABS =========================
  const addTab = useCallback(() => {
    const newTab: TabType = { ...DEFAULT_TAB, id: generateId() };
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

  const runSql = useCallback(
    async (sql: string, tabId: string) => {
      updateTab(tabId, { isRunning: true, error: null, result: null });
      try {
        const response = await fetch(`${settings.apiUrl}/query`, {
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
    [updateTab, settings.apiUrl, toast]
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
      const response = await fetch(`${settings.apiUrl}/format`, {
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
  }, [activeTab, settings.apiUrl, toast, onSqlChange]);

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

  // ========================= Hotkeys =========================

  useHotkeys("ctrl+k, command+k", (e) => {
    e.preventDefault();
    setIsSettingsOpen((o) => !o);
  });

  useHotkeys("ctrl+enter, command+enter", (e) => {
    e.preventDefault();
    onRun();
  });

  useHotkeys("ctrl+shift+enter, command+shift+enter", (e) => {
    e.preventDefault();
    onRunAll();
  });

  useHotkeys("ctrl+alt+f, command+alt+f", (e) => {
    e.preventDefault();
    onFormat();
  });

  // ========================= Render =========================

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center bg-gray-100 border-b px-2">
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
        <Button variant="ghost" size="sm" onClick={addTab}>
          <Plus className="w-4 h-4 mr-1" />
          New Tab
        </Button>
        <div className="flex-1" />
        <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80"
            align="end"
            alignOffset={-5}
            side="bottom"
          >
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">API Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Configure the API endpoint.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">API URL</Label>
                <Input
                  id="api-url"
                  value={settings.apiUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, apiUrl: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Editor Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Configure the SQL editor.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-format">Auto Format</Label>
                <Switch
                  id="auto-format"
                  checked={settings.autoFormat}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoFormat: checked })
                  }
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Tab View */}
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

  // Focus input on rename
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
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
      className={`flex items-center px-3 py-2 rounded-t-md text-sm font-medium transition-colors hover:bg-gray-200 cursor-pointer select-none ${
        isActive ? "bg-gray-50 border-b-2 border-primary" : "bg-gray-100"
      }`}
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
        <span className="w-24 truncate" onClick={onTabClick}>
          {name}
        </span>
      )}
      {!isActive && (
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
      )}
      {isActive && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setIsRenaming(true);
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
            className="lucide lucide-pencil w-3 h-3"
          >
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
          <span className="sr-only">Rename tab</span>
        </Button>
      )}
    </div>
  );
};

export default Index;
