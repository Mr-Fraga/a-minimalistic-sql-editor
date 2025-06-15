
import { Dispatch, ReactNode, SetStateAction } from "react";

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
export interface TabsContextType {
  tabs: TabType[];
  setTabs: Dispatch<SetStateAction<TabType[]>>;
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
