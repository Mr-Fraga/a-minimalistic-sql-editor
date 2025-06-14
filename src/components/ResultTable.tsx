
import React from "react";

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

const ResultTable: React.FC<ResultTableProps> = ({ result, error }) => {
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
        <button
          className="text-xs font-mono bg-gray-900 text-white px-3 py-1 rounded hover:bg-black/80 transition"
          onClick={handleDownload}
        >
          Download CSV
        </button>
      </div>
      <table className="min-w-full text-xs font-mono text-black">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {result.columns.map((col) => (
              <th key={col} className="px-3 py-2 text-left font-bold">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.length === 0 ? (
            <tr>
              <td colSpan={result.columns.length} className="text-center py-3 text-gray-400">
                (No data)
              </td>
            </tr>
          ) : (
            result.rows.map((row, idx) => (
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
