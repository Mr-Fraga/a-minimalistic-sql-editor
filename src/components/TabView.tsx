
import React, { useState } from "react";
import SqlEditor, { SqlEditorImperativeHandle } from "@/components/SqlEditor";
import ResultTable from "@/components/ResultTable";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Download } from "lucide-react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

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
  onRun: (selection?: string) => void; // Accept selection string
  onRunAll: () => void; // New for running all statements
  onDownloadCsv?: (rowsToExport?: Array<any[]>) => void; // Optional, override default
}

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

  // Determine rows to export on download
  const handleDownloadCsv = () => {
    if (!tab.result || tab.result.rows.length === 0) return;
    const rowsToExport = exportFullResults
      ? tab.result.rows
      : tab.result.rows.slice(0, 500);
    if (onDownloadCsv) {
      onDownloadCsv(rowsToExport); // Parent-provided CSV export logic
    } else {
      // Default CSV export logic
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
    <ResizablePanelGroup direction="vertical" className="flex-1 min-h-0 h-full w-full">
      {/* SQL Editor Panel */}
      <ResizablePanel defaultSize={63} minSize={30}>
        <div className="flex flex-col min-h-0 h-full">
          <div className="min-h-[80px] flex-1">
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
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle className="bg-border" />
      {/* Results Section Panel */}
      <ResizablePanel defaultSize={37} minSize={15} collapsible={false}>
        {/* Results Panel */}
        <div className="flex flex-col min-h-0 h-full px-0 pt-6 pb-2 bg-white w-full">
          <h2 className="font-bold text-md mb-2 font-mono tracking-tight select-none">
            Results
          </h2>
          <ResultTable result={tab.result || undefined} error={tab.error} />
          <div className="flex items-center justify-between w-full mt-2">
            {/* Bottom-left: Export toggle (only render if results exist) */}
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
            {/* Bottom-right: Download button, only if there are rows */}
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
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default TabView;
