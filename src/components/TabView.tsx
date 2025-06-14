
import React, { useState } from "react";
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
  // UI state for handle hover
  const [isHandleHovered, setIsHandleHovered] = useState(false);
  const [isHandleDragging, setIsHandleDragging] = useState(false);

  return (
    <ResizablePanelGroup direction="horizontal" className="flex h-full w-full min-h-0">
      {/* Main SQL/Results Section */}
      <ResizablePanel
        minSize={40}
        className="flex h-full min-h-0"
        style={{
          minWidth: 0,
          background: "#fff",
          paddingRight: "36px", // WIDER right margin for separation
          transition: "padding-right 0.18s",
        }}
      >
        <div className="flex flex-col min-h-0 h-full w-full">
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
          <TabResultsSection
            tab={tab}
            resultsHeight={320}
            setResultsHeight={() => {}}
            onDownloadCsv={onDownloadCsv}
          />
        </div>
      </ResizablePanel>
      {/* Custom ResizableHandle: only shows on hover or drag */}
      <ResizableHandle
        withHandle={isHandleHovered || isHandleDragging}
        className={`transition-all duration-200 
          ${isHandleHovered || isHandleDragging ? "bg-border" : "bg-transparent"}
          hover:bg-border
        `}
        onMouseEnter={() => setIsHandleHovered(true)}
        onMouseLeave={() => setIsHandleHovered(false)}
        onPointerDown={() => setIsHandleDragging(true)}
        onPointerUp={() => setIsHandleDragging(false)}
        style={{
          zIndex: 12, // always above explorer bg
          width: isHandleHovered || isHandleDragging ? "16px" : "4px",
          minWidth: 0,
          cursor: "col-resize",
          transition: "all 0.18s",
          background: isHandleHovered || isHandleDragging ? "#e5e7eb" : "transparent",
        }}
      />
      {/* Table Explorer, always collapsible down to small size */}
      <ResizablePanel
        defaultSize={23}
        minSize={0}
        maxSize={40}
        collapsible
        collapsedSize={0}
        style={{
          background: "#fff",
          minWidth: 0,
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
