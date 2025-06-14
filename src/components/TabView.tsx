
import React, { useState } from "react";
import TabSqlEditorSection from "./TabSqlEditorSection";
import TabResultsSection from "./TabResultsSection";
import { SqlEditorImperativeHandle } from "@/components/SqlEditor";

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
  const [resultsHeight, setResultsHeight] = useState(DEFAULT_RESULTS_HEIGHT);

  // Layout: vertical flex, always with results section at bottom, both panels flex/overflow/height set properly!
  return (
    <div className="w-full flex-1 flex flex-col min-h-0 h-full">
      {/* SQL Editor Section */}
      <div style={{
        flex: "1 1 0%",
        minHeight: 0,
        height: `calc(100% - ${resultsHeight}px)`,
        display: "flex",
        flexDirection: "column",
      }}>
        <TabSqlEditorSection
          tab={tab}
          sqlEditorRef={sqlEditorRef}
          onSqlChange={onSqlChange}
          onFormat={onFormat}
          onRun={onRun}
          onRunAll={onRunAll}
        />
      </div>
      {/* Results Section ALWAYS RENDERED */}
      <TabResultsSection
        tab={tab}
        resultsHeight={resultsHeight}
        setResultsHeight={setResultsHeight}
        onDownloadCsv={onDownloadCsv}
      />
    </div>
  );
};

export default TabView;
