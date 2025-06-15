import React, { useState, useRef } from "react";
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

// Height constraints (used for drag)
const MIN_RESULTS_HEIGHT = 80;
const MAX_RESULTS_HEIGHT = 600;

interface ResultsContainerProps {
  tab: any;
  resultsHeight: number;
  setResultsHeight: (h: number) => void;
  onDownloadCsv?: (rowsToExport?: Array<any[]>) => void;
  collapsed: boolean;
  onCollapseToggle?: () => void;
  disableCollapse?: boolean; // <-- now optional
}

const ResultsContainer: React.FC<ResultsContainerProps> = ({
  tab,
  resultsHeight,
  setResultsHeight,
  onDownloadCsv,
  collapsed,
  onCollapseToggle,
  disableCollapse,
}) => {
  const dragStartY = useRef<number | null>(null);
  const dragStartHeight = useRef<number>(resultsHeight);

  const handleDragStart = (e: React.MouseEvent) => {
    if (collapsed) return;
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

  const [toggled, setToggled] = useState(false);

  // Stats
  const numRows = tab?.result?.rows?.length || 0;
  const numColumns = tab?.result?.columns?.length || 0;

  // Table error (show error in table only if result and error)
  let resultTableError = null;
  if (
    tab?.error &&
    tab?.result &&
    Array.isArray(tab.result.rows) &&
    tab.result.rows.length > 0
  ) {
    resultTableError = tab.error;
  }

  const hasTableData = !!(tab?.result && Array.isArray(tab.result.columns) && tab.result.columns.length > 0);

  // ---- MAIN RENDER ----
  // When collapsed: only show bar, fixed small height, relative position (not absolute), does not overlap sidebar
  // When expanded: normal results height

  return (
    <Collapsible open={!collapsed}>
      <div
        className="flex flex-col min-h-0 w-full bg-white"
        style={
          collapsed
            ? {
                height: 40,
                minHeight: 32,
                maxHeight: 48,
                padding: 0,
                margin: 0,
                position: "relative",
                zIndex: 1, // stays above sql editor, but no overlay
              }
            : {
                height: resultsHeight,
                minHeight: 80,
                maxHeight: 600,
                flex: "0 0 auto",
                padding: 0,
                margin: 0,
                position: "relative",
                zIndex: 1,
              }
        }
      >
        {/* Provide gap above Results only if not collapsed */}
        {!collapsed && <div className="h-5" aria-hidden />}
        <CollapsibleContent asChild>
          {/* Only render content if not collapsed */}
          {!collapsed && (
            <div className="flex flex-col min-h-0 w-full h-full bg-white">
              {/* Results bar and drag handle always at top of results */}
              <div
                className="flex items-center justify-between px-0 pt-0 pb-2 w-full"
                style={{
                  userSelect: "none",
                  minHeight: 32,
                  border: 0,
                  zIndex: 3,
                }}
              >
                <div
                  className="flex-1 flex items-center"
                  onMouseDown={collapsed ? undefined : handleDragStart}
                  role="separator"
                  aria-label="Drag to resize results"
                  tabIndex={0}
                  style={{
                    cursor: collapsed ? undefined : "ns-resize",
                  }}
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
              <div className="flex flex-col flex-1 min-h-0 justify-between">
                <div className="flex-1 min-h-0 flex">
                  {hasTableData ? (
                    <ResultTable result={tab.result} error={resultTableError} />
                  ) : (
                    <div className="bg-gray-100 rounded-lg font-din text-gray-400 flex items-center justify-center w-full h-full min-h-0 flex-1 text-lg">
                      No Data
                    </div>
                  )}
                </div>
                <div className="flex items-end justify-between px-4 pb-3 pt-0 mt-6 w-full">
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
          )}
        </CollapsibleContent>
        {/* When collapsed, show just the results bar at the bottom */}
        {collapsed && (
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
        )}
      </div>
    </Collapsible>
  );
};

export default ResultsContainer;
