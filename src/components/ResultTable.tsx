
import React, { useState, useMemo, useRef, useEffect } from "react";
import { ArrowDown, ArrowUp, Filter, Copy as CopyIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ResultTableProps {
  result?: {
    columns: string[];
    rows: Array<any[]>;
  };
  error?: string | null;
}

function toCSV(columns: string[], rows: Array<any[]>): string {
  const escape = (val: any) =>
    typeof val === "string"
      ? `"${val.replace(/"/g, '""')}"`
      : val == null
      ? ""
      : val;
  const lines = [columns.map(escape).join(",")];
  for (const row of rows) {
    lines.push(row.map(escape).join(","));
  }
  return lines.join("\r\n");
}

type SortOrder = null | "asc" | "desc";

function sortRows(rows: Array<any[]>, colIndex: number, order: SortOrder): Array<any[]> {
  if (!order) return rows;
  return [...rows].sort((a, b) => {
    const x = a[colIndex];
    const y = b[colIndex];
    if (typeof x === "number" && typeof y === "number") {
      return order === "asc" ? x - y : y - x;
    }
    if (!isNaN(Number(x)) && !isNaN(Number(y))) {
      return order === "asc" ? Number(x) - Number(y) : Number(y) - Number(x);
    }
    return order === "asc"
      ? String(x).localeCompare(String(y))
      : String(y).localeCompare(String(x));
  });
}

function filterRows(rows: Array<any[]>, filters: string[]): Array<any[]> {
  return rows.filter((row) =>
    row.every((cell, idx) =>
      filters[idx]
        ? String(cell ?? "")
            .toLowerCase()
            .includes(filters[idx].toLowerCase())
        : true
    )
  );
}

const downloadBtnClass =
  "rounded px-4 py-1 bg-black text-white text-sm font-mono hover:bg-gray-900 transition";

// Helper for selection logic
type Selection =
  | { type: "cell"; cells: [number, number][] }
  | { type: "column"; col: number }
  | null;

const ResultTable: React.FC<ResultTableProps> = ({ result, error }) => {
  const [filters, setFilters] = useState<string[]>([]);
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // Selection state for copying
  const [selection, setSelection] = useState<Selection>(null);
  // For drag-select
  const dragStart = useRef<{ row: number; col: number } | null>(null);

  // Reset sort/filter/selection if new result
  React.useEffect(() => {
    setFilters(result ? Array(result.columns.length).fill("") : []);
    setSortCol(null);
    setSortOrder(null);
    setSelection(null);
  }, [result]);

  const filteredRows = useMemo(() => {
    if (!result) return [];
    let rows = result.rows;
    if (filters.some(Boolean)) {
      rows = filterRows(rows, filters);
    }
    if (sortCol !== null && sortOrder) {
      rows = sortRows(rows, sortCol, sortOrder);
    }
    return rows;
  }, [result, filters, sortCol, sortOrder]);

  // Handle cell click to select it
  const handleCellMouseDown = (rowIdx: number, colIdx: number) => {
    setSelection({ type: "cell", cells: [[rowIdx, colIdx]] });
    dragStart.current = { row: rowIdx, col: colIdx };
  };

  // Handle cell drag to select multiple cells
  const handleCellMouseEnter = (rowIdx: number, colIdx: number) => {
    if (!dragStart.current) return;
    const { row, col } = dragStart.current;
    const rowMin = Math.min(row, rowIdx);
    const rowMax = Math.max(row, rowIdx);
    const colMin = Math.min(col, colIdx);
    const colMax = Math.max(col, colIdx);
    const cells: [number, number][] = [];
    for (let r = rowMin; r <= rowMax; r++) {
      for (let c = colMin; c <= colMax; c++) {
        cells.push([r, c]);
      }
    }
    setSelection({ type: "cell", cells });
  };

  // End drag select
  const handleCellMouseUp = () => {
    dragStart.current = null;
  };

  useEffect(() => {
    // End drag select on mouseup elsewhere
    window.addEventListener("mouseup", handleCellMouseUp);
    return () => window.removeEventListener("mouseup", handleCellMouseUp);
  }, []);

  // Column header click to select a column
  const handleHeaderClick = (idx: number) => {
    if (sortCol !== idx) {
      setSortCol(idx);
      setSortOrder("asc");
    } else {
      setSortOrder((s) =>
        s === "asc" ? "desc" : s === "desc" ? null : "asc"
      );
      if (sortOrder === "desc") setSortCol(null);
    }
    setSelection({ type: "column", col: idx });
  };

  // Helper: get set of selected cells for easy styling
  const selectedCellsSet = useMemo(() => {
    if (!selection || selection.type !== "cell") return new Set<string>();
    return new Set(selection.cells.map(([r, c]) => `${r},${c}`));
  }, [selection]);

  // Helper: get selected column
  const selectedCol = selection && selection.type === "column" ? selection.col : null;

  // Copy cell(s), column or whole table
  const handleCopy = () => {
    if (!result) return;
    let textToCopy = "";
    if (selection) {
      if (selection.type === "cell") {
        // Copy selected cells as TSV
        const sRows = Math.max(...selection.cells.map(([r]) => r)) + 1;
        const sCols = Math.max(...selection.cells.map(([,c]) => c)) + 1;
        // map: rowIdx => array of columns for this selection
        const grid: { [row: number]: { [col: number]: any } } = {};
        for (const [r, c] of selection.cells) {
          if (!grid[r]) grid[r] = {};
          grid[r][c] = filteredRows[r]?.[c] ?? "";
        }
        // Build as tabular
        let rows = [];
        for (let r = 0; r < filteredRows.length; r++) {
          if (!grid[r]) continue;
          let vals: any[] = [];
          for (let c = 0; c < result.columns.length; c++) {
            if (grid[r][c] !== undefined) vals.push(grid[r][c]);
          }
          if (vals.length) rows.push(vals.join("\t"));
        }
        textToCopy = rows.join("\n");
      } else if (selection.type === "column") {
        // Copy single column as lines
        textToCopy =
          result.columns[selection.col] +
          "\n" +
          filteredRows.map((row) => row[selection.col]).join("\n");
      }
    } else if (result && filteredRows.length) {
      // Copy all
      textToCopy =
        result.columns.join("\t") +
        "\n" +
        filteredRows.map((row) => row.join("\t")).join("\n");
    }
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Copied",
        description: "Copied selected data to clipboard.",
      });
    }
  };

  // Keyboard shortcut for copy
  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "c" &&
        selection &&
        result
      ) {
        handleCopy();
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
    // eslint-disable-next-line
  }, [selection, result, filteredRows]);

  // Copy column button
  const handleCopyColumn = () => {
    if (
      selection &&
      selection.type === "column" &&
      result
    ) {
      // Copy entire column
      const colIdx = selection.col;
      const text =
        result.columns[colIdx] +
        "\n" +
        filteredRows.map((row) => row[colIdx]).join("\n");
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied column",
        description: `Copied column "${result.columns[colIdx]}" to clipboard.`,
      });
    }
  };

  // Clear selection
  const handleClearSelection = () => setSelection(null);

  if (error)
    return (
      <div className="rounded bg-red-50 border border-red-200 text-red-700 p-4 font-mono mt-2">
        {error}
      </div>
    );

  if (!result)
    return (
      <div className="text-gray-500 font-mono px-4 py-4 italic">No results yet.</div>
    );

  return (
    <div className="w-full overflow-x-auto border border-gray-200 rounded bg-white mt-2 flex flex-col min-h-0">
      <table className="min-w-full text-xs font-mono text-black select-none">
        <thead>
          {/* Filtering Row */}
          <tr className="border-b border-gray-100 bg-white">
            {result.columns.map((col, idx) => (
              <th key={col + "_filter"} className="px-3 py-1">
                <Input
                  value={filters[idx] ?? ""}
                  onChange={e => {
                    const v = e.target.value;
                    setFilters(fs => {
                      const next = [...fs];
                      next[idx] = v;
                      return next;
                    });
                  }}
                  placeholder="Filter"
                  className="h-6 py-0 px-2 text-xs border-gray-200 bg-gray-50"
                  style={{ minWidth: 60 }}
                />
              </th>
            ))}
          </tr>
          {/* Header Row (sorting & column select) */}
          <tr className="border-b border-gray-200 bg-gray-50">
            {result.columns.map((col, idx) => (
              <th
                key={col}
                className={
                  "px-3 py-2 text-left font-bold cursor-pointer select-none relative group" +
                  (selectedCol === idx ? " bg-blue-100 text-blue-900" : "")
                }
                onClick={() => handleHeaderClick(idx)}
                style={{ userSelect: "none" }}
              >
                <span className="flex items-center gap-1">
                  {col}
                  <span className="ml-1 text-gray-500 opacity-70 group-hover:opacity-100 transition-opacity">
                    {sortCol === idx && sortOrder === "asc" && <ArrowUp className="inline-block w-3 h-3" />}
                    {sortCol === idx && sortOrder === "desc" && <ArrowDown className="inline-block w-3 h-3" />}
                    {sortCol !== idx && <span className="w-3 h-3"></span>}
                  </span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredRows.length === 0 ? (
            <tr>
              <td colSpan={result.columns.length} className="text-center py-3 text-gray-400">
                (No data)
              </td>
            </tr>
          ) : (
            filteredRows.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 ? "bg-gray-50" : undefined}>
                {row.map((cell, colIdx) => {
                  const selected =
                    (selection &&
                      selection.type === "cell" &&
                      selectedCellsSet.has(`${rowIdx},${colIdx}`)) ||
                    (selection &&
                      selection.type === "column" &&
                      colIdx === selectedCol);
                  return (
                    <td
                      key={colIdx}
                      className={
                        "px-3 py-2 cursor-pointer" +
                        (selected
                          ? " bg-blue-200 text-blue-900 font-bold"
                          : " hover:bg-blue-50")
                      }
                      onMouseDown={e => {
                        if (e.button === 0) handleCellMouseDown(rowIdx, colIdx);
                      }}
                      onMouseEnter={e => {
                        if (e.buttons === 1 && dragStart.current)
                          handleCellMouseEnter(rowIdx, colIdx);
                      }}
                      onDoubleClick={handleCopy}
                      onClick={e => e.detail === 2 && handleCopy()}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="flex flex-wrap gap-2 items-center justify-end px-2 pt-4 pb-2">
        <button
          type="button"
          className={downloadBtnClass}
          onClick={handleCopy}
          disabled={
            (!selection && filteredRows.length === 0) ||
            (!!selection &&
              selection.type === "column" &&
              filteredRows.length === 0)
          }
          title="Copy selected (or all) to clipboard"
        >
          <CopyIcon className="inline-block mr-1" size={14} /> Copy
        </button>
        <button
          type="button"
          className={downloadBtnClass}
          onClick={handleCopyColumn}
          disabled={!(selection && selection.type === "column")}
          title="Copy column to clipboard"
        >
          <CopyIcon className="inline-block mr-1" size={14} /> Copy Column
        </button>
        {selection && (
          <button
            type="button"
            className={downloadBtnClass + " bg-gray-200 hover:bg-gray-300 text-black"}
            onClick={handleClearSelection}
            title="Clear selection"
          >
            Clear Selection
          </button>
        )}
        <button
          type="button"
          className={downloadBtnClass}
          onClick={() => {
            if (!result) return;
            const csv = toCSV(result.columns, filteredRows);
            const blob = new Blob([csv], { type: "text/csv" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "results.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          Download CSV
        </button>
      </div>
    </div>
  );
};

export default ResultTable;

