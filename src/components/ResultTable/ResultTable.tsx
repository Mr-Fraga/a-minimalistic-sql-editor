
import React, { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { TableHeader } from "./TableHeader";
import { TableBody } from "./TableBody";
import { TableActions } from "./TableActions";
import { toCSV, sortRows, filterRows, SortOrder, Selection } from "./utils";

interface ResultTableProps {
  result?: {
    columns: string[];
    rows: Array<any[]>;
  };
  error?: string | null;
}

const downloadBtnClass =
  "rounded px-4 py-1 bg-black text-white text-sm font-mono hover:bg-gray-900 transition";

const ResultTable: React.FC<ResultTableProps> = ({ result, error }) => {
  const [filters, setFilters] = useState<string[]>([]);
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // Selection state for copying
  const [selection, setSelection] = useState<Selection>(null);
  // For drag-select
  const dragStart = useRef<{ row: number; col: number } | null>(null);

  // Reset sort/filter/selection if new result
  useEffect(() => {
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
    window.addEventListener("mouseup", handleCellMouseUp);
    return () => window.removeEventListener("mouseup", handleCellMouseUp);
  }, []);

  // Column header click to select/ sort column
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

  const selectedCol = selection && selection.type === "column" ? selection.col : null;

  // Copy cell(s), column or whole table
  const handleCopy = () => {
    if (!result) return;
    let textToCopy = "";
    if (selection) {
      if (selection.type === "cell") {
        const sRows = Math.max(...selection.cells.map(([r]) => r)) + 1;
        const sCols = Math.max(...selection.cells.map(([,c]) => c)) + 1;
        const grid: { [row: number]: { [col: number]: any } } = {};
        for (const [r, c] of selection.cells) {
          if (!grid[r]) grid[r] = {};
          grid[r][c] = filteredRows[r]?.[c] ?? "";
        }
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
        textToCopy =
          result.columns[selection.col] +
          "\n" +
          filteredRows.map((row) => row[selection.col]).join("\n");
      }
    } else if (result && filteredRows.length) {
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
  }, [selection, result, filteredRows]);

  const handleCopyColumn = () => {
    if (
      selection &&
      selection.type === "column" &&
      result
    ) {
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

  const handleClearSelection = () => setSelection(null);

  const handleDownloadCSV = () => {
    if (!result) return;
    const csv = toCSV(result.columns, filteredRows);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "results.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <TableHeader
          columns={result.columns}
          filters={filters}
          setFilters={setFilters}
          sortCol={sortCol}
          sortOrder={sortOrder}
          selectedCol={selectedCol}
          onHeaderClick={handleHeaderClick}
        />
        <TableBody
          rows={filteredRows}
          columnsLength={result.columns.length}
          selection={selection}
          selectedCellsSet={selectedCellsSet}
          selectedCol={selectedCol}
          handleCellMouseDown={handleCellMouseDown}
          handleCellMouseEnter={handleCellMouseEnter}
          handleCopy={handleCopy}
        />
      </table>
      <TableActions
        downloadBtnClass={downloadBtnClass}
        handleCopy={handleCopy}
        handleCopyColumn={handleCopyColumn}
        handleClearSelection={handleClearSelection}
        canCopy={
          (!selection && filteredRows.length !== 0) ||
          (!!selection && selection.type === "cell")
        }
        canCopyColumn={!!(selection && selection.type === "column")}
        selection={selection}
        handleDownloadCSV={handleDownloadCSV}
      />
    </div>
  );
};

export default ResultTable;
