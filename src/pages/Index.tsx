import React, { useRef } from "react";
import AccountSection from "@/components/AccountSection";
import TableExplorer from "@/components/TableExplorer";
import SqlEditor, { SqlEditorImperativeHandle } from "@/components/SqlEditor";
import ResultTable from "@/components/ResultTable";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

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

// minimal "formatter" for pretty SQL (only indent SELECT * FROM ...)
function formatSql(sql: string) {
  return sql
    .replace(/\bSELECT\b/i, "SELECT")
    .replace(/\bFROM\b/i, "\nFROM")
    .replace(/\bWHERE\b/i, "\nWHERE")
    .replace(/\s*;\s*$/, ";")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

const Index: React.FC = () => {
  const [sql, setSql] = React.useState(DEFAULT_SQL);
  const [result, setResult] = React.useState<{ columns: string[]; rows: Array<any[]> } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);

  const sqlEditorRef = useRef<SqlEditorImperativeHandle>(null);

  // Handles inserting schema.table or column
  const handleInsertSchemaTable = (schema: string, table: string) => {
    sqlEditorRef.current?.insertAtCursor(`${schema}.${table}`);
  };
  const handleInsertColumn = (col: string) => {
    sqlEditorRef.current?.insertAtCursor(col);
  };

  const handleFormat = () => setSql(formatSql(sql));
  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = fakeRunQuery(sql);
      if ("error" in res) {
        setResult(null);
        setError(res.error);
      } else {
        setResult(res);
        setError(null);
      }
      setIsRunning(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Top bar */}
      <header className="w-full flex justify-end items-center border-b border-gray-200 p-0 px-8 py-0 bg-black">
        <div className="flex items-center gap-4 ml-auto py-3">
          {/* Reordered: Role left, Account right */}
          <AccountSection account="john_smith" role="readonly" />
        </div>
      </header>
      <main className="flex-1 flex min-h-0 border-t border-gray-200">
        <aside className="w-[230px] bg-gray-50 border-r border-gray-200 flex-shrink-0 min-h-0">
          <TableExplorer
            onInsertSchemaTable={handleInsertSchemaTable}
            onInsertColumn={handleInsertColumn}
          />
        </aside>
        <section className="flex-1 flex flex-col px-8 py-6 min-w-0">
          <h1 className="font-bold text-xl mb-4 font-mono tracking-tight select-none">SQL Editor</h1>
          <div className="flex-1 flex flex-col min-h-0">
            <ResizablePanelGroup direction="vertical" className="flex-1 min-h-0">
              <ResizablePanel defaultSize={60} minSize={20}>
                <SqlEditor
                  ref={sqlEditorRef}
                  value={sql}
                  onChange={setSql}
                  onFormat={handleFormat}
                  onRun={handleRun}
                  isRunning={isRunning}
                />
              </ResizablePanel>
              <ResizableHandle withHandle className="bg-gray-200" />
              <ResizablePanel defaultSize={40} minSize={20}>
                <div className="mt-6 flex flex-col min-h-0 h-full">
                  <h2 className="font-bold text-md mb-2 font-mono tracking-tight select-none">Results</h2>
                  <ResultTable result={result || undefined} error={error} />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
