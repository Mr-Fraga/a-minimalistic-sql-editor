
import React, { useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { linter, lintGutter } from "@codemirror/lint";

interface SqlEditorProps {
  value: string;
  onChange: (sql: string) => void;
  onFormat: () => void;
  onRun: () => void;
  isRunning?: boolean;
}

const sqlLint = () =>
  linter((view) => {
    // Very simple example: highlight missing semicolon as warning.
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

const SqlEditor: React.FC<SqlEditorProps> = ({
  value,
  onChange,
  onFormat,
  onRun,
  isRunning,
}) => {
  // Ref is not used but retained for possible future extensions.
  const editorRef = useRef(null);

  return (
    <div className="w-full">
      <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white">
        <CodeMirror
          value={value}
          minHeight="120px"
          height="180px"
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
        />
      </div>
      <div className="flex gap-2 mt-2">
        <button
          className="rounded px-4 py-1 bg-black text-white text-sm font-mono hover:bg-gray-900 transition"
          onClick={onRun}
          disabled={isRunning}
          type="button"
        >
          {isRunning ? "Running..." : "Run"}
        </button>
        <button
          className="rounded px-4 py-1 bg-gray-900 text-white text-sm font-mono hover:bg-black/80 transition"
          onClick={onFormat}
          disabled={isRunning}
          type="button"
        >
          Format SQL
        </button>
      </div>
    </div>
  );
};

export default SqlEditor;
