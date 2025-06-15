
import React, { useState } from "react";
import ResultTable from "@/components/ResultTable";
import { ResultsActionsBar } from "@/components/ResultTable/ResultsActionsBar";
import { ResultsStatsBar } from "@/components/ResultTable/ResultsStatsBar";
import { toast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

// Minimum/Maximum result height
const MIN_RESULTS_HEIGHT = 80;
const MAX_RESULTS_HEIGHT = 600;

interface TabResultsSectionProps {
  tab: any;
  resultsHeight: number;
  setResultsHeight: (h: number) => void;
  onDownloadCsv?: (rowsToExport?: Array<any[]>) => void;
  // NEW COLLAPSIBLE props
  collapsed?: boolean;
  onCollapseToggle?: () => void;
  disableCollapse?: boolean;
}

const TabResultsSection: React.FC<TabResultsSectionProps> = ({
  tab,
  resultsHeight,
  setResultsHeight,
  onDownloadCsv,
  collapsed = false,
  onCollapseToggle,
  disableCollapse = false,
}) => {
  // Drag logic only for resizing
  const dragStartY = React.useRef<number | null>(null);
  const dragStartHeight = React.useRef<number>(resultsHeight);

  const handleDragStart = (e: React.MouseEvent) => {
    if (collapsed) return; // Prevent drag when collapsed
    dragStartY.current = e.clientY;
    dragStartHeight.current = resultsHeight;
    window.addEventListener("mousemove", handleDrag);
    window.addEventListener("mouseup", handleDragEnd);
    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";
  };

  const handleDrag = (e: MouseEvent) => {
    if (dragStartY.current !== null) {
      const delta = e.clientY - dragStartY.current;
      let newHeight = dragStartHeight.current - delta;
      newHeight = Math.max(MIN_RESULTS_HEIGHT, Math.min(MAX_RESULTS_HEIGHT, newHeight));
      setResultsHeight(newHeight);
    }
  };

  const handleDragEnd = () => {
    window.removeEventListener("mousemove", handleDrag);
    window.removeEventListener("mouseup", handleDragEnd);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    dragStartY.current = null;
  };

  // Demo toggle state (not used for data)
  const [toggled, setToggled] = useState(false);

  // Helper to create filename with tab name and timestamp
  function getDownloadFilename(tabName: string) {
    function sanitize(str: string) {
      return str.replace(/[^a-zA-Z0-9_\-]/g, "_");
    }
    const now = new Date();
    const timestamp =
      now.getFullYear().toString() +
      ("0" + (now.getMonth() + 1)).slice(-2) +
      ("0" + now.getDate()).slice(-2) +
      "_" +
      ("0" + now.getHours()).slice(-2) +
      ("0" + now.getMinutes()).slice(-2) +
      ("0" + now.getSeconds()).slice(-2);
    return `${sanitize(tabName)}_${timestamp}.csv`;
  }

  // Download as CSV handler for demo - use tab.result not mock
  const handleDownload = () => {
    const result = tab?.result;
    if (!result || !Array.isArray(result.rows) || result.rows.length === 0) {
      toast({
        title: "No data",
        description: "No results to download.",
      });
      return;
    }
    const header = result.columns.map(val =>
      typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val
    ).join(",");
    const rows = result.rows.map(r =>
      r.map(val => (typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val)).join(",")
    );
    const csv = [header, ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = getDownloadFilename(tab?.name || "Tab");
    a.href = url;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
  };

  // Use tab.result for stats
  const numRows = tab?.result?.rows?.length || 0;
  const numColumns = tab?.result?.columns?.length || 0;

  // Determine error to show in table: Only if error present *and* data present
  let resultTableError = null;
  if (
    tab?.error &&
    tab?.result &&
    Array.isArray(tab.result.rows) &&
    tab.result.rows.length > 0
  ) {
    resultTableError = tab.error;
  }

  // New: check if we have table data (columns)
  const hasTableData = !!(tab?.result && Array.isArray(tab.result.columns) && tab.result.columns.length > 0);

  // --- LAYOUT CHANGE SECTION ---

  // We make a vertical flex container,
  // - The main content (results table etc.) is CollapsibleContent and flex-0 when collapsed, flex-auto otherwise.
  // - The collapsed bar (header with collapse/expand) is always at the bottom.

  return (
    <div className="flex flex-col h-full min-h-0 w-full">
      {/* Collapsible content (main table/results), hidden when collapsed */}
      <Collapsible open={!collapsed}>
        <CollapsibleContent asChild>
          <div
            className="flex flex-col min-h-0 w-full bg-white"
            style={{
              height: resultsHeight,
              minHeight: 80,
              maxHeight: 600,
              transition: "height 0.08s",
              flex: "0 0 auto", // don't expand, just this height
            }}
          >
            <div
              className="flex-1 flex flex-col min-h-0 px-0 pt-4 pb-2 w-full"
              style={{ background: "#fff" }}
            >
              {hasTableData ? (
                <ResultTable result={tab.result} error={resultTableError} />
              ) : (
                <div className="bg-gray-100 rounded-lg font-din text-gray-400 flex items-center justify-center w-full h-32 text-lg flex-1">
                  No Data
                </div>
              )}
              {/* Bottom bar: buttons left, stats right */}
              <div className="flex items-end justify-between px-4 pb-3 pt-0 w-full">
                <ResultsActionsBar
                  onDownload={handleDownload}
                  toggled={toggled}
                  onToggle={() => setToggled(t => !t)}
                />
                <div className="flex flex-1 items-center justify-end">
                  <ResultsStatsBar
                    numRows={numRows}
                    numColumns={numColumns}
                    elapsedMs={tab?.result?.elapsedMs ?? undefined}
                  />
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      {/* Results "footer"/bar with collapse/expand at very bottom */}
      <div
        className="flex items-center justify-between px-0 py-2 bg-white border-t border-gray-200 select-none"
        style={{
          userSelect: "none",
          minHeight: 32,
          cursor: collapsed ? undefined : "ns-resize",
          border: 0,
          zIndex: 1,
        }}
      >
        {/* Drag handle and label (only show drag when expanded) */}
        <div
          className="flex-1 flex items-center"
          onMouseDown={collapsed ? undefined : handleDragStart}
          role="separator"
          aria-label="Drag to resize results"
          tabIndex={0}
        >
          <h2 className="font-din font-bold text-base text-gray-800 ml-4" style={{ letterSpacing: "0.04em" }}>
            Results
          </h2>
        </div>
        <CollapsibleTrigger
          asChild
          disabled={disableCollapse}
        >
          <button
            type="button"
            aria-label={collapsed ? "Expand Results" : "Collapse Results"}
            onClick={onCollapseToggle}
            className="ml-2 mr-3 text-gray-500 bg-transparent hover:text-black rounded p-1 transition"
            style={{
              transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 0.3s",
            }}
          >
            {collapsed ? <ChevronDown size={20}/> : <ChevronUp size={20}/>}
          </button>
        </CollapsibleTrigger>
      </div>
    </div>
  );
};

export default TabResultsSection;

