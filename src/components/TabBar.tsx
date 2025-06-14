
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  duplicateTab: (id: string) => void; // <-- Added prop
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  setActiveTabId,
  addTab,
  closeTab,
  renameTab,
  duplicateTab,
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
  const [comments, setComments] = useState<{ [tabId: string]: string }>({});

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
    <div className="w-full bg-white pl-6 md:pl-8 select-none" style={{border: "none", boxShadow: "none"}}>
      <TooltipProvider>
        <Tabs
          value={activeTabId || (tabs.length > 0 ? tabs[0].id : undefined)}
          onValueChange={setActiveTabId}
        >
          <TabsList
            className="flex items-center bg-white p-0 rounded-none border-none shadow-none gap-0 justify-start w-auto min-w-0"
            style={{
              margin: 0,
              boxShadow: "none",
              border: "none",
            }}
          >
            {tabs.map((tab) => (
              <Tooltip key={tab.id} delayDuration={100}>
                <TooltipTrigger asChild>
                  <div
                    className="mr-1"
                    style={{ cursor: "pointer" }}
                    onDoubleClick={() => handleTabDoubleClick(tab)}
                    tabIndex={0}
                  >
                    <TabsTrigger
                      value={tab.id}
                      onClick={() => setActiveTabId(tab.id)}
                      className={
                        "flex items-center px-4 py-2 font-semibold rounded-lg border text-sm shadow transition-none select-none focus-visible:ring-0 focus:ring-0 focus:outline-none " +
                        (tab.id === activeTabId
                          ? "bg-gray-100 border-gray-400 z-10 text-black"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50")
                      }
                      style={{
                        outline: "none",
                        marginBottom: "0px",
                        borderBottom: "2.5px solid transparent",
                        gap: ".5rem",
                        alignItems: "center",
                        minWidth: "80px",
                        maxHeight: "42px",
                        boxShadow: "0 1.5px 5px 0 rgb(24 24 24 / 0.03)",
                        borderWidth: "1.5px",
                        borderStyle: "solid",
                        borderColor: tab.id === activeTabId ? "#d1d5db" : "#e5e7eb", // gray-400 or gray-200
                        paddingRight: "1.75rem", // leave room for icons
                        paddingLeft: "0.9rem",
                        borderRadius: "0.85rem",
                        position: "relative",
                        zIndex: tab.id === activeTabId ? 20 : undefined,
                        transition: "background 0.15s, border 0.15s",
                      }}
                    >
                      <span className="truncate max-w-[110px]" title={tab.name}>
                        {tab.name}
                      </span>
                      {/* Duplicate tab icon */}
                      <button
                        className="ml-2 text-gray-400 hover:text-blue-600 p-0 flex items-center"
                        onClick={e => {
                          e.stopPropagation();
                          duplicateTab(tab.id);
                        }}
                        title="Duplicate tab"
                        tabIndex={-1}
                        aria-label="Duplicate tab"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          lineHeight: 0,
                          marginLeft: ".2rem",
                        }}
                      >
                        <Copy size={16} />
                      </button>
                      {/* Close tab icon */}
                      <button
                        className="ml-1 text-gray-400 hover:text-red-600 p-0 flex items-center"
                        onClick={e => {
                          e.stopPropagation();
                          closeTab(tab.id);
                        }}
                        title="Close tab"
                        tabIndex={-1}
                        aria-label="Close tab"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          lineHeight: 0,
                          marginLeft: ".2rem"
                        }}
                      >
                        <X size={16} />
                      </button>
                    </TabsTrigger>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  {comments[tab.id] ?? tab.comment ?? (
                    <span className="italic text-gray-400">(No comment)</span>
                  )}
                  <div
                    className="mt-1 text-xs text-blue-500 cursor-pointer underline"
                    onClick={() => handleTabDoubleClick(tab)}
                  >
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
              style={{
                background: "transparent",
                border: "none",
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Add Tab"
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

