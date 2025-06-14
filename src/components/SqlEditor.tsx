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

const SqlEditor = forwardRef<SqlEditorImperativeHandle, React.PropsWithChildren<SqlEditorProps>>(
  ({ value, onChange, onFormat, onRun, isRunning }, ref) => {
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
      // If there's a selection, run only that; otherwise run all.
      onRun(selected || undefined);
    };

    // New: handler for 'Search' (Find/Replace)
    const handleSearchButton = () => {
      if (
        editorRef.current &&
        editorRef.current.view &&
        typeof editorRef.current.view.dispatch === "function"
      ) {
        // Use the codemirror search extension command
        const { view } = editorRef.current;
        // Dynamically import to avoid SSR issues/bundle
        import("@codemirror/search").then(mod => {
          // openSearchPanel(view) is the command to open the find/replace bar
          if (mod && typeof mod.openSearchPanel === "function") {
            mod.openSearchPanel(view);
          }
        });
        // Fallback for CodeMirror 6 users (rare): view.dispatch({ effects: ... });
      }
    };

    return (
      <div className="w-full">
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
          {/* Format SQL button, below copy button */}
          <button
            className="absolute top-11 right-2 z-10 bg-white/90 rounded-md px-2 py-1 border border-gray-300 text-xs font-mono hover:bg-gray-50 flex items-center gap-1 shadow transition"
            onClick={onFormat}
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
          <button
            className="rounded-md px-4 py-1 bg-black text-white text-sm font-mono hover:bg-gray-900 transition flex items-center"
            onClick={handleRunButton}
            disabled={isRunning}
            type="button"
            aria-label="Run"
            title="Run SQL"
          >
            <Play size={16} />
          </button>
        </div>
      </div>
    );
  }
);

export default SqlEditor;
