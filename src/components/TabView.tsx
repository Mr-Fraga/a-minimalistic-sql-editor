
import React, { useState } from "react";
import TabSqlEditorSection from "./TabSqlEditorSection";
import TabResultsSection from "./TabResultsSection";
import { SqlEditorImperativeHandle } from "@/components/SqlEditor";
import TableExplorer from "@/components/TableExplorer";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

// Default height for result section
const DEFAULT_RESULTS_HEIGHT = 320;

// Explorer sidebar width
const EXPLORER_MIN_WIDTH = 240;
const EXPLORER_MAX_WIDTH = 340;
const EXPLORER_DEFAULT_WIDTH = 264;

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
  const [explorerOpen, setExplorerOpen] = useState(true);

  return (
    // Main flex row: SQL/results (left) | (collapsible) Table Explorer (right)
    <div className="w-full flex-1 flex flex-row min-h-0 h-full bg-white relative">
      {/* Main SQL Editor + Results vertical */}
      <div className="flex-1 flex flex-col min-h-0 h-full relative transition-all duration-200">
        {/* SQL Editor Section */}
        <div
          style={{
            flex: "1 1 0%",
            minHeight: 0,
            height: `calc(100% - ${resultsHeight}px)`,
            display: "flex",
            flexDirection: "column",
            background: "#fff",
          }}
        >
          <TabSqlEditorSection
            tab={tab}
            sqlEditorRef={sqlEditorRef}
            onSqlChange={onSqlChange}
            onFormat={onFormat}
            onRun={onRun}
            onRunAll={onRunAll}
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
      {/* Collapsible TableExplorer sidebar */}
      <div className="relative flex h-full">
        {/* Collapse/Expand button, visible when explorer is open or closed, floats at border */}
        <div className="flex flex-col items-center justify-start absolute left-0 top-4 z-40">
          {explorerOpen ? (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-gray-200 shadow-sm bg-white w-7 h-7 mb-0"
              onClick={() => setExplorerOpen(false)}
              aria-label="Hide Explorer"
              tabIndex={0}
              style={{ marginLeft: "-18px" }} // positions the button over the left border of the explorer
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-gray-200 shadow-sm bg-white w-7 h-7 mb-0"
              onClick={() => setExplorerOpen(true)}
              aria-label="Show Explorer"
              tabIndex={0}
              style={{ marginLeft: "-18px" }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
        </div>
        {explorerOpen && (
          <div
            className="h-full bg-white border-l flex flex-col transition-all duration-150"
            style={{
              minWidth: EXPLORER_MIN_WIDTH,
              maxWidth: EXPLORER_MAX_WIDTH,
              width: EXPLORER_DEFAULT_WIDTH,
              marginTop: 0,
              paddingTop: 0,
              height: "100%",
            }}
          >
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
                height: "100%",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TabView;
