
import React from "react";
import { Plus } from "lucide-react";

interface TabBarAddButtonProps {
  addTab: () => void;
}

const TabBarAddButton: React.FC<TabBarAddButtonProps> = ({ addTab }) => (
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
);

export default TabBarAddButton;
