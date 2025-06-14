
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
  duplicateTab: (id: string) => void;
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
  // State for editing tab name
  const [editTabId, setEditTabId] = useState<string | null>(null);
  const [tabNameDraft, setTabNameDraft] = useState<string>("");

  // State for editing comment (modal)
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
  const handleTabNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, tabId: string) => {
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
    <div className="w-full bg-white select-none" style={{ border: "none", boxShadow: "none", paddingLeft: "2rem" }}>
      <TooltipProvider>
        <Tabs
          value={activeTabId || (tabs.length > 0 ? tabs[0].id : undefined)}
          onValueChange={setActiveTabId}
        >
          {/* Remove horizontal lines via border/boxShadow, left-aligned, no wrapping */}
          <TabsList
            className="flex flex-row items-center bg-white p-0 gap-0 justify-start w-auto min-w-0"
            style={{
              margin: 0,
              border: "none",
              boxShadow: "none",
              minHeight: "44px",
            }}
          >
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <Tooltip key={tab.id} delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div
                      className="mr-1"
                      onDoubleClick={() => handleTabDoubleClick(tab)}
                      style={{
                        cursor: "pointer",
                        minWidth: "80px",
                        maxHeight: "44px",
                        display: "flex",
                        alignItems: "center",
                        padding: 0,
                        background: "none",
                      }}
                      tabIndex={0}
                    >
                      <TabsTrigger
                        value={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        className={
                          "flex items-center font-semibold border text-sm shadow select-none focus-visible:ring-0 focus:ring-0 focus:outline-none transition-none relative " +
                          (isActive
                            ? "bg-gray-100 border-gray-400 z-10 text-black"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50")
                        }
                        style={{
                          outline: "none",
                          marginBottom: "0px",
                          borderBottom: isActive ? "2.5px solid #d1d5db" : "2.5px solid transparent",
                          gap: ".5rem",
                          minWidth: "96px",
                          maxHeight: "42px",
                          boxShadow: "0px 1.5px 5px 0px rgb(24 24 24 / 0.03)",
                          borderWidth: "1.5px",
                          borderStyle: "solid",
                          borderColor: isActive ? "#d1d5db" : "#e5e7eb",
                          paddingRight: "2.0rem",
                          paddingLeft: "0.9rem",
                          borderRadius: "0.85rem 0.85rem 0px 0px",
                          position: "relative",
                          zIndex: isActive ? 20 : undefined,
                          transition: "background 0.15s, border 0.15s",
                          background: isActive ? "#f3f4f6" : "#fff",
                          alignItems: "center",
                          display: "flex",
                        }}
                      >
                        {/* Tab name or input if renaming */}
                        {editTabId === tab.id ? (
                          <input
                            autoFocus
                            type="text"
                            className="bg-transparent border-none outline-none text-sm max-w-[110px] truncate"
                            style={{ minWidth: 40, maxWidth: 110 }}
                            value={tabNameDraft}
                            onChange={handleTabNameChange}
                            onBlur={() => handleTabNameBlur(tab.id)}
                            onKeyDown={e => handleTabNameKeyDown(e, tab.id)}
                            onClick={e => e.stopPropagation()}
                          />
                        ) : (
                          <span className="truncate max-w-[110px]" title={tab.name}>
                            {tab.name}
                          </span>
                        )}
                        {/* Duplicate tab icon (functional) */}
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
                            marginLeft: ".18rem",
                            marginRight: ".18rem"
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
                      onDoubleClick={() => openCommentModal(tab)}
                    >
                      Double click to edit comment
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
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

