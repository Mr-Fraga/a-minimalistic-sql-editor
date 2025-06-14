
import { useCallback, useMemo } from "react";
import { useLocalStorage } from "../components/MainContentHooks";

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
  result: null,
  error: null,
  isRunning: false,
};
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

export function useTabsState() {
  const [tabs, setTabs] = useLocalStorage<TabType[]>("tabs", [
    { ...DEFAULT_TAB, id: generateId(), name: "Tab 1" },
  ]);
  const [activeTabId, setActiveTabId] = useLocalStorage<string>(
    "activeTabId",
    tabs[0]?.id
  );

  // Always compute the *fresh* activeTab from latest tabs and activeTabId.
  const activeTab = useMemo(() => {
    return tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  }, [tabs, activeTabId]);

  // Tab operations
  const addTab = useCallback(() => {
    const newTab: TabType = { ...DEFAULT_TAB, id: generateId() };
    const newTabs = [...tabs, newTab];
    setTabs(newTabs);
    setActiveTabId(newTab.id);
  }, [tabs, setTabs, setActiveTabId]);

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
    [tabs, setTabs, setActiveTabId]
  );

  const closeTab = useCallback(
    (id: string) => {
      const newTabs = tabs.filter((tab) => tab.id !== id);
      setTabs(newTabs);
      if (activeTabId === id) {
        setActiveTabId(newTabs[0]?.id || null);
      }
    },
    [tabs, setTabs, activeTabId, setActiveTabId]
  );

  const updateTab = useCallback(
    (id: string, updates: Partial<TabType>) => {
      const newTabs = tabs.map((tab) =>
        tab.id === id ? { ...tab, ...updates } : tab
      );
      setTabs(newTabs);
    },
    [tabs, setTabs]
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
