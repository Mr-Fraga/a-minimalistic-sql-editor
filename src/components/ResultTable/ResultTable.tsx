import React, { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { TableHeader } from "./TableHeader";
import { TableBody } from "./TableBody";
import { sortRows, filterRows, SortOrder, Selection } from "./utils";
import { Button } from "@/components/ui/button";

interface ResultTableProps {
  result?: {
    columns: string[];
    rows: Array<any[]>;
  };
  error?: string | null;
}

const ResultTable: React.FC<ResultTableProps & { onDownloadCsv?: () => void }> = ({
  result,
  error,
  onDownloadCsv,
}) => {
  const [filters, setFilters] = useState<string[]>([]);
  // Track which filter popover is open per column
  const [filterOpen, setFilterOpen] = useState<boolean[]>([]);
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // Selection state for copying
  const [selection, setSelection] = useState<Selection>(null);
  // For drag-select
  const dragStart = useRef<{ row: number; col: number } | null>(null);

  // Reset sort/filter/selection if new result
  useEffect(() => {
    const colCount = result ? result.columns.length : 0;
    setFilters(result ? Array(colCount).fill("") : []);
    setFilterOpen(result ? Array(colCount).fill(false) : []);
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

  // Copy cell(s), column or whole table - always include column header!
  const handleCopy = () => {
    if (!result) return;
    let textToCopy = "";
    if (selection) {
      if (selection.type === "cell") {
        // Find column/row range
        const rowsSelected = selection.cells.map(([r]) => r);
        const colsSelected = selection.cells.map(([, c]) => c);
        const rowMin = Math.min(...rowsSelected);
        const rowMax = Math.max(...rowsSelected);
        const colMin = Math.min(...colsSelected);
        const colMax = Math.max(...colsSelected);

        // Make grid with selected only
        let header = [];
        for (let c = colMin; c <= colMax; c++) {
          if (
            selection.cells.some(([_r, cc]) => cc === c)
          ) {
            header.push(result.columns[c]);
          }
        }
        let rowsVals: string[] = [];
        for (let r = rowMin; r <= rowMax; r++) {
          let vals: any[] = [];
          for (let c = colMin; c <= colMax; c++) {
            if (
              selection.cells.some(
                ([rr, cc]) => rr === r && cc === c
              )
            ) {
              vals.push(filteredRows[r]?.[c] ?? "");
            }
          }
          if (vals.length) rowsVals.push(vals.join("\t"));
        }
        textToCopy = [header.join("\t"), ...rowsVals].join("\n");
      } else if (selection.type === "column") {
        const colIdx = selection.col;
        textToCopy =
          result.columns[colIdx] +
          "\n" +
          filteredRows.map((row) => row[colIdx]).join("\n");
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

  // DOWNLOAD AS CSV
  function escape(value: any): string {
    if (value == null) return '';
    const v = String(value);
    // If CSV special char, wrap in quotes and escape inner quotes
    if (/["\n,]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
  }

  const handleDownloadCsv = () => {
    if (!result || filteredRows.length === 0) {
      toast({ title: "No data", description: "No results to download." });
      return;
    }
    const header = result.columns.map(escape).join(",");
    const rowsCsv = filteredRows.map(row =>
      row.map(escape).join(",")
    );
    const csv = [header, ...rowsCsv].join("\r\n");
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

  // Don't render the Download as CSV button here anymore

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
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
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
    </div>
  );
};

export default ResultTable;
