import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CommentEditModal from "@/components/CommentEditModal";

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
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  setActiveTabId,
  addTab,
  closeTab,
  renameTab,
}) => {
  // Comment editing state per tab
  const [commentModal, setCommentModal] = useState<{
    open: boolean;
    tabId: string | null;
    currentComment: string;
  }>({
    open: false,
    tabId: null,
    currentComment: "",
  });

  // Keep comments in Tab bar state for demo (adapt to store in main state if needed)
  const [comments, setComments] = useState<{[tabId: string]: string}>({});

  const handleTabDoubleClick = (tab: TabType) => {
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
    <div className="w-full bg-white border-b px-2">
      <TooltipProvider>
        <Tabs
          value={activeTabId || (tabs.length > 0 ? tabs[0].id : undefined)}
          onValueChange={setActiveTabId}
        >
          <TabsList className="flex gap-1">
            {tabs.map((tab) => (
              <Tooltip key={tab.id} delayDuration={100}>
                <TooltipTrigger asChild>
                  <div
                    className={
                      "flex items-center gap-2 px-4 py-2 rounded-t-md cursor-pointer group " +
                      (tab.id === activeTabId
                        ? "bg-gray-100 border-b-2 border-blue-500"
                        : "hover:bg-gray-50")
                    }
                    onDoubleClick={() => handleTabDoubleClick(tab)}
                    tabIndex={0}
                  >
                    <TabsTrigger
                      value={tab.id}
                      onClick={() => setActiveTabId(tab.id)}
                      className="flex items-center px-0 py-0 font-semibold bg-transparent"
                      style={{ outline: "none", boxShadow: "none" }}
                    >
                      {tab.name}
                    </TabsTrigger>
                    <button
                      className="ml-2 text-gray-500 hover:text-red-600"
                      onClick={e => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      title="Close tab"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  {comments[tab.id] ?? tab.comment ?? (
                    <span className="italic text-gray-400">(No comment)</span>
                  )}
                  <div className="mt-1 text-xs text-blue-500 cursor-pointer underline" onClick={() => handleTabDoubleClick(tab)}>
                    Double click to edit
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
            {/* Add tab button */}
            <button
              onClick={addTab}
              className="ml-4 rounded-full p-1 hover:bg-gray-100 text-blue-500"
              title="Add Tab"
            >
              <Plus size={20} />
            </button>
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
