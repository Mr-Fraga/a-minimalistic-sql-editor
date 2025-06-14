import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

// TabBar props separate from MainContent logic
type TabType = {
  id: string;
  name: string;
  sql: string;
  result: { columns: string[]; rows: Array<any[]> } | null;
  error: string | null;
  isRunning: boolean;
};

interface TabBarProps {
  tabs: TabType[];
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  addTab: () => void;
  closeTab: (id: string) => void;
  renameTab: (id: string, newName: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  setActiveTabId,
  addTab,
  closeTab,
  renameTab
}) => {
  return (
    <div className="flex items-center bg-white px-6 md:px-8 pr-2 transition-colors duration-100">
      {tabs.map((tab, idx) => (
        <TabHeader
          key={tab.id}
          id={tab.id}
          name={tab.name}
          isActive={tab.id === activeTabId}
          onTabClick={() => setActiveTabId(tab.id)}
          onTabClose={closeTab}
          onTabRename={renameTab}
          className={idx !== 0 ? "ml-2" : ""}
        />
      ))}
      <Button variant="ghost" size="sm" onClick={addTab}>
        <Plus className="w-4 h-4" />
      </Button>
      <div className="flex-1" />
    </div>
  );
};

interface TabHeaderProps {
  id: string;
  name: string;
  isActive: boolean;
  onTabClick: () => void;
  onTabClose: (id: string) => void;
  onTabRename: (id: string, newName: string) => void;
  className?: string;
}

const TabHeader: React.FC<TabHeaderProps> = ({
  id,
  name,
  isActive,
  onTabClick,
  onTabClose,
  onTabRename,
  className = "",
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    setNewName(name);
  }, [name]);

  const handleRename = () => {
    if (newName.trim() !== "") {
      onTabRename(id, newName);
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setNewName(name);
      setIsRenaming(false);
    }
  };

  return (
    <div
      className={
        `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 cursor-pointer select-none border ` +
        `shadow-md ring-1 ring-gray-200 ` + // darker shadow & subtle gray contour
        `${isActive ? "bg-gray-100 border-black" : "bg-white border-black"} ` +
        className
      }
      style={{
        borderBottom: isActive ? "2px solid black" : "2px solid black",
        borderLeft: "1px solid black",
        borderRight: "1px solid black",
        borderTop: "1px solid black"
      }}
      onDoubleClick={() => setIsRenaming(true)}
      onClick={onTabClick}
    >
      {isRenaming ? (
        <Input
          ref={inputRef}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleRename}
          className="text-sm font-din font-medium rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 border-none shadow-none outline-none bg-transparent w-24"
        />
      ) : (
        <span className={`w-24 truncate font-din ${isActive ? "font-bold" : ""}`}>{name}</span>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onTabClose(id);
        }}
        className="ml-1 -mr-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-x w-3 h-3"
        >
          <path d="M18 6 6 18" />
          <path d="M6 6 18 18" />
        </svg>
        <span className="sr-only">Close tab</span>
      </Button>
    </div>
  );
};

export default TabBar;
