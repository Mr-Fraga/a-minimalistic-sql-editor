
import React from "react";
import SqlEditor, { SqlEditorImperativeHandle } from "@/components/SqlEditor";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

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
  collapsed?: boolean;
  // Removed: onCollapseToggle and disableCollapse (handled in parent)
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
}) => (
  <Collapsible open={!collapsed}>
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
  </Collapsible>
);

export default TabSqlEditorSection;
