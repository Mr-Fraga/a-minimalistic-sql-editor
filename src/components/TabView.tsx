
import React from "react";
import TabSqlEditorSection from "./TabSqlEditorSection";
import TabResultsSection from "./TabResultsSection";
import { SqlEditorImperativeHandle } from "@/components/SqlEditor";
import TableExplorer from "@/components/TableExplorer";
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
  onRun: (selection?: string) => void;
  onRunAll: () => void;
  onDownloadCsv?: (rowsToExport?: Array<any[]>) => void;
}

// Explorer sidebar width
const EXPLORER_MIN_WIDTH = 180;
const EXPLORER_MAX_WIDTH = 350;
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
  return (
    <ResizablePanelGroup direction="horizontal" className="flex h-full w-full min-h-0">
      {/* Main SQL/Results Section */}
      <ResizablePanel
        minSize={40}
        className="flex h-full min-h-0"
        style={{
          minWidth: 0,
          background: "#fff",
          // Right padding/gap to visually separate from Table Explorer
          paddingRight: "24px",
        }}
      >
        <div className="flex flex-col min-h-0 h-full w-full">
          {/* SQL Editor Section */}
          <div
            style={{
              flex: "1 1 0%",
              minHeight: 0,
              background: "#fff",
              display: "flex",
              flexDirection: "column",
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
            resultsHeight={320}
            setResultsHeight={() => {}}
            onDownloadCsv={onDownloadCsv}
          />
        </div>
      </ResizablePanel>
      {/* Drag handle for resizing/collapsing Table Explorer */}
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={23}
        minSize={12}
        maxSize={40}
        collapsible
        collapsedSize={2}
        style={{
          background: "#fff",
          minWidth: EXPLORER_MIN_WIDTH,
          maxWidth: EXPLORER_MAX_WIDTH,
        }}
        className="h-full min-h-0 border-l border-gray-200 flex flex-col bg-white"
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
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default TabView;
