import React, { useRef } from "react";
import AccountSection from "@/components/AccountSection";
import TableExplorer from "@/components/TableExplorer";
import SqlEditor, { SqlEditorImperativeHandle } from "@/components/SqlEditor";
import ResultTable from "@/components/ResultTable";
import { Button } from "@/components/ui/button";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X } from "lucide-react";
import TabView, { TabType } from "@/components/TabView";

const DEFAULT_SQL = "SELECT * FROM users;";

function fakeRunQuery(sql: string): { columns: string[]; rows: Array<any[]> } | { error: string } {
  const lower = sql.trim().toLowerCase();
  if (!lower.endsWith(";")) {
    return { error: "Statement must end with a semicolon." };
  }
  if (lower.startsWith("select * from users")) {
    return {
      columns: ["id", "name", "email", "created_at"],
      rows: [
        [1, "Alice", "alice@email.com", "2023-01-01"],
        [2, "Bob", "bob@email.com", "2023-02-01"],
        [3, "Cathy", "cathy@email.com", "2023-03-11"],
      ],
    };
  }
  if (lower.startsWith("select * from orders")) {
    return {
      columns: ["id", "user_id", "total", "date"],
      rows: [
        [1, 1, "$25.00", "2023-04-01"],
        [2, 2, "$85.00", "2023-04-02"],
      ],
    };
  }
  return {
    error: "Mock engine: Only 'SELECT * FROM users;' and 'SELECT * FROM orders;' supported in this demo.",
  };
}

