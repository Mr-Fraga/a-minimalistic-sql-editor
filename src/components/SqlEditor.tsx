
import React, { useRef, useImperativeHandle, forwardRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { toast } from "@/hooks/use-toast";
import { Play } from "lucide-react";
import SqlEditorToolbar from "./sql/SqlEditorToolbar";
import { simpleSqlFormat } from "./sql/SqlFormatter";
import { useSqlLint } from "./sql/useSqlLint";

interface SqlEditorProps {
  value: string;
  onChange: (sql: string) => void;
  onFormat: () => void;
  onRun: (statement?: string) => void;
  onRunAll: () => void;
  isRunning?: boolean;
}

export interface SqlEditorImperativeHandle {
  insertAtCursor: (toInsert: string) => void;
  getSelection: () => string;
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
            selection: { anchor: from + toInsert.length },
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
      },
    }));

    const sqlLint = useSqlLint();

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
      // Log values to verify
      console.log("[SqlEditor] Run button: selected:", selected, " full value:", value);
      // Selected is string, so ok to call onRun directly
      onRun(selected || undefined);
    };

    const handleRunAllButton = () => {
      onRunAll();
    };

    const handleSearchButton = () => {
      if (
        editorRef.current &&
        editorRef.current.view &&
        typeof editorRef.current.view.dispatch === "function"
      ) {
        const { view } = editorRef.current;
        import("@codemirror/search").then((mod) => {
          if (mod && typeof mod.openSearchPanel === "function") {
            mod.openSearchPanel(view);
          }
        });
      }
    };

    const handleFormatClick = () => {
      const formattedSql = simpleSqlFormat(value || "");
      onChange(formattedSql);
      toast({
        title: "SQL Formatted!",
        description: "Your SQL has been formatted.",
      });
    };

    return (
      <div className="w-full">
        <h3 className="font-din font-bold text-base text-gray-800 mb-2 ml-4" style={{ letterSpacing: "0.04em" }}>
          SQL Editor
        </h3>

        <div className="rounded-md overflow-hidden border border-gray-200 shadow-sm bg-white relative">
          <SqlEditorToolbar
            onCopy={handleCopy}
            onFormat={handleFormatClick}
            onSearch={handleSearchButton}
            isRunning={isRunning}
          />
          <div
            className="resize-y overflow-auto min-h-[300px] max-h-[700px]"
            style={{ minHeight: 300, maxHeight: 700 }}
          >
            <CodeMirror
              value={value}
              minHeight="300px"
              height="100%"
              extensions={[
                sql(),
                sqlLint,
                // Do not duplicate lintGutter here—it's enabled in CodeMirror defaults and via lint extension
              ]}
              theme="light"
              onChange={(v) => onChange(v)}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLine: true,
                autocompletion: true,
                foldGutter: true,
              }}
              editable={!isRunning}
              ref={editorRef}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-2">
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
