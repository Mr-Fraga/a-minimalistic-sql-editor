
import React from "react";
import SqlEditor, { SqlEditorImperativeHandle } from "@/components/SqlEditor";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TabSqlEditorSectionProps {
  tab: {
    id: string;
    name: string;
    sql: string;
    result: { columns: string[]; rows: Array<any[]> } | null;
    error: string | null;
    isRunning: boolean;
  };
  sqlEditorRef: React.RefObject<SqlEditorImperativeHandle | null>;
  onSqlChange: (sql: string) => void;
  onFormat: () => void;
  onRun: (selection?: string) => void;
  onRunAll: () => void;
  style?: React.CSSProperties;
  // COLLAPSIBLE props
  collapsed?: boolean;
  onCollapseToggle?: () => void;
  disableCollapse?: boolean;
}

const TabSqlEditorSection: React.FC<TabSqlEditorSectionProps> = ({
  tab,
  sqlEditorRef,
  onSqlChange,
  onFormat,
  onRun,
  onRunAll,
  style = {},
  collapsed = false,
  onCollapseToggle,
  disableCollapse = false,
}) => (
  // Only ONE bar + trigger!
  <Collapsible open={!collapsed}>
    <div className="flex flex-col min-h-0">
      {/* The ONLY label/trigger */}
      <div className="flex items-center py-1 px-2 justify-between bg-white border-b border-gray-200 select-none">
        <span className="font-din font-bold text-base text-gray-800 ml-1" style={{ letterSpacing: "0.04em" }}>
          SQL Editor
        </span>
        <CollapsibleTrigger
          asChild
          disabled={disableCollapse}
        >
          <button
            type="button"
            aria-label={collapsed ? "Expand SQL Editor" : "Collapse SQL Editor"}
            onClick={onCollapseToggle}
            className="ml-2 text-gray-500 bg-transparent hover:text-black rounded p-1 transition"
          >
            {collapsed ? <ChevronDown size={20}/> : <ChevronUp size={20}/>}
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent asChild>
        <div
          className="flex flex-col min-h-0"
          style={{
            flex: "1 1 0%",
            minHeight: 0,
            ...(style || {}),
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
      </CollapsibleContent>
    </div>
  </Collapsible>
);

export default TabSqlEditorSection;
