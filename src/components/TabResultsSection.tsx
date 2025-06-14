
import React, { useState } from "react";
import ResultTable from "@/components/ResultTable";
import { ResultsActionsBar } from "@/components/ResultTable/ResultsActionsBar";
import { ResultsStatsBar } from "@/components/ResultTable/ResultsStatsBar";

// Always use MOCK_RESULT for demonstration
const MOCK_RESULT = {
  columns: ["id", "name", "email"],
  rows: [
    [1, "Alice", "alice@email.com"],
    [2, "Bob", "bob@email.com"],
    [3, "Charlie", "charlie@email.com"],
  ],
};

const MIN_RESULTS_HEIGHT = 80;
const MAX_RESULTS_HEIGHT = 600;

interface TabResultsSectionProps {
  tab: any;
  resultsHeight: number;
  setResultsHeight: (h: number) => void;
  onDownloadCsv?: (rowsToExport?: Array<any[]>) => void;
}

const TabResultsSection: React.FC<TabResultsSectionProps> = ({
  resultsHeight,
  setResultsHeight,
}) => {
  // Drag logic only for resizing
  const dragStartY = React.useRef<number | null>(null);
  const dragStartHeight = React.useRef<number>(resultsHeight);

  const handleDragStart = (e: React.MouseEvent) => {
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

  // Demo toggle state
  const [toggled, setToggled] = useState(false);

  // Copy handler for demo – copies the whole table as TSV
  const handleCopy = () => {
    const header = MOCK_RESULT.columns.join("\t");
    const rows = MOCK_RESULT.rows.map(r => r.join("\t")).join("\n");
    navigator.clipboard.writeText([header, rows].join("\n"));
  };

  // Download as CSV handler for demo
  const handleDownload = () => {
    const header = MOCK_RESULT.columns.join(",");
    const rows = MOCK_RESULT.rows.map(r =>
      r.map(val => (typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val)).join(",")
    );
    const csv = [header, ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "results.csv";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
  };

  return (
    <div
      className="flex flex-col min-h-[80px] bg-white overflow-hidden relative select-none"
      style={{
        height: resultsHeight,
        minHeight: MIN_RESULTS_HEIGHT,
        maxHeight: MAX_RESULTS_HEIGHT,
        transition: "height 0.08s",
      }}
    >
      {/* Drag handle/title */}
      <div
        className="cursor-ns-resize w-full flex items-center justify-between px-0 py-2 bg-white"
        style={{ userSelect: "none", minHeight: 32, border: 0 }}
        onMouseDown={handleDragStart}
        role="separator"
        aria-label="Drag to resize results"
        tabIndex={0}
      >
        <h2 className="font-din font-bold text-base text-gray-800 ml-4" style={{ letterSpacing: "0.04em" }}>
          Results
        </h2>
        <div className="flex-1"></div>
      </div>
      {/* Actions bar */}
      <ResultsActionsBar
        onCopy={handleCopy}
        onDownload={handleDownload}
        toggled={toggled}
        onToggle={() => setToggled(t => !t)}
      />
      <div className="flex-1 flex flex-col min-h-0 h-full px-0 pt-4 pb-2 w-full">
        <ResultTable result={MOCK_RESULT} />
      </div>
      <ResultsStatsBar
        numRows={MOCK_RESULT.rows.length}
        numColumns={MOCK_RESULT.columns.length}
        elapsedMs={64}
      />
    </div>
  );
};

export default TabResultsSection;
