
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
          {/* 
            Change TabsList to be left-aligned (no justify-center, etc),
            and remove bg-muted (causing unwanted gray).
            Remove gap between tabs if any, and use white background with proper left alignment.
          */}
          <TabsList className="flex items-end bg-white shadow-none border-none p-0 rounded-none">
            {tabs.map((tab) => (
              <Tooltip key={tab.id} delayDuration={100}>
                <TooltipTrigger asChild>
                  {/* 
                    Tab wrapper: left-align, no centering. 
                    Restore rounded and white tab rectangle.
                  */}
                  <div
                    className={
                      "flex items-center gap-2 mx-0 px-0 py-0 rounded-none cursor-pointer group"
                    }
                    onDoubleClick={() => handleTabDoubleClick(tab)}
                    tabIndex={0}
                  >
                    <TabsTrigger
                      value={tab.id}
                      onClick={() => setActiveTabId(tab.id)}
                      className={
                        "flex items-center px-4 py-2 font-semibold transition-none rounded-lg bg-white border border-gray-200 mr-1 shadow-sm " +
                        (tab.id === activeTabId
                          ? "border-b-white border-b-2 z-10 text-black"
                          : "text-gray-700 hover:bg-gray-50")
                      }
                      style={{
                        outline: "none",
                        boxShadow: "none",
                        borderBottom: tab.id === activeTabId ? "2px solid #fff" : undefined,
                        background: "#fff",
                        marginBottom: "0px",
                      }}
                    >
                      {tab.name}
                    </TabsTrigger>
                    <button
                      className="ml-1 text-gray-400 hover:text-red-600"
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
              className="ml-2 rounded-full p-1 hover:bg-gray-100 text-blue-500"
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

