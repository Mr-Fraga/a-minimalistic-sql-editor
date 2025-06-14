import { useCallback, useMemo, useState } from "react";

// Removed useLocalStorage import

export type TabType = {
  id: string;
  name: string;
  sql: string;
  result: { columns: string[]; rows: Array<any[]> } | null;
  error: string | null;
  isRunning: boolean;
};

// UPDATED: set default SQL to the mock query for proper detection!
const DEFAULT_SQL = `SELECT * FROM users LIMIT 10;`;

const DEFAULT_TAB: Omit<TabType, "id"> = {
  name: "New Tab",
  sql: DEFAULT_SQL,
  result: { columns: [], rows: [] }, // always empty dataset for new tab
  error: null,
  isRunning: false,
};
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

export function useTabsState() {
  // Use in-memory state only
  const [tabs, setTabs] = useState<TabType[]>([
    { ...DEFAULT_TAB, id: generateId(), name: "Tab 1" },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id);

  // Always compute the *fresh* activeTab from latest tabs and activeTabId.
  const activeTab = useMemo(() => {
    const found = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
    console.log("[useTabsState] useMemo activeTab recomputed: id =", found?.id, "| result =", found?.result, "| error =", found?.error);
    return found;
  }, [tabs, activeTabId]);

  // Tab operations
  const addTab = useCallback(() => {
    const newTab: TabType = { ...DEFAULT_TAB, id: generateId() };
    const newTabs = [...tabs, newTab];
    setTabs(newTabs);
    setActiveTabId(newTab.id);
  }, [tabs]);

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
      const newTabs = [...tabs, copy];
      setTabs(newTabs);
      setActiveTabId(copy.id);
    },
    [tabs]
  );

  const closeTab = useCallback(
    (id: string) => {
      const newTabs = tabs.filter((tab) => tab.id !== id);
      setTabs(newTabs);
      if (activeTabId === id) {
        setActiveTabId(newTabs[0]?.id || null);
      }
    },
    [tabs, activeTabId]
  );

  const updateTab = useCallback(
    (id: string, updates: Partial<TabType>) => {
      // DEBUG before update
      console.log("[useTabsState] updateTab called: id =", id, "| updates =", updates);
      const newTabs = tabs.map((tab) =>
        tab.id === id ? { ...tab, ...updates } : tab
      );
      setTabs(newTabs);
      // DEBUG after update
      setTimeout(() => {
        // print after next event loop for React batching
        console.log("[useTabsState] After setTabs (updateTab), tabs:", newTabs);
        const found = newTabs.find(tab => tab.id === id);
        if (found) {
          console.log("[useTabsState] Tab after update id =", id, "| result =", found.result, "| error =", found.error);
        }
      }, 0);
    },
    [tabs]
  );

  const renameTab = useCallback(
    (id: string, newName: string) => {
      updateTab(id, { name: newName });
    },
    [updateTab]
  );

  return {
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
  };
}
