
import React from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface ResultsStatsBarProps {
  numRows: number;
  numColumns: number;
  elapsedMs?: number; // Optionally show elapsed
}

export const ResultsStatsBar: React.FC<ResultsStatsBarProps> = ({
  numRows,
  numColumns,
  elapsedMs,
}) => {
  // Mocked info
  const mockElapsedMs = 0.4;
  const mockQueryId = "1234abc";
  return (
    <div className="text-xs text-gray-500 px-4 py-2 border-t border-gray-100 flex items-center gap-5">
      <span>
        <strong>{numRows}</strong> {numRows === 1 ? "row" : "rows"}
      </span>
      <span>
        <strong>{numColumns}</strong> {numColumns === 1 ? "column" : "columns"}
      </span>
      <span>
        <strong>Time:</strong>{" "}
        {typeof elapsedMs === "number"
          ? `${elapsedMs} ms`
          : `${mockElapsedMs} milliseconds`}
      </span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              tabIndex={0}
              aria-label={`Query info: ${mockQueryId}`}
              className="pl-2 pr-1 focus:outline-none active:scale-95"
              type="button"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Info size={16} className="text-blue-400 hover:text-blue-600 transition-colors" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="p-2">
            <span>
              Query ID:&nbsp;
              <a
                href={`/logs/${mockQueryId}`}
                className="text-blue-500 underline hover:text-blue-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                {mockQueryId}
              </a>
            </span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
