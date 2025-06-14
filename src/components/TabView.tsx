import React from "react";
import SqlEditor, { SqlEditorImperativeHandle } from "@/components/SqlEditor";
import ResultTable from "@/components/ResultTable";
import { Button } from "@/components/ui/button";
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
  onRun: () => void;
  onDownloadCsv: () => void;
}

const TabView: React.FC<TabViewProps> = ({
  tab,
  sqlEditorRef,
  onSqlChange,
  onFormat,
  onRun,
  onDownloadCsv,
}) => (
  <div className="w-full flex-1 flex flex-col min-h-0 h-full">
    {/* SQL Editor Section */}
    <div className="flex-1 flex flex-col min-h-0 h-full">
      <div className="flex flex-col min-h-0 h-full">
        <div className="min-h-[80px] flex-1">
          <SqlEditor
            ref={sqlEditorRef}
            value={tab.sql}
            onChange={onSqlChange}
            onFormat={onFormat}
            onRun={onRun}
            isRunning={tab.isRunning}
          />
        </div>
      </div>
    </div>
    {/* Always render Results section below editor */}
    <div className="mt-6 flex flex-col min-h-0">
      <h2 className="font-bold text-md mb-2 font-mono tracking-tight select-none">
        Results
      </h2>
      <ResultTable result={tab.result || undefined} error={tab.error} />
      {/* Download button, only if there are rows */}
      {tab.result && tab.result.rows.length > 0 && (
        <div className="flex w-full justify-start mt-2">
          <Button size="sm" className="font-mono" onClick={onDownloadCsv} variant="outline">
            <Download size={16} />
          </Button>
        </div>
      )}
    </div>
  </div>
);

export default TabView;
