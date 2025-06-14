
import React, { useState, useMemo } from "react";
import { ArrowDown, ArrowUp, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

// helpers to sort and filter
function sortRows(rows: Array<any[]>, colIndex: number, order: SortOrder): Array<any[]> {
  if (!order) return rows;
  return [...rows].sort((a, b) => {
    const x = a[colIndex];
    const y = b[colIndex];
    // Try to sort as number, fallback to string (case-insensitive)
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

const ResultTable: React.FC<ResultTableProps> = ({ result, error }) => {
  // One filter input per column
  const [filters, setFilters] = useState<string[]>([]);
  // Sorting: which column, and asc/desc/null
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // Reset sort/filter if new result
  React.useEffect(() => {
    setFilters(result ? Array(result.columns.length).fill("") : []);
    setSortCol(null);
    setSortOrder(null);
  }, [result]);

  const handleDownload = () => {
    if (!result) return;
    const csv = toCSV(result.columns, result.rows);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "results.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
  };

  // memoize filtered/sorted rows
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
    <div className="w-full overflow-x-auto border border-gray-200 rounded bg-white mt-2">
      <div className="flex justify-end px-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs font-mono"
          onClick={handleDownload}
        >
          Download CSV
        </Button>
      </div>
      <table className="min-w-full text-xs font-mono text-black">
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
          {/* Header Row (sorting) */}
          <tr className="border-b border-gray-200 bg-gray-50">
            {result.columns.map((col, idx) => (
              <th
                key={col}
                className="px-3 py-2 text-left font-bold cursor-pointer select-none relative group"
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
            filteredRows.map((row, idx) => (
              <tr key={idx} className={idx % 2 ? "bg-gray-50" : undefined}>
                {row.map((cell, i) => (
                  <td key={i} className="px-3 py-2">{cell}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;
