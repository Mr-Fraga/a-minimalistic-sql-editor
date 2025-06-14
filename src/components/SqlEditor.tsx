import React, { useRef, useImperativeHandle, forwardRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { linter, lintGutter } from "@codemirror/lint";
import { toast } from "@/hooks/use-toast";
import { Copy, Play, Settings2, Glasses } from "lucide-react";

interface SqlEditorProps {
  value: string;
  onChange: (sql: string) => void;
  onFormat: () => void;
  onRun: (statement?: string) => void;
  onRunAll: () => void; // New: run all SQL statements
  isRunning?: boolean;
}

const sqlLint = () =>
  linter((view) => {
    const text = view.state.doc.toString();
    if (!text.trim().endsWith(";")) {
      return [
        {
          from: text.length,
          to: text.length,
          message: "Statement should end with a semicolon",
          severity: "warning",
        },
      ];
    }
    return [];
  });

export interface SqlEditorImperativeHandle {
  insertAtCursor: (toInsert: string) => void;
  getSelection: () => string;
}

function simpleSqlFormat(sql: string): string {
  // Very simple formatter (for example only, not for production)
  // Ensures uppercasing keywords and prettifies main clauses; users likely want something basic
  if (!sql) return "";
  // Basic SQL keywords
  const keywords = ["select", "from", "where", "order by", "group by", "limit", "insert", "update", "delete", "values", "set"];
  let formatted = sql;
  keywords.forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, "gi");
    formatted = formatted.replace(regex, kw.toUpperCase());
  });
  // Add newlines before keywords except SELECT
  formatted = formatted.replace(/\b(FROM|WHERE|ORDER BY|GROUP BY|LIMIT|INSERT|UPDATE|DELETE|VALUES|SET)\b/g, "\n$1");
  // Remove multiple newlines
  formatted = formatted.replace(/\n{2,}/g, "\n");
  // Ensure trailing semicolon
  formatted = formatted.trim();
  if (!formatted.endsWith(";")) formatted += ";";
  return formatted;
}

