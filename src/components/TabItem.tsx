
import React from "react";
import { TabsTrigger } from "@/components/ui/tabs";
import { Copy, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TabItemProps {
  tab: {
    id: string;
    name: string;
    sql: string;
    result: { columns: string[]; rows: Array<any[]> } | null;
    error: string | null;
    isRunning: boolean;
    comment?: string;
  };
  isActive: boolean;
  isEditing: boolean;
  onDoubleClick: (tab: any) => void;
  editValue: string;
  onEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditBlur: (tabId: string) => void;
  onEditKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    tabId: string
  ) => void;
  setActiveTabId: (id: string) => void;
  duplicateTab: (id: string) => void;
  closeTab: (id: string) => void;
  openCommentModal: (tab: any) => void;
  comment: string | undefined;
}

const TabItem: React.FC<TabItemProps> = ({
  tab,
  isActive,
  isEditing,
  onDoubleClick,
  editValue,
  onEditChange,
  onEditBlur,
  onEditKeyDown,
  setActiveTabId,
  duplicateTab,
  closeTab,
  openCommentModal,
  comment,
}) => (
  <Tooltip delayDuration={100}>
    <TooltipTrigger asChild>
      <div
        className="mr-1"
        onDoubleClick={() => onDoubleClick(tab)}
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
            borderBottom: isActive
              ? "2.5px solid #d1d5db"
              : "2.5px solid transparent",
            gap: ".5rem",
            minWidth: "96px",
            maxHeight: "42px",
            boxShadow: "0px 1.5px 5px 0px rgb(24 24 24 / 0.03)",
            borderWidth: "1.5px",
            borderStyle: "solid",
            borderColor: isActive ? "#d1d5db" : "#e5e7eb",
            paddingRight: "2.0rem",
            paddingLeft: "0.9rem",
            borderRadius: "0.85rem", // UPDATED: fully rounded rectangle
            position: "relative",
            zIndex: isActive ? 20 : undefined,
            transition: "background 0.15s, border 0.15s",
            background: isActive ? "#f3f4f6" : "#fff",
            alignItems: "center",
            display: "flex",
          }}
        >
          {isEditing ? (
            <input
              autoFocus
              type="text"
              className="bg-transparent border-none outline-none text-sm max-w-[110px] truncate"
              style={{ minWidth: 40, maxWidth: 110 }}
              value={editValue}
              onChange={onEditChange}
              onBlur={() => onEditBlur(tab.id)}
              onKeyDown={e => onEditKeyDown(e, tab.id)}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className="truncate max-w-[110px]" title={tab.name}>
              {tab.name}
            </span>
          )}
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
              marginRight: ".18rem",
            }}
          >
            <Copy size={16} />
          </button>
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
              marginLeft: ".2rem",
            }}
          >
            <X size={16} />
          </button>
        </TabsTrigger>
      </div>
    </TooltipTrigger>
    <TooltipContent
      side="bottom"
      className="max-w-xs cursor-pointer"
      onClick={() => openCommentModal(tab)}
    >
      {comment ?? tab.comment ?? (
        <span className="italic text-gray-400">
          (No comment)
        </span>
      )}
    </TooltipContent>
  </Tooltip>
);

export default TabItem;
