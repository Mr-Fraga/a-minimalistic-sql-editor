import React from "react";
import TabItem from "@/components/TabItem";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CommentEditModal from "@/components/CommentEditModal";
import TabBarAddButton from "./TabBarAddButton";
import { useTabs } from "@/contexts/TabsContext";

interface TabType {
  id: string;
  name: string;
  sql: string;
  result: { columns: string[]; rows: Array<any[]> } | null;
  error: string | null;
  isRunning: boolean;
  comment?: string;
}

interface TabBarProps {
  tabs: TabType[];
  activeTabId: string | null;
  setActiveTabId: (id: string) => void;
  addTab: () => void;
  closeTab: (id: string) => void;
  renameTab: (id: string, name: string) => void;
  duplicateTab: (id: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs: propsTabs,
  activeTabId: propsActiveTabId,
  setActiveTabId: propsSetActiveTabId,
  addTab: propsAddTab,
  closeTab: propsCloseTab,
  renameTab: propsRenameTab,
  duplicateTab: propsDuplicateTab,
}) => {
  const { tabs, activeTabId, setActiveTabId, addTab, closeTab, renameTab, duplicateTab } = useTabs();

  // State for editing tab name
  const [editTabId, setEditTabId] = React.useState<string | null>(null);
  const [tabNameDraft, setTabNameDraft] = React.useState<string>("");

  // State for editing comment (modal)
  const [commentModal, setCommentModal] = React.useState<{
    open: boolean;
    tabId: string | null;
    currentComment: string;
  }>({
    open: false,
    tabId: null,
    currentComment: "",
  });

  // Keep comments in Tab bar state for demo (adapt to store in main state if needed)
  const [comments, setComments] = React.useState<{ [tabId: string]: string }>({});

  // --- Tab renaming ---
  const handleTabDoubleClick = (tab: TabType) => {
    setEditTabId(tab.id);
    setTabNameDraft(tab.name);
  };
  const handleTabNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTabNameDraft(e.target.value);
  };
  const handleTabNameBlur = (tabId: string) => {
    if (tabNameDraft && tabNameDraft !== tabs.find(t => t.id === tabId)?.name) {
      renameTab(tabId, tabNameDraft);
    }
    setEditTabId(null);
  };
  const handleTabNameKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    tabId: string
  ) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "Escape") {
      setEditTabId(null);
    }
  };

  // --- Comment modal triggers ---
  const openCommentModal = (tab: TabType) => {
    setCommentModal({
      open: true,
      tabId: tab.id,
      currentComment: comments[tab.id] ?? tab.comment ?? "",
    });
  };
  const handleSaveComment = () => {
    if (commentModal.tabId) {
      setComments((prev) => ({
        ...prev,
        [commentModal.tabId!]: commentModal.currentComment,
      }));
    }
    setCommentModal({ open: false, tabId: null, currentComment: "" });
  };

  return (
    <div
      className="w-full bg-white select-none"
      style={{ border: "none", boxShadow: "none", paddingLeft: "2rem" }}
    >
      <TooltipProvider>
        <Tabs
          value={activeTabId || (tabs.length > 0 ? tabs[0].id : undefined)}
          onValueChange={setActiveTabId}
        >
          <TabsList
            className="flex flex-row items-center bg-white p-0 gap-0 justify-start w-auto min-w-0"
            style={{
              margin: 0,
              border: "none",
              boxShadow: "none",
              minHeight: "44px",
            }}
          >
            {tabs.map((tab) => (
              <TabItem
                key={tab.id}
                tab={tab}
                isActive={tab.id === activeTabId}
                isEditing={editTabId === tab.id}
                onDoubleClick={handleTabDoubleClick}
                editValue={tabNameDraft}
                onEditChange={handleTabNameChange}
                onEditBlur={handleTabNameBlur}
                onEditKeyDown={handleTabNameKeyDown}
                setActiveTabId={setActiveTabId}
                duplicateTab={duplicateTab}
                closeTab={closeTab}
                openCommentModal={openCommentModal}
                comment={comments[tab.id]}
              />
            ))}
            <TabBarAddButton addTab={addTab} />
          </TabsList>
        </Tabs>
      </TooltipProvider>
      {/* Modal to edit comment */}
      <CommentEditModal
        open={commentModal.open}
        value={commentModal.currentComment}
        onChange={v =>
          setCommentModal(modal => ({ ...modal, currentComment: v }))
        }
        onSave={handleSaveComment}
        onClose={() =>
          setCommentModal({ open: false, tabId: null, currentComment: "" })
        }
      />
    </div>
  );
};

export default TabBar;
