import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useWorksheets } from "./WorksheetsContext";

// The type for a tab in our app
export interface TabType {
  id: string;
  name: string;
  sql: string;
  result: {
    columns: any[];
    rows: any[];
    elapsedMs?: number;
  };
  error: string | null;
  isRunning: boolean;
  comment?: string;
}

// Modifiable fields by the context consumer
interface TabsContextType {
  tabs: TabType[];
  setTabs: React.Dispatch<React.SetStateAction<TabType[]>>;
  activeTabId: string | null;
  setActiveTabId: (id: string) => void;
  activeTab: TabType | null;
  addTab: () => void;
  updateTab: (id: string, updatedFields: Partial<TabType>) => void;
  removeTab: (id: string) => void;
  closeTab: (id: string) => void;
  renameTab: (id: string, name: string) => void;
  duplicateTab: (id: string) => void;
  DEFAULT_SQL: string;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

// Default SQL for new tabs (BLANK for your requirement)
const DEFAULT_SQL = "";

// --- SETUP DEFAULTS ---
const MOCK_SQL = `SELECT * FROM users LIMIT 10;`; // Replace with your mock query if different

const DEFAULT_TAB = {
  name: "Initial Tab",
  sql: MOCK_SQL, // initial tab gets mock query
  result: { columns: [], rows: [] },
  error: null,
  isRunning: false,
  comment: "",
};

// Utility: generate a random string for tab ids
function generateTabId() {
  return Math.random().toString(36).substr(2, 9);
}

export function TabsProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<TabType[]>([
    { ...DEFAULT_TAB, id: generateTabId() },
  ]);
  const [activeTabId, setActiveTabId] = useState<string | null>(
    tabs[0]?.id || null
  );

  // Add worksheet file context access:
  const worksheets = useWorksheets();
  const worksheetData = worksheets?.worksheetData || [];
  const setWorksheetData = worksheets?.setWorksheetData;

  // activeTab getter
  const activeTab = tabs.find((tab) => tab.id === activeTabId) || null;

  // Helper: Find next New Tab N number (existing tabs and worksheet files considered)
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

  // Add a new blank tab and make it active
  const addTab = () => {
    const id = generateTabId();
    const tabIdx = getNextNewTabIndex();

    const tabBaseName = `New Tab ${tabIdx}`;
    const fileName = `${tabBaseName}.sql`;

    const newTab: TabType = {
      ...DEFAULT_TAB,
      id,
      name: tabBaseName,
      sql: "", // blank for new tabs
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);

    // Add this tab as a new file to Worksheets root (if not already present)
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
          comment: "New tab query"
        }
      ]);
    }
  };

  // Update fields of a tab
  const updateTab = (id: string, updatedFields: Partial<TabType>) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === id ? { ...tab, ...updatedFields } : tab
      )
    );
  };

  // Remove a tab and update activeTabId accordingly
  const removeTab = useCallback((id: string) => {
    setTabs((prevTabs) => {
      const idx = prevTabs.findIndex((tab) => tab.id === id);
      if (prevTabs.length <= 1) {
        const newId = generateTabId();
        setActiveTabId(newId);
        return [{ ...DEFAULT_TAB, id: newId }];
      }
      const newTabs = prevTabs.filter((tab) => tab.id !== id);
      if (activeTabId === id) {
        setActiveTabId(newTabs[Math.max(0, idx - 1)]?.id || newTabs[0].id);
      }
      return newTabs;
    });
  }, [activeTabId]);

  // Close tab alias for removeTab
  const closeTab = removeTab;

  // Rename tab
  const renameTab = (id: string, name: string) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => (tab.id === id ? { ...tab, name } : tab))
    );
  };

  // Duplicate a tab
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
        // Also carry over sql and result; error/isRunning always reset
        error: null,
        isRunning: false,
      };
      // Insert the duplicate right after the original
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
