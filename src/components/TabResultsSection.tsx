
import React from "react";
import ResultsContainer from "@/components/ResultsContainer";

interface TabResultsSectionProps {
  tab: any;
  resultsHeight: number;
  setResultsHeight: (h: number) => void;
  onDownloadCsv?: (rowsToExport?: Array<any[]>) => void;
  collapsed?: boolean;
  onCollapseToggle?: () => void;
  disableCollapse?: boolean;
}

// This is now a simple state wrapper that renders ResultsContainer.
const TabResultsSection: React.FC<TabResultsSectionProps> = (props) => {
  return <ResultsContainer {...props} collapsed={!!props.collapsed} />;
};

export default TabResultsSection;