const SqlEditor = forwardRef<SqlEditorImperativeHandle, React.PropsWithChildren<SqlEditorProps>>(
  ({ value, onChange, onFormat, onRun, onRunAll, isRunning }, ref) => {
    const editorRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      insertAtCursor: (toInsert: string) => {
        if (editorRef.current && typeof editorRef.current.view === "object") {
          const view = editorRef.current.view;
          if (!view) return;
          const { state } = view;
          const { from, to } = state.selection.main;
          view.dispatch({
            changes: { from, to, insert: toInsert },
            selection: { anchor: from + toInsert.length }
          });
          view.focus();
        }
      },
      getSelection: () => {
        if (editorRef.current && typeof editorRef.current.view === "object") {
          const view = editorRef.current.view;
          if (!view) return "";
          const { state } = view;
          const { from, to } = state.selection.main;
          if (from === to) return "";
          return state.doc.sliceString(from, to);
        }
        return "";
      }
    }));

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(value);
        toast({
          title: "Copied SQL!",
          description: "The SQL code was copied to your clipboard.",
        });
      } catch (e) {
        toast({
          title: "Copy failed",
          description: "Could not copy the SQL code.",
        });
      }
    };

    // Play button: only run selected, not all
    const handleRunButton = () => {
      let selected = "";
      if (editorRef.current && typeof editorRef.current.view === "object") {
        const view = editorRef.current.view;
        const { state } = view;
        const { from, to } = state.selection.main;
        if (from !== to) {
          selected = state.doc.sliceString(from, to);
        }
      }
      // Only run selected statement (or statement at cursor)
      onRun(selected || undefined);
    };

    // "Double play": run ALL sql statements one-after-another
    const handleRunAllButton = () => {
      onRunAll();
    };

    const handleSearchButton = () => {
      if (
        editorRef.current &&
        editorRef.current.view &&
        typeof editorRef.current.view.dispatch === "function"
      ) {
        // Use codemirror search extension
        const { view } = editorRef.current;
        import("@codemirror/search").then(mod => {
          if (mod && typeof mod.openSearchPanel === "function") {
            mod.openSearchPanel(view);
          }
        });
      }
    };

    const handleFormatClick = () => {
      // Use a client-side formatter
      const formattedSql = simpleSqlFormat(value || "");
      onChange(formattedSql);
      toast({
        title: "SQL Formatted!",
        description: "Your SQL has been formatted.",
      });
    };

    return (
      <div className="w-full">
        {/* SQL Editor Title */}
        <h3 className="font-semibold text-lg mb-2 text-gray-900">SQL Editor</h3>

        <div className="rounded-md overflow-hidden border border-gray-200 shadow-sm bg-white relative">
          {/* Copy button */}
          <button
            type="button"
            className="absolute top-2 right-2 z-10 bg-white/90 rounded-md px-2 py-1 border border-gray-300 text-xs font-mono hover:bg-gray-50 flex items-center gap-1 shadow transition"
            onClick={handleCopy}
            tabIndex={-1}
            title="Copy SQL to clipboard"
            aria-label="Copy SQL to clipboard"
            disabled={isRunning}
          >
            <Copy size={14} className="inline-block" />
            Copy
          </button>
          {/* Format button */}
          <button
            className="absolute top-11 right-2 z-10 bg-white/90 rounded-md px-2 py-1 border border-gray-300 text-xs font-mono hover:bg-gray-50 flex items-center gap-1 shadow transition"
            onClick={handleFormatClick}
            tabIndex={-1}
            title="Format SQL"
            aria-label="Format SQL"
            disabled={isRunning}
            style={{ marginTop: 2 }}
            type="button"
          >
            <Settings2 size={14} className="inline-block" />
            Format
          </button>
          {/* Search button, below Format */}
          <button
            className="absolute top-20 right-2 z-10 bg-white/90 rounded-md px-2 py-1 border border-gray-300 text-xs font-mono hover:bg-gray-50 flex items-center gap-1 shadow transition"
            onClick={handleSearchButton}
            tabIndex={-1}
            title="search"
            aria-label="Search"
            disabled={isRunning}
            style={{ marginTop: 2 }}
            type="button"
          >
            <Glasses size={14} className="inline-block" />
            Search
          </button>
          {/* Resizable vertical textbox */}
          <div
            className="resize-y overflow-auto min-h-[120px] max-h-[500px]"
            style={{ minHeight: 120, maxHeight: 500 }}
          >
            <CodeMirror
              value={value}
              minHeight="120px"
              height="100%"
              extensions={[
                sql(),
                sqlLint(),
                lintGutter(),
              ]}
              theme="light"
              onChange={(v) => onChange(v)}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLine: true,
                autocompletion: true,
                foldGutter: true
              }}
              editable={!isRunning}
              ref={editorRef}
            />
          </div>
        </div>
        {/* Buttons below the resizable box */}
        <div className="flex gap-2 mt-2">
          {/* Play (runs only selection or current) */}
          <button
            className="rounded-md px-4 py-1 bg-black text-white text-sm font-mono hover:bg-gray-900 transition flex items-center"
            onClick={handleRunButton}
            disabled={isRunning}
            type="button"
            aria-label="Run selected statement"
            title="Run selected statement"
          >
            <Play size={16} />
          </button>
          {/* Double play (run ALL statements) */}
          <button
            className="rounded-md px-4 py-1 bg-zinc-800 text-white text-sm font-mono hover:bg-zinc-900 transition flex items-center"
            onClick={handleRunAllButton}
            disabled={isRunning}
            type="button"
            aria-label="Run all statements"
            title="Run all statements"
          >
            <Play size={16} className="mr-[-5px]" />
            <Play size={16} />
          </button>
        </div>
      </div>
    );
  }
);

export default SqlEditor;
