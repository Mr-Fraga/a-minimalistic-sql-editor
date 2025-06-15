
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ResultsHeaderBarProps {
  collapsed: boolean;
  onCollapseToggle?: () => void;
  disableCollapse?: boolean;
}

const ResultsHeaderBar: React.FC<ResultsHeaderBarProps> = ({
  collapsed,
  onCollapseToggle,
  disableCollapse,
}) => (
  <button
    type="button"
    aria-label={collapsed ? "Expand Results" : "Collapse Results"}
    onClick={onCollapseToggle}
    className="ml-2 mr-3 text-gray-500 bg-transparent hover:text-black rounded p-1 transition"
    style={{
      transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
      transition: "transform 0.3s",
    }}
    disabled={disableCollapse}
  >
    {collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
  </button>
);

export default ResultsHeaderBar;
