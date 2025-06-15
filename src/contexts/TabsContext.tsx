import React, { createContext, useContext, useCallback, useMemo, useState } from "react";
import { useWorksheets } from "./WorksheetsContext";

// Tab definition
export type TabType = {
  id: string;
  name: string;
  sql: string;
  result: { columns: string[]; rows: Array<any[]> } | null;
  error: string | null;
  isRunning: boolean;
};

const DEFAULT_SQL = `SELECT * FROM users LIMIT 10;`;

const DEFAULT_TAB: Omit<TabType, "id"> = {
  name: "New Tab",
  sql: DEFAULT_SQL,
  result: { columns: [], rows: [] },
  error: null,
  isRunning: false,
};
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

type TabsContextType = {
  tabs: TabType[];
  setTabs: React.Dispatch<React.SetStateAction<TabType[]>>;
  activeTabId: string | null;
  setActiveTabId: (id: string | null) => void;
  activeTab: TabType | undefined;
  addTab: () => void;
  duplicateTab: (id: string) => void;
  closeTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<TabType>) => void;
  renameTab: (id: string, name: string) => void;
  DEFAULT_SQL: string;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const TabsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { worksheetData, setWorksheetData, addWorksheetQuery } = useWorksheets();

  // INITIAL STATE
  const [tabs, setTabs] = useState<TabType[]>([
    { ...DEFAULT_TAB, id: generateId(), name: "new_tab" },
  ]);
  const [activeTabId, setActiveTabId] = useState<string | null>(tabs[0]?.id || null);

  // Ensure activeTab is always in sync
  const activeTab = useMemo(() => {
    return tabs.find(tab => tab.id === activeTabId) ?? tabs[0];
  }, [tabs, activeTabId]);

  // --- Actions ---
  const addTab = useCallback(() => {
    // Generate a unique default tab name: new_tab, new_tab 2, new_tab 3, etc.
    const baseName = "new_tab";
    // Get all names that match new_tab or new_tab [number] format
    const existingNames = tabs.map(tab => tab.name);
    let newTabName = baseName;
    if (existingNames.includes(baseName)) {
      // look for an available number: new_tab 2, new_tab 3, etc.
      let suffix = 2;
      while (existingNames.includes(`${baseName} ${suffix}`)) {
        suffix += 1;
      }
      newTabName = `${baseName} ${suffix}`;
    }

    const newTab: TabType = { ...DEFAULT_TAB, id: generateId(), name: newTabName };
    setTabs(prevTabs => {
      const newTabs = [...prevTabs, newTab];
      return newTabs;
    });
    setActiveTabId(newTab.id);

    // Create worksheet entry with tab name
    addWorksheetQuery(newTabName, "Created from tab");
    // Also set tab name for the tab itself (redundant but consistent with code style)
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === newTab.id ? { ...tab, name: newTabName } : tab
      )
    );
  }, [tabs, addWorksheetQuery]);

  const duplicateTab = useCallback(
    (id: string) => {
      const tabToCopy = tabs.find(tab => tab.id === id);
      if (!tabToCopy) return;
      let baseName = tabToCopy.name.replace(/\s\(copy( \d+)?\)$/i, "");
      let newName = `${baseName} (copy)`;
      const existingNames = tabs.map(t => t.name);
      let copyIdx = 2;
      while (existingNames.includes(newName)) {
        newName = `${baseName} (copy ${copyIdx++})`;
      }
      const copy = { ...tabToCopy, id: generateId(), name: newName, isRunning: false };
      setTabs([...tabs, copy]);
      setActiveTabId(copy.id);

      // Add worksheet entry for duplicate
      addWorksheetQuery(newName, "Duplicated from tab");

      // Set the worksheet name for the new tab too.
      setTabs(prevTabs =>
        prevTabs.map(tab =>
          tab.id === copy.id ? { ...tab, name: newName } : tab
        )
      );
    },
    [tabs, addWorksheetQuery]
  );

  const closeTab = useCallback(
    (id: string) => {
      setTabs(prevTabs => {
        const newTabs = prevTabs.filter(tab => tab.id !== id);
        return newTabs;
      });
      setActiveTabId(prevId => {
        if (prevId === id) {
          // fallback to first or null if empty
          const nextTabs = tabs.filter(tab => tab.id !== id);
          return nextTabs[0]?.id || null;
        }
        return prevId;
      });
      // DO NOT remove worksheet from worksheetData.
    },
    [tabs]
  );

  const updateTab = useCallback(
    (id: string, updates: Partial<TabType>) => {
      setTabs(prevTabs => prevTabs.map(tab => (tab.id === id ? { ...tab, ...updates } : tab)));
    },
    []
  );

  // Link worksheet and tab names: renaming a tab renames corresponding worksheet
  const renameTab = useCallback(
    (tabId: string, newName: string) => {
      setTabs(prevTabs =>
        prevTabs.map(tab =>
          tab.id === tabId ? { ...tab, name: newName } : tab
        )
      );
      // Update worksheetData entry: only if the entry with old name exists
      setWorksheetData(prev => {
        return prev.map(item =>
          item.type === "query" && item.name === (tabs.find(tab => tab.id === tabId)?.name)
            ? { ...item, name: newName }
            : item.type === "folder"
              ? {
                  ...item,
                  files: item.files.map(f =>
                    f.name === (tabs.find(tab => tab.id === tabId)?.name)
                      ? { ...f, name: newName }
                      : f
                  ),
                }
              : item
        );
      });
    },
    [tabs, setWorksheetData]
  );

  return (
    <TabsContext.Provider
      value={{
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
      }}
    >
      {children}
    </TabsContext.Provider>
  );
};

export function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("useTabs must be used within TabsProvider");
  return ctx;
}
