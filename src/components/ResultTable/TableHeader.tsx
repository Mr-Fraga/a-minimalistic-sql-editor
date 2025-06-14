
import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SortOrder, Selection } from "./utils";

interface Props {
  columns: string[];
  filters: string[];
  setFilters: (f: (fs: string[]) => string[]) => void;
  sortCol: number | null;
  sortOrder: SortOrder;
  selectedCol: number | null;
  onHeaderClick: (idx: number) => void;
}

export const TableHeader: React.FC<Props> = ({
  columns,
  filters,
  setFilters,
  sortCol,
  sortOrder,
  selectedCol,
  onHeaderClick,
}) => (
  <thead>
    {/* Filtering Row */}
    <tr className="border-b border-gray-100 bg-white">
      {columns.map((col, idx) => (
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
      {columns.map((col, idx) => (
        <th
          key={col}
          className={
            "px-3 py-2 text-left font-bold cursor-pointer select-none relative group" +
            (selectedCol === idx ? " bg-blue-100 text-blue-900" : "")
          }
          onClick={() => onHeaderClick(idx)}
          style={{ userSelect: "none" }}
        >
          <span className="flex items-center gap-1">
            {col}
            <span className="ml-1 text-gray-500 opacity-70 group-hover:opacity-100 transition-opacity">
              {sortCol === idx && sortOrder === "asc" && (
                <ArrowUp className="inline-block w-3 h-3" />
              )}
              {sortCol === idx && sortOrder === "desc" && (
                <ArrowDown className="inline-block w-3 h-3" />
              )}
              {sortCol !== idx && <span className="w-3 h-3"></span>}
            </span>
          </span>
        </th>
      ))}
    </tr>
  </thead>
);
