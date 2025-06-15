
import React, { useCallback, useState } from "react";
import { useQueryApi } from "@/hooks/useQueryApi";
import { useCsvExport } from "@/hooks/useCsvExport";
import { SqlEditorImperativeHandle } from "@/components/SqlEditor";
import TabBar from "@/components/TabBar";
import TabView from "@/components/TabView";
import { useTabs } from "@/contexts/TabsContext";

interface MainContentProps {
  sqlEditorRef: React.RefObject<SqlEditorImperativeHandle | null>;
}

const DEFAULT_RESULTS_HEIGHT = 320;

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
  } = useTabs();

  const { runSql, formatSql } = useQueryApi({ updateTab, DEFAULT_SQL });
  const { onDownloadCsv } = useCsvExport(activeTab);

  const [resultsHeights, setResultsHeights] = useState<{ [tabId: string]: number }>({});

  const resultsHeight =
    (activeTab && resultsHeights[activeTab.id]) || DEFAULT_RESULTS_HEIGHT;

  const setResultsHeight = useCallback(
    (h: number) => {
      if (!activeTab) return;
      setResultsHeights((prev) => ({
        ...prev,
        [activeTab.id]: h,
      }));
    },
    [activeTab]
  );

  const onSqlChange = useCallback(
    (sql: string) => {
      if (!activeTab) return;
      updateTab(activeTab.id, { sql });
    },
    [activeTab, updateTab]
  );

  const onRun = useCallback(
    (selection?: string) => {
      if (!activeTab) return;
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

  const role = "readonly";

  React.useEffect(() => {
    if (activeTab) {
      console.log("[MainContent] Rendering TabView for tab.id:", activeTab.id, "| tab.result:", activeTab.result, "| tab.error:", activeTab.error);
    }
  }, [activeTab]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Use TabBar for tab navigation */}
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
            resultsHeight={resultsHeight}
            setResultsHeight={setResultsHeight}
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

// Note: This now uses the TabsContext for all tab state.

