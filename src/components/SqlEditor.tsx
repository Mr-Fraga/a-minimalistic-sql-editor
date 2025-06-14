
import React, { useRef, useImperativeHandle, forwardRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { linter, lintGutter } from "@codemirror/lint";
import { toast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

interface SqlEditorProps {
  value: string;
  onChange: (sql: string) => void;
  onFormat: () => void;
  onRun: () => void;
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
}

// Note: now using forwardRef to allow imperative methods
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

    return (
      <div className="w-full">
        <div className="rounded-md overflow-hidden border border-gray-200 shadow-sm bg-white relative">
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
            className="rounded-md px-4 py-1 bg-black text-white text-sm font-mono hover:bg-gray-900 transition"
            onClick={onRun}
            disabled={isRunning}
            type="button"
          >
            {isRunning ? "Running..." : "Run"}
          </button>
          <button
            className="rounded-md px-4 py-1 bg-gray-900 text-white text-sm font-mono hover:bg-black/80 transition"
            onClick={onFormat}
            disabled={isRunning}
            type="button"
          >
            Format SQL
          </button>
        </div>
      </div>
    );
  }
);

export default SqlEditor;
