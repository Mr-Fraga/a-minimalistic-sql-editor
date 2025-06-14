
import React, { useState } from "react";
import TabSqlEditorSection from "./TabSqlEditorSection";
import TabResultsSection from "./TabResultsSection";
import { SqlEditorImperativeHandle } from "@/components/SqlEditor";
import TableExplorer from "@/components/TableExplorer";

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

// Make results appear higher: set default height larger
const DEFAULT_RESULTS_HEIGHT = 320;

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

  // State for explorer width on the left (you can make this adjustable in the future)
  const [explorerOpen, setExplorerOpen] = useState(true);

  return (
    // Main flex row: TableExplorer (left) | SQL panel (right)
    <div className="w-full flex-1 flex flex-row min-h-0 h-full bg-white">
      {/* TableExplorer side-bar (left) */}
      {explorerOpen && (
        <div
          className="h-full bg-white border-r flex flex-col"
          style={{
            minWidth: 240,
            maxWidth: 340,
            width: 264,
            marginTop: 0,
            paddingTop: 0,
          }}
        >
          {/* TableExplorer: remove outer vertical padding/margin so it's flush with SQL section */}
          <TableExplorer
            onInsertSchemaTable={(schema, table) => {
              sqlEditorRef.current?.insertAtCursor(`${schema}.${table}`);
            }}
            onInsertColumn={(col) => {
              sqlEditorRef.current?.insertAtCursor(col);
            }}
            style={{
              marginTop: 0,
              paddingTop: 0,
            }}
          />
        </div>
      )}
      {/* Main SQL/Results vertical layout */}
      <div className="flex-1 flex flex-col min-h-0 h-full">
        {/* SQL Editor Section */}
        <div style={{
          flex: "1 1 0%",
          minHeight: 0,
          height: `calc(100% - ${resultsHeight}px)`,
          display: "flex",
          flexDirection: "column",
          background: "#fff",
        }}>
          <TabSqlEditorSection
            tab={tab}
            sqlEditorRef={sqlEditorRef}
            onSqlChange={onSqlChange}
            onFormat={onFormat}
            onRun={onRun}
            onRunAll={onRunAll}
            // pass an optional prop if you want to custom-style the editor for padding, etc.
          />
        </div>
        {/* Results Section */}
        <TabResultsSection
          tab={tab}
          resultsHeight={resultsHeight}
          setResultsHeight={setResultsHeight}
          onDownloadCsv={onDownloadCsv}
        />
      </div>
    </div>
  );
};

export default TabView;
