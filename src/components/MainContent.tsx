
import React, { useState, useCallback } from "react";
import { useLocalStorage, useDebounce } from "./MainContentHooks";
import TabView from "@/components/TabView";
import TabBar from "@/components/TabBar";
import { toast } from "@/hooks/use-toast";
import { SqlEditorImperativeHandle } from "@/components/SqlEditor";

// Types (copy from old file)
type TabType = {
  id: string;
  name: string;
  sql: string;
  result: { columns: string[]; rows: Array<any[]> } | null;
  error: string | null;
  isRunning: boolean;
};

const DEFAULT_SQL = `SELECT * FROM users LIMIT 10;`;
const MOCK_RESULT = {
  columns: ["id", "name", "email"],
  rows: [
    [1, "Alice", "alice@email.com"],
    [2, "Bob", "bob@email.com"],
    [3, "Charlie", "charlie@email.com"],
  ]
};
const DEFAULT_TAB: Omit<TabType, "id"> = {
  name: "New Tab",
  sql: DEFAULT_SQL,
  result: MOCK_RESULT,
  error: null,
  isRunning: false,
};
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

interface MainContentProps {
  sqlEditorRef: React.RefObject<SqlEditorImperativeHandle | null>;
}

const MainContent: React.FC<MainContentProps> = ({ sqlEditorRef }) => {
  const [tabs, setTabs] = useLocalStorage<TabType[]>("tabs", [
    { ...DEFAULT_TAB, id: generateId(), name: "Tab 1" },
  ]);
  const [activeTabId, setActiveTabId] = useLocalStorage<string>(
    "activeTabId",
    tabs[0]?.id
  );
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  // Tab operations
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

  // --- QUERY API ---
  const apiUrl = "http://localhost:8000";
  const USE_MOCK_QUERY = true;

  const runSql = useCallback(
    async (sql: string, tabId: string) => {
      updateTab(tabId, { isRunning: true, error: null, result: null });
      try {
        if (USE_MOCK_QUERY) {
          await new Promise((res) => setTimeout(res, 350));
          updateTab(tabId, { result: MOCK_RESULT, error: null });
        } else {
          const response = await fetch(`${apiUrl}/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
      runSql(selection || activeTab.sql, activeTab.id);
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
        headers: { "Content-Type": "application/json" },
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

  // CSV Export
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

      // Create a download link with tabname_timestamp pattern
      function sanitize(str: string) {
        return str.replace(/[^a-zA-Z0-9_\- ]/g, "_");
      }
      const now = new Date();
      const timestamp =
        now.getFullYear().toString() +
        ("0" + (now.getMonth() + 1)).slice(-2) +
        ("0" + now.getDate()).slice(-2) +
        "_" +
        ("0" + now.getHours()).slice(-2) +
        ("0" + now.getMinutes()).slice(-2) +
        ("0" + now.getSeconds()).slice(-2);
      const fname = `${sanitize(activeTab.name)}_${timestamp}.csv`;

      const blob = new Blob([csvString], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("href", url);
      a.setAttribute("download", fname);
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

  // -- RENDER --
  return (
    <div className="flex-1 flex flex-col h-full">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        setActiveTabId={setActiveTabId}
        addTab={addTab}
        closeTab={closeTab}
        renameTab={renameTab}
      />
      <div className="flex-1 flex flex-col px-6 md:px-8 mt-4">
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

export default MainContent;
