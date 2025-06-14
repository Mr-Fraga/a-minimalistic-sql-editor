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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, X } from "lucide-react";

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

type TabType = {
  id: string;
  name: string;
  sql: string;
  result: { columns: string[]; rows: Array<any[]> } | null;
  error: string | null;
  isRunning: boolean;
};

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

  // Keep refs per tab for insertAtCursor support
  const sqlEditorRefs = useRef<Record<string, SqlEditorImperativeHandle | null>>({});

  // For table explorer insertion
  const handleInsertSchemaTable = (schema: string, table: string) => {
    const tab = tabs.find(t => t.id === activeTab);
    if (tab && sqlEditorRefs.current[tab.id]) {
      sqlEditorRefs.current[tab.id]?.insertAtCursor(`${schema}.${table}`);
    }
  };
  const handleInsertColumn = (col: string) => {
    const tab = tabs.find(t => t.id === activeTab);
    if (tab && sqlEditorRefs.current[tab.id]) {
      sqlEditorRefs.current[tab.id]?.insertAtCursor(col);
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
  const handleRun = (id: string) => {
    setTabs(prev =>
      prev.map(tab =>
        tab.id === id ? { ...tab, isRunning: true } : tab
      )
    );
    setTimeout(() => {
      setTabs(prev =>
        prev.map(tab => {
          if (tab.id !== id) return tab;
          const res = fakeRunQuery(tab.sql);
          if ("error" in res) {
            return { ...tab, result: null, error: res.error, isRunning: false };
          } else {
            return { ...tab, result: res, error: null, isRunning: false };
          }
        })
      );
    }, 500);
  };

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
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "results.csv";
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
            {/* --- TABS --- */}
            <div className="w-full border-b border-gray-200 flex items-center pr-0 mb-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1">
                <TabsList className="rounded-none bg-transparent shadow-none px-0 space-x-1 h-auto min-h-0">
                  {tabs.map((tab, i) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={`rounded-t-md border-none bg-transparent px-4 py-2.5 text-base font-mono font-medium relative group
                        ${activeTab === tab.id ? "bg-white shadow" : "bg-gray-100 hover:bg-gray-200"}
                        transition min-w-[6rem]
                      `}
                    >
                      <span>{tab.name}</span>
                      {tabs.length > 1 && (
                        <button
                          tabIndex={-1}
                          title="Close tab"
                          onClick={e => { e.stopPropagation(); handleRemoveTab(tab.id); }}
                          className="absolute -right-2.5 top-[8px] z-10 bg-gray-200 hover:bg-gray-300 rounded-full p-0.5 transition"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </TabsTrigger>
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
                </TabsList>
                {tabs.map(tab => (
                  <TabsContent
                    key={tab.id}
                    value={tab.id}
                    className="pt-0 pb-0 px-0 mt-0"
                  >
                    <div className="flex-1 flex flex-col min-h-0 h-full">
                      {/* Vertically divide SQL editor vs Results */}
                      <ResizablePanelGroup direction="vertical" className="flex-1 min-h-0 h-full">
                        <ResizablePanel defaultSize={60} minSize={20} className="flex flex-col min-h-0">
                          <ResizablePanelGroup direction="vertical" className="flex-1 min-h-0 h-full">
                            <ResizablePanel defaultSize={75} minSize={40} maxSize={95} className="min-h-[80px]">
                              <SqlEditor
                                ref={el => { sqlEditorRefs.current[tab.id] = el; }}
                                value={tab.sql}
                                onChange={sql => handleSqlChange(tab.id, sql)}
                                onFormat={() => handleFormat(tab.id)}
                                onRun={() => handleRun(tab.id)}
                                isRunning={tab.isRunning}
                              />
                            </ResizablePanel>
                            {/* No handle for clean look, but easy to add if you wish */}
                          </ResizablePanelGroup>
                        </ResizablePanel>
                        <ResizableHandle withHandle className="bg-gray-200" />
                        <ResizablePanel defaultSize={40} minSize={20}>
                          <div className="mt-6 flex flex-col min-h-0 h-full">
                            <h2 className="font-bold text-md mb-2 font-mono tracking-tight select-none">Results</h2>
                            <ResultTable result={tab.result || undefined} error={tab.error} />
                            {/* Download as CSV below the table, left bottom */}
                            {tab.result && tab.result.rows.length > 0 && (
                              <div className="flex w-full justify-start mt-2">
                                <Button size="sm" className="font-mono" onClick={() => handleDownloadCsv(tab)}>
                                  Download as CSV
                                </Button>
                              </div>
                            )}
                          </div>
                        </ResizablePanel>
                      </ResizablePanelGroup>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
            {/* End tab section */}
          </section>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
