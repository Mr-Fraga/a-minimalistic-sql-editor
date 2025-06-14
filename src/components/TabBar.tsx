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
    <div className="w-full bg-white pl-6 md:pl-8"> {/* left-align, match SQL title, no border or shadow */}
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
                        "flex items-center px-4 py-2 font-semibold rounded-lg bg-white border border-gray-200 text-sm shadow text-black transition-none select-none focus-visible:ring-0 focus:ring-0 focus:outline-none " +
                        (tab.id === activeTabId
                          ? "z-10 " // keep active on top
                          : "text-gray-700 hover:bg-gray-50")
                      }
                      style={{
                        outline: "none",
                        marginBottom: "0px",
                        borderBottom: "none",
                        gap: ".5rem",
                        boxShadow: "0 1px 2.5px 0 rgb(60 60 60 / 0.02)",
                        alignItems: "center",
                        minWidth: "80px", // for stability
                      }}
                    >
                      <span className="truncate max-w-[120px]" title={tab.name}>
                        {tab.name}
                      </span>
                      <button
                        className="ml-2 text-gray-400 hover:text-red-600 p-0 flex items-center"
                        onClick={e => {
                          e.stopPropagation();
                          closeTab(tab.id);
                        }}
                        title="Close tab"
                        tabIndex={-1}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          lineHeight: 0,
                          marginLeft: ".25rem"
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
