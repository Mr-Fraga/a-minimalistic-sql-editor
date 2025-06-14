
import React, { useState, useRef } from "react";
import SqlEditor, { SqlEditorImperativeHandle } from "@/components/SqlEditor";
import ResultTable from "@/components/ResultTable";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Download } from "lucide-react";

export type TabType = {
  id: string;
  name: string;
  sql: string;
  result: { columns: string[]; rows: Array<any[]> } | null;
  error: string | null;
  isRunning: boolean;
};

interface TabViewProps {
  tab: TabType;
  sqlEditorRef: React.RefObject<SqlEditorImperativeHandle | null>;
  onSqlChange: (sql: string) => void;
  onFormat: () => void;
  onRun: (selection?: string) => void;
  onRunAll: () => void;
  onDownloadCsv?: (rowsToExport?: Array<any[]>) => void;
}

const MIN_RESULTS_HEIGHT = 80;
const MAX_RESULTS_HEIGHT = 600;
const DEFAULT_RESULTS_HEIGHT = 220;

const TabView: React.FC<TabViewProps> = ({
  tab,
  sqlEditorRef,
  onSqlChange,
  onFormat,
  onRun,
  onRunAll,
  onDownloadCsv,
}) => {
  const [exportFullResults, setExportFullResults] = useState(false);
  const [resultsHeight, setResultsHeight] = useState(DEFAULT_RESULTS_HEIGHT);
  const dragStartY = useRef<number | null>(null);
  const dragStartHeight = useRef<number>(DEFAULT_RESULTS_HEIGHT);

  // Drag handlers for resizing results section
  const handleDragStart = (e: React.MouseEvent) => {
    dragStartY.current = e.clientY;
    dragStartHeight.current = resultsHeight;
    window.addEventListener("mousemove", handleDrag);
    window.addEventListener("mouseup", handleDragEnd);
    document.body.style.cursor = "ns-resize";
    // Prevent text selection
    document.body.style.userSelect = "none";
  };

  const handleDrag = (e: MouseEvent) => {
    if (dragStartY.current !== null) {
      const delta = e.clientY - dragStartY.current;
      let newHeight = dragStartHeight.current - delta;
      // Clamp
      newHeight = Math.max(MIN_RESULTS_HEIGHT, Math.min(MAX_RESULTS_HEIGHT, newHeight));
      setResultsHeight(newHeight);
    }
  };

  const handleDragEnd = () => {
    window.removeEventListener("mousemove", handleDrag);
    window.removeEventListener("mouseup", handleDragEnd);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    dragStartY.current = null;
  };

  // CSV export
  const handleDownloadCsv = () => {
    if (!tab.result || tab.result.rows.length === 0) return;
    const rowsToExport = exportFullResults
      ? tab.result.rows
      : tab.result.rows.slice(0, 500);
    if (onDownloadCsv) {
      onDownloadCsv(rowsToExport);
    } else {
      const escape = (value: any) => {
        if (value == null) return '';
        const v = String(value);
        if (/["\n,]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
        return v;
      };
      const header = tab.result.columns.map(escape).join(",");
      const rowsCsv = rowsToExport.map(row => row.map(escape).join(","));
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
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 h-full">
      {/* SQL Editor Section; fill the rest minus resultsHeight */}
      <div
        className="flex flex-col min-h-0"
        style={{
          flex: "1 1 0%",
          height: `calc(100% - ${resultsHeight}px)`,
          minHeight: 0,
        }}
      >
        <SqlEditor
          ref={sqlEditorRef}
          value={tab.sql}
          onChange={onSqlChange}
          onFormat={onFormat}
          onRun={onRun}
          onRunAll={onRunAll}
          isRunning={tab.isRunning}
        />
      </div>
      {/* Results Section - draggable by title */}
      <div
        className="flex flex-col min-h-[80px] bg-white border-t border-gray-200 overflow-hidden relative select-none"
        style={{ height: resultsHeight, transition: "height 0.08s" }}
      >
        {/* Drag handle - Results title */}
        <div
          className="cursor-ns-resize w-full flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-2"
          style={{
            userSelect: "none",
          }}
          onMouseDown={handleDragStart}
          role="separator"
          aria-label="Drag to resize results"
          tabIndex={0}
        >
          <h2 className="font-bold text-md font-mono tracking-tight select-none">
            Results
          </h2>
          <div className="flex-1"></div>
        </div>
        <div className="flex-1 flex flex-col min-h-0 h-full px-0 pt-4 pb-2 w-full">
          <ResultTable result={tab.result || undefined} error={tab.error} />
          <div className="flex items-center justify-between w-full mt-2 px-4">
            {/* Export toggle only shows if results exist */}
            <div className="flex items-center gap-2">
              {tab.result && tab.result.rows.length > 0 && (
                <>
                  <Switch
                    checked={exportFullResults}
                    onCheckedChange={(v: boolean) => setExportFullResults(v)}
                    id="export-full-results-toggle"
                  />
                  <label
                    htmlFor="export-full-results-toggle"
                    className="text-xs font-mono select-none text-gray-600"
                  >
                    Export full results
                  </label>
                </>
              )}
            </div>
            {/* Download button only if there are rows */}
            {tab.result && tab.result.rows.length > 0 && (
              <Button
                size="sm"
                className="font-mono"
                onClick={handleDownloadCsv}
                variant="outline"
              >
                <Download size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabView;

