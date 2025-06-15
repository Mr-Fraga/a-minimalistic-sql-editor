
import React from "react";
import ResultsHeaderBar from "./ResultsHeaderBar";

interface ResultsCollapsedBarProps {
  collapsed: boolean;
  onCollapseToggle?: () => void;
  disableCollapse?: boolean;
}

const ResultsCollapsedBar: React.FC<ResultsCollapsedBarProps> = ({
  collapsed,
  onCollapseToggle,
  disableCollapse,
}) => (
  <div
    className="flex items-center justify-between px-0 py-2 bg-white border-t border-gray-200 select-none h-full"
    style={{
      userSelect: "none",
      minHeight: 32,
      maxHeight: 48,
      border: 0,
      width: "100%",
      boxShadow: "0px -2px 6px rgba(0,0,0,0.01)",
      zIndex: 2,
    }}
  >
    <div className="flex-1 flex items-center">
      <h2 className="font-din font-bold text-base text-gray-800 ml-4" style={{ letterSpacing: "0.04em" }}>
        Results
      </h2>
    </div>
    <ResultsHeaderBar
      collapsed={collapsed}
      onCollapseToggle={onCollapseToggle}
      disableCollapse={disableCollapse}
    />
  </div>
);

export default ResultsCollapsedBar;
