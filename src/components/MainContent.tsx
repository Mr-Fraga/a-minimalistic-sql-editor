
import React, { useCallback } from "react";
import { useTabsState } from "@/hooks/useTabsState";
import { useQueryApi } from "@/hooks/useQueryApi";
import { useCsvExport } from "@/hooks/useCsvExport";
import { SqlEditorImperativeHandle } from "@/components/SqlEditor";
import TabView from "@/components/TabView";
import TabBar from "@/components/TabBar";

interface MainContentProps {
  sqlEditorRef: React.RefObject<SqlEditorImperativeHandle | null>;
}

const MainContent: React.FC<MainContentProps> = ({ sqlEditorRef }) => {
  const {
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    activeTab,
    addTab,
    duplicateTab,
    closeTab,
    updateTab,
    renameTab,
    DEFAULT_SQL,
  } = useTabsState();

  const { runSql, formatSql } = useQueryApi({ updateTab, DEFAULT_SQL });
  const { onDownloadCsv } = useCsvExport(activeTab);

  const onSqlChange = useCallback(
    (sql: string) => {
      if (!activeTab) return;
      updateTab(activeTab.id, { sql });
    },
    [activeTab, updateTab]
  );

  // Fix: type selection as string | undefined
  const onRun = useCallback(
    (selection?: string) => {
      if (!activeTab) return;
      // Log value for clarity
      console.log("[MainContent] onRun called. selection:", selection, "activeTabId:", activeTab.id);
      // Use selection if provided, otherwise activeTab.sql
      runSql(selection !== undefined ? selection : activeTab.sql, activeTab.id);
    },
    [activeTab, runSql]
  );

  const onRunAll = useCallback(() => {
    if (!activeTab) return;
    runSql(activeTab.sql, activeTab.id);
  }, [activeTab, runSql]);

  const onFormat = useCallback(() => {
    if (!activeTab) return;
    formatSql(activeTab.sql, (formatted: string) => {
      onSqlChange(formatted);
    });
  }, [activeTab, formatSql, onSqlChange]);

  const role = "readonly"; // You can replace this with real role if available.

  return (
    <div className="flex-1 flex flex-col h-full">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        setActiveTabId={setActiveTabId}
        addTab={addTab}
        closeTab={closeTab}
        renameTab={renameTab}
        duplicateTab={duplicateTab}
      />
      <div className="flex-1 flex flex-col px-6 md:px-8 mt-4">
        {activeTab ? (
          <TabView
            tab={activeTab}
            sqlEditorRef={sqlEditorRef}
            onSqlChange={onSqlChange}
            onFormat={onFormat}
            onRun={onRun}
            onRunAll={onRunAll}
            onDownloadCsv={onDownloadCsv}
            role={role}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">No tab selected.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainContent;
