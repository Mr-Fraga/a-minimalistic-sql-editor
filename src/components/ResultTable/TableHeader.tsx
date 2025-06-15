
import React from "react";
import { ArrowDown, ArrowUp, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SortOrder } from "./utils";

interface Props {
  columns: string[];
  filters: string[];
  setFilters: (f: (fs: string[]) => string[]) => void;
  filterOpen: boolean[];
  setFilterOpen: (f: (prev: boolean[]) => boolean[]) => void;
  sortCol: number | null;
  sortOrder: SortOrder;
  selectedCol: number | null;
  onHeaderClick: (idx: number) => void;
}

export const TableHeader: React.FC<Props> = ({
  columns,
  filters,
  setFilters,
  filterOpen,
  setFilterOpen,
  sortCol,
  sortOrder,
  selectedCol,
  onHeaderClick,
}) => (
  <thead>
    {/* Header Row (with embedded filter icon) */}
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
            <button
              type="button"
              className="ml-1 text-gray-400/80 hover:text-blue-600 focus:outline-none"
              onClick={e => {
                e.stopPropagation();
                setFilterOpen((prev) =>
                  prev.map((v, i) => (i === idx ? !v : false))
                );
              }}
              tabIndex={-1}
              title="Filter"
            >
              <Filter size={16} />
            </button>
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
          {/* --- Filter input for this column only (popover style under header) --- */}
          {filterOpen[idx] && (
            <div
              className="absolute left-0 z-10 bg-white border border-gray-200 shadow rounded font-din mt-1 min-w-[95px] p-1"
              style={{
                top: "100%",
                fontFamily: '"DIN Next","DIN Next LT Pro","DINNextLTPro-Regular","DINNextLTPro","DIN",sans-serif',
              }}
            >
              <Input
                autoFocus
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
                className="h-7 py-0 px-2 text-xs border-gray-200 bg-gray-50 mb-0 rounded font-din"
                style={{
                  minWidth: 60,
                  fontFamily: '"DIN Next","DIN Next LT Pro","DINNextLTPro-Regular","DINNextLTPro","DIN",sans-serif',
                  fontSize: "0.88rem",
                }}
                onKeyDown={e => {
                  if (e.key === "Escape")
                    setFilterOpen(prev =>
                      prev.map((v, i) => (i === idx ? false : v))
                    );
                  e.stopPropagation();
                }}
              />
              <button
                type="button"
                className="w-full text-[11px] font-din font-normal text-gray-400 hover:text-blue-700 mt-1"
                style={{
                  padding: "2px 0",
                  fontFamily: '"DIN Next","DIN Next LT Pro","DINNextLTPro-Regular","DINNextLTPro","DIN",sans-serif',
                }}
                onClick={() =>
                  setFilterOpen(prev =>
                    prev.map((v, i) => (i === idx ? false : v))
                  )
                }
              >
                Close
              </button>
            </div>
          )}
        </th>
      ))}
    </tr>
  </thead>
);

