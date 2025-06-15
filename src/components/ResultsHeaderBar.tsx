import React from "react";

interface ResultsHeaderBarProps {
  collapsed: boolean;
  onCollapseToggle?: () => void;
  disableCollapse?: boolean;
}

// Remove the chevron icon, but keep a11y and click handling
const ResultsHeaderBar: React.FC<ResultsHeaderBarProps> = ({
  collapsed,
  onCollapseToggle,
  disableCollapse,
}) => (
  <button
    type="button"
    aria-label={collapsed ? "Expand Results" : "Collapse Results"}
    onClick={onCollapseToggle}
    className="ml-2 mr-3 text-gray-500 bg-transparent rounded p-1 transition"
    style={{
      // No arrow, so no rotate/transition needed.
      minWidth: 30,
      minHeight: 30,
      cursor: disableCollapse ? "not-allowed" : "pointer",
    }}
    disabled={disableCollapse}
  >
    {/* No chevron icon; just an invisible button for click/keyboard a11y */}
    <span className="sr-only">{collapsed ? "Expand Results" : "Collapse Results"}</span>
  </button>
);

export default ResultsHeaderBar;
