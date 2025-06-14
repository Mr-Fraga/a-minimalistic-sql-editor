
import React from "react";

interface ResultsStatsBarProps {
  numRows: number;
  numColumns: number;
  elapsedMs?: number; // Optionally show elapsed
}

export const ResultsStatsBar: React.FC<ResultsStatsBarProps> = ({
  numRows,
  numColumns,
  elapsedMs,
}) => (
  <div className="text-xs text-gray-500 px-4 py-2 border-t border-gray-100 flex items-center gap-5">
    <span>
      <strong>{numRows}</strong> {numRows === 1 ? "row" : "rows"}
    </span>
    <span>
      <strong>{numColumns}</strong> {numColumns === 1 ? "column" : "columns"}
    </span>
    {typeof elapsedMs === "number" && (
      <span>
        <strong>Time:</strong> {elapsedMs} ms
      </span>
    )}
  </div>
);
