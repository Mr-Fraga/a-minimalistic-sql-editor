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
import ResultsDragHandle from "./ResultsDragHandle";
import ResultsHeaderBar from "./ResultsHeaderBar";
import ResultsCollapsedBar from "./ResultsCollapsedBar";

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
  disableCollapse?: boolean;
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

  // -- CORE LAYOUT CHANGES --
  // The outer div becomes relative/flex to stay at the bottom

  return (
    <div className="flex flex-col min-h-0 w-full bg-white"
      style={{
        height: collapsed
          ? 40
          : resultsHeight,
        minHeight: collapsed ? 32 : MIN_RESULTS_HEIGHT,
        maxHeight: collapsed ? 48 : MAX_RESULTS_HEIGHT,
        flex: "0 0 auto",
        padding: 0,
        margin: 0,
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Provide gap above Results only if not collapsed */}
      {!collapsed && <div className="h-5" aria-hidden />}
      {!collapsed ? (
        <div className="flex flex-col min-h-0 w-full h-full bg-white">
          <div
            className="flex items-center justify-between px-0 pt-0 pb-2 w-full"
            style={{
              userSelect: "none",
              minHeight: 32,
              border: 0,
              zIndex: 3,
            }}
          >
            <ResultsDragHandle
              collapsed={collapsed}
              onDragStart={handleDragStart}
            />
            <ResultsHeaderBar
              collapsed={collapsed}
              onCollapseToggle={onCollapseToggle}
              disableCollapse={disableCollapse}
            />
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
      ) : (
        // If collapsed, pin the bar to the bottom using flex children order (always at section's bottom)
        <div className="flex flex-col justify-end h-full min-h-0">
          <ResultsCollapsedBar
            collapsed={collapsed}
            onCollapseToggle={onCollapseToggle}
            disableCollapse={disableCollapse}
          />
        </div>
      )}
    </div>
  );
};

export default ResultsContainer;
