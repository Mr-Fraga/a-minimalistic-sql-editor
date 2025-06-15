import React, { createContext, useContext, useState, ReactNode } from "react";

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
}

interface TabsContextType {
  tabs: TabType[];
  activeTabId: string | null;
  setActiveTabId: (id: string) => void;
  addTab: () => void;
  updateTab: (id: string, updatedFields: Partial<TabType>) => void;
  removeTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const DEFAULT_TAB = {
  name: "New Tab",
  sql: "", // Ensure new tabs are blank
  result: { columns: [], rows: [] },
  error: null,
  isRunning: false,
};

// generate a random string for new tab ids
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

  const addTab = () => {
    const id = generateTabId();
    const newTab: TabType = { ...DEFAULT_TAB, id };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);
  };

  const updateTab = (id: string, updatedFields: Partial<TabType>) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === id ? { ...tab, ...updatedFields } : tab
      )
    );
  };

  const removeTab = (id: string) => {
    setTabs((prevTabs) => {
      const filtered = prevTabs.filter((tab) => tab.id !== id);
      if (filtered.length === 0) {
        // Always keep at least one blank tab open!
        const newId = generateTabId();
        setActiveTabId(newId);
        return [{ ...DEFAULT_TAB, id: newId }];
      }
      if (activeTabId === id) {
        setActiveTabId(filtered[filtered.length - 1].id);
      }
      return filtered;
    });
  };

  return (
    <TabsContext.Provider
      value={{
        tabs,
        activeTabId,
        setActiveTabId,
        addTab,
        updateTab,
        removeTab,
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
