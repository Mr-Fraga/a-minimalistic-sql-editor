
/**
 * Utility functions for ResultTable.
 */
export type SortOrder = null | "asc" | "desc";
export type Selection =
  | { type: "cell"; cells: [number, number][] }
  | { type: "column"; col: number }
  | null;

export function toCSV(columns: string[], rows: Array<any[]>): string {
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

export function sortRows(rows: Array<any[]>, colIndex: number, order: SortOrder): Array<any[]> {
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

export function filterRows(rows: Array<any[]>, filters: string[]): Array<any[]> {
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