function formatSql(sql: string) {
  return sql
    .replace(/\bSELECT\b/i, "SELECT")
    .replace(/\bFROM\b/i, "\nFROM")
    .replace(/\bWHERE\b/i, "\nWHERE")
    .replace(/\s*;\s*$/, ";")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function newTabName(existing: TabType[]) {
  let i = 1;
  while (existing.find(tab => tab.name === `Tab ${i}`)) i++;
  return `Tab ${i}`;
}

const Index: React.FC = () => {
  const [tabs, setTabs] = React.useState<TabType[]>([
    {
      id: "tab-1",
      name: "Tab 1",
      sql: DEFAULT_SQL,
      result: null,
      error: null,
      isRunning: false,
    },
  ]);
  const [activeTab, setActiveTab] = React.useState("tab-1");

  // Instead of using an object with a getter, maintain a ref per tab:
  const sqlEditorRefs = useRef<Record<string, React.RefObject<SqlEditorImperativeHandle>>>(Object.create(null));

  // Whenever the active tab changes or a new tab is created, ensure a ref exists:
  React.useEffect(() => {
    // Ensure every tab has its own ref
    tabs.forEach(tab => {
      if (!sqlEditorRefs.current[tab.id]) {
        sqlEditorRefs.current[tab.id] = React.createRef<SqlEditorImperativeHandle>();
      }
    });
    // Remove ref for deleted tabs
    Object.keys(sqlEditorRefs.current).forEach(id => {
      if (!tabs.find(tab => tab.id === id)) {
        delete sqlEditorRefs.current[id];
      }
    });
  }, [tabs]);

  // NEW: Track which tab is being renamed (by id), and input value.
  const [renamingTabId, setRenamingTabId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState("");

  // Handler to start renaming
  const handleTabDoubleClick = (tab: TabType) => {
    setRenamingTabId(tab.id);
    setRenameValue(tab.name);
  };
  // Handler to finish renaming (on blur or enter)
  const finishRenaming = (tabId: string) => {
    if (renameValue.trim() !== "") {
      setTabs(prev => prev.map(tab => tab.id === tabId ? { ...tab, name: renameValue.trim() } : tab));
    }
    setRenamingTabId(null);
    setRenameValue("");
  };

  // Handler for renaming input keyboard
  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, tabId: string) => {
    if (e.key === "Enter") {
      finishRenaming(tabId);
    } else if (e.key === "Escape") {
      setRenamingTabId(null);
      setRenameValue("");
    }
  };

    // Handler to duplicate a tab
    const handleDuplicateTab = (id: string) => {
      const sourceTab = tabs.find(t => t.id === id);
      if (!sourceTab) return;
      const newId = `tab-${crypto.randomUUID()}`;
      // Append " Copy" (numbered if needed)
      let baseName = sourceTab.name + " Copy";
      let copyName = baseName;
      let i = 2;
      while (tabs.some(tab => tab.name === copyName)) {
        copyName = `${baseName} ${i}`;
        i++;
      }
      setTabs(prev => [
        ...prev,
        {
          ...sourceTab,
          id: newId,
          name: copyName,
          // do not share running state or result error, only the last query
          isRunning: false,
        }
      ]);
      setActiveTab(newId);
    };

  // --- FOR TABLE EXPLORER INSERTION (Fix to ensure proper ref logic): ---
  const handleInsertSchemaTable = (schema: string, table: string) => {
    const ref = sqlEditorRefs.current[activeTab];
    if (ref && ref.current && typeof ref.current.insertAtCursor === "function") {
      ref.current.insertAtCursor(`${schema}.${table}`);
    }
  };
  const handleInsertColumn = (col: string) => {
    const ref = sqlEditorRefs.current[activeTab];
    if (ref && ref.current && typeof ref.current.insertAtCursor === "function") {
      ref.current.insertAtCursor(col);
    }
  };

  // HANDLERS PER TAB
  const handleSqlChange = (id: string, sql: string) => {
    setTabs(prev => prev.map(tab => tab.id === id ? { ...tab, sql } : tab));
  };
  const handleFormat = (id: string) => {
    setTabs(prev => prev.map(tab =>
      tab.id === id ? { ...tab, sql: formatSql(tab.sql) } : tab
    ));
  };
  // Update handleRun to receive statement?
  const handleRun = (id: string, statement?: string) => {
    setTabs(prev =>
      prev.map(tab =>
        tab.id === id ? { ...tab, isRunning: true } : tab
      )
    );
    setTimeout(() => {
      setTabs(prev =>
        prev.map(tab => {
          if (tab.id !== id) return tab;
          // Use the selected statement if provided, otherwise the tab.sql
          const sqlToExecute = (statement && statement.trim() ? statement : tab.sql);
          const res = fakeRunQuery(sqlToExecute);
          if ("error" in res) {
            return { ...tab, result: null, error: res.error, isRunning: false };
          } else {
            return { ...tab, result: res, error: null, isRunning: false };
          }
        })
      );
    }, 500);
  };

  // Helper for timestamp
  function getCurrentTimestamp() {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      now.getFullYear().toString() +
      pad(now.getMonth() + 1) +
      pad(now.getDate()) +
      "_" +
      pad(now.getHours()) +
      pad(now.getMinutes()) +
      pad(now.getSeconds())
    );
  }

  // Download CSV handler (per tab)
  function escapeCsv(value: any): string {
    if (value == null) return '';
    const v = String(value);
    if (/["\n,]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
  }
  const handleDownloadCsv = (tab: TabType) => {
    if (!tab.result || !tab.result.rows.length) return;
    const header = tab.result.columns.map(escapeCsv).join(",");
    const rowsCsv = tab.result.rows.map(row => row.map(escapeCsv).join(","));
    const csv = [header, ...rowsCsv].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const timestamp = getCurrentTimestamp();
    // Sanitize tab.name for filename (basic: remove non-filename characters)
    const safeTabName = tab.name.replace(/[^a-zA-Z0-9-_]/g, "_");
    const filename = `${safeTabName}__${timestamp}.csv`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
  };

  // Add new tab
  const handleAddTab = () => {
    const newId = `tab-${crypto.randomUUID()}`;
    setTabs(prev => [
      ...prev,
      {
        id: newId,
        name: newTabName(prev),
        sql: DEFAULT_SQL,
        result: null,
        error: null,
        isRunning: false,
      }
    ]);
    setActiveTab(newId);
  };

  // Remove tab (don't allow removing last tab)
  const handleRemoveTab = (id: string) => {
    if (tabs.length === 1) return;
    const idx = tabs.findIndex(t => t.id === id);
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    // Move to previous or next tab
    if (activeTab === id) {
      const nextIdx = idx === 0 ? 0 : idx - 1;
      setActiveTab(newTabs[nextIdx].id);
    }
    // Remove ref
    delete sqlEditorRefs.current[id];
  };

  // Find currently active tab object
  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Top bar */}
      <header className="w-full flex justify-end items-center p-0 px-8 py-0 bg-black">
        <div className="flex items-center gap-4 ml-auto py-3">
          <AccountSection account="john_smith" role="readonly" />
        </div>
      </header>
      {/* Outer horizontal resize between sidebar and main */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0 w-full">
        {/* Sidebar */}
        <ResizablePanel defaultSize={23} minSize={0} maxSize={40}>
          <aside className="w-full h-full bg-gray-50 border-r border-gray-200 flex-shrink-0 min-h-0">
            <TableExplorer
              onInsertSchemaTable={handleInsertSchemaTable}
              onInsertColumn={handleInsertColumn}
            />
          </aside>
        </ResizablePanel>
        <ResizableHandle className="bg-gray-200" />
        <ResizablePanel defaultSize={77} minSize={47}>
          <section className="flex-1 flex flex-col px-8 py-6 min-w-0 h-full">
            {/* --- TABS HEADER --- */}
            <div className="w-full border-b border-gray-200 flex items-center pr-0 mb-3">
              <div className="flex-1 flex">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`
                      relative font-mono text-[13px] px-4 py-1 min-w-[185px] max-w-[320px] transition
                      border-b-2 focus:outline-none
                      ${activeTab === tab.id
                        ? "bg-white border-black text-black font-medium shadow"
                        : "bg-gray-100 border-transparent text-gray-700 hover:bg-gray-200"}
                      rounded-t-md
                      flex flex-col justify-between
                    `}
                    style={{
                      marginRight: 8,
                      paddingRight: 32,
                      minWidth: 185,
                      maxWidth: 320,
                      position: "relative",
                      height: 40,
                    }}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {/* Tab Title - Input for renaming */}
                    <div className="flex-1 flex items-center h-[24px]">
                      {renamingTabId === tab.id ? (
                        <input
                          className="font-mono text-[12px] bg-white border border-gray-300 rounded px-1 py-0.5 outline-none w-[82%] focus:ring-2 focus:ring-gray-300"
                          value={renameValue}
                          autoFocus
                          onBlur={() => finishRenaming(tab.id)}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => handleRenameKeyDown(e, tab.id)}
                          spellCheck={false}
                          onClick={e => e.stopPropagation()}
                          style={{ height: 19, fontSize: 12, marginRight: 2 }}
                        />
                      ) : (
                        <span
                          onDoubleClick={e => { e.stopPropagation(); handleTabDoubleClick(tab); }}
                          className="truncate select-none"
                          title={tab.name}
                          style={{ display: "inline-block", maxWidth: "88%", fontSize: 13 }}
                        >
                          {tab.name}
                        </span>
                      )}
                    </div>
                    {/* Close icon (top-right, small) */}
                    {tabs.length > 1 && (
                      <button
                        tabIndex={-1}
                        title="Close tab"
                        onClick={e => { e.stopPropagation(); handleRemoveTab(tab.id); }}
                        className="absolute top-1 right-1 bg-gray-200 hover:bg-gray-300 rounded-full p-0 flex items-center justify-center"
                        style={{
                          width: 16,
                          height: 16,
                          lineHeight: 0,
                          padding: 0,
                        }}
                        type="button"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={10}
                          height={10}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    )}
                    {/* Duplicate icon (bottom-right, below close) */}
                    <button
                      tabIndex={-1}
                      title="Duplicate tab"
                      onClick={e => { e.stopPropagation(); handleDuplicateTab(tab.id); }}
                      className="absolute bottom-1 right-1 bg-gray-100 hover:bg-gray-200 rounded-full p-0 m-0 flex items-center justify-center"
                      style={{
                        width: 15,
                        height: 15,
                        lineHeight: 0,
                        padding: 0,
                      }}
                      type="button"
                    >
                      {/* Lucide "copy" icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={10}
                        height={10}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.05"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path>
                      </svg>
                    </button>
                  </div>
                ))}
                {/* + Add new tab button */}
                <button
                  className="ml-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition"
                  type="button"
                  title="New Tab"
                  style={{ marginLeft: 'auto' }}
                  onClick={handleAddTab}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
            {/* --- TABS CONTENT: Only render current tab with TabView --- */}
            {currentTab && (
              <TabView
                tab={currentTab}
                // Pass the real ref for this tab
                sqlEditorRef={sqlEditorRefs.current[currentTab.id]}
                onSqlChange={sql => handleSqlChange(currentTab.id, sql)}
                onFormat={() => handleFormat(currentTab.id)}
                onRun={(selection) => handleRun(currentTab.id, selection)}
                onDownloadCsv={() => handleDownloadCsv(currentTab)}
              />
            )}
          </section>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
