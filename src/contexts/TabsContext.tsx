
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useWorksheets } from "./WorksheetsContext";
import { TabType, TabsContextType } from "./TabsTypes";
import { MOCK_SQL, MOCK_RESULT, DEFAULT_TAB } from "./TabsMocks";
import { generateTabId } from "./TabsUtils";

// Default SQL for new tabs (BLANK for your requirement)
const DEFAULT_SQL = "";

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function TabsProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<TabType[]>([
    {
      ...DEFAULT_TAB,
      id: generateTabId(),
      result: MOCK_RESULT,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string | null>(
    tabs[0]?.id || null
  );

  const worksheets = useWorksheets();
  const worksheetData = worksheets?.worksheetData || [];
  const setWorksheetData = worksheets?.setWorksheetData;

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || null;

  function getNextNewTabIndex() {
    const tabNumbers = tabs
      .map(t => t.name.match(/^New Tab (\d+)$/))
      .filter(Boolean)
      .map(match => parseInt(match![1], 10));
    const fileNumbers = worksheetData
      .flatMap(entry => {
        if (entry.type === "query") {
          const m = entry.name.match(/^New Tab (\d+)\.sql$/);
          return m ? [parseInt(m[1], 10)] : [];
        }
        if (entry.type === "folder") {
          return entry.files
            .map(f =>
              f.name.match(/^New Tab (\d+)\.sql$/)
            )
            .filter(Boolean)
            .map(m => parseInt(m![1], 10));
        }
        return [];
      });
    const usedNumbers = [...tabNumbers, ...fileNumbers];
    let i = 1;
    while (usedNumbers.includes(i)) {
      i++;
    }
    return i;
  }

  const addTab = () => {
    const id = generateTabId();
    const tabIdx = getNextNewTabIndex();
    const tabBaseName = `New Tab ${tabIdx}`;
    const fileName = `${tabBaseName}.sql`;

    const newTab: TabType = {
      ...DEFAULT_TAB,
      id,
      name: tabBaseName,
      sql: "",
      result: { columns: [], rows: [] },
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);

    if (
      setWorksheetData &&
      !worksheetData.some(e => e.type === "query" && e.name === fileName)
    ) {
      const now = new Date().toISOString().split("T")[0];
      setWorksheetData(prev => [
        ...prev,
        {
          type: "query",
          name: fileName,
          createdAt: now,
          updatedAt: now,
          comment: "New tab query",
          sql: "",
        }
      ]);
    }
  };

  const updateTab = (id: string, updatedFields: Partial<TabType>) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === id ? { ...tab, ...updatedFields } : tab
      )
    );
    const changedTab = tabs.find((tab) => tab.id === id);
    if (setWorksheetData && changedTab) {
      const updatedName = updatedFields.name ?? changedTab.name;
      const prevName = changedTab.name;
      const updatedSql =
        updatedFields.sql !== undefined ? updatedFields.sql : changedTab.sql;

      setWorksheetData(prev => {
        function updateEntry(entry) {
          if (entry.type === "query" && entry.name === prevName + ".sql") {
            return { ...entry, name: updatedName + ".sql", sql: updatedSql };
          }
          if (entry.type === "folder") {
            return {
              ...entry,
              files: entry.files.map(f =>
                f.name === prevName + ".sql"
                  ? { ...f, name: updatedName + ".sql", sql: updatedSql }
                  : f
              ),
            };
          }
          return entry;
        }
        return prev.map(updateEntry);
      });
    }
  };

  const renameTab = (id: string, name: string) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => (tab.id === id ? { ...tab, name } : tab))
    );
    const tab = tabs.find(t => t.id === id);
    if (tab && setWorksheetData) {
      const prevName = tab.name;
      setWorksheetData(prev => {
        function updateEntry(entry) {
          if (entry.type === "query" && entry.name === prevName + ".sql") {
            return { ...entry, name: name + ".sql" };
          }
          if (entry.type === "folder") {
            return {
              ...entry,
              files: entry.files.map(f =>
                f.name === prevName + ".sql"
                  ? { ...f, name: name + ".sql" }
                  : f
              ),
            };
          }
          return entry;
        }
        return prev.map(updateEntry);
      });
    }
  };

  const removeTab = useCallback((id: string) => {
    setTabs((prevTabs) => {
      const idx = prevTabs.findIndex((tab) => tab.id === id);
      if (prevTabs.length <= 1) {
        const newId = generateTabId();
        setActiveTabId(newId);
        return [{ ...DEFAULT_TAB, id: newId, result: MOCK_RESULT }];
      }
      const newTabs = prevTabs.filter((tab) => tab.id !== id);
      if (activeTabId === id) {
        setActiveTabId(newTabs[Math.max(0, idx - 1)]?.id || newTabs[0].id);
      }
      return newTabs;
    });
  }, [activeTabId]);

  const closeTab = removeTab;

  const duplicateTab = (id: string) => {
    setTabs((prevTabs) => {
      const idx = prevTabs.findIndex((tab) => tab.id === id);
      if (idx === -1) return prevTabs;
      const tab = prevTabs[idx];
      const newId = generateTabId();
      const copy: TabType = {
        ...tab,
        id: newId,
        name: tab.name + " (Copy)",
        error: null,
        isRunning: false,
      };
      const newTabs = [...prevTabs];
      newTabs.splice(idx + 1, 0, copy);
      setActiveTabId(newId);
      return newTabs;
    });
  };

  return (
    <TabsContext.Provider
      value={{
        tabs,
        setTabs,
        activeTabId,
        setActiveTabId,
        activeTab,
        addTab,
        updateTab,
        removeTab,
        closeTab,
        renameTab,
        duplicateTab,
        DEFAULT_SQL,
      }}
    >
      {children}
    </TabsContext.Provider>
  );
}

export function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("useTabs must be used within a TabsProvider");
  return ctx;
}
