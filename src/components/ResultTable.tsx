
import React from "react";

// For demo: static rows based on "select * from users"
const DATA_MOCK = {
  columns: ["id", "name", "email", "created_at"],
  rows: [
    [1, "Alice", "alice@email.com", "2023-01-01"],
    [2, "Bob", "bob@email.com", "2023-02-01"],
    [3, "Cathy", "cathy@email.com", "2023-03-11"],
  ],
};

interface ResultTableProps {
  result?: {
    columns: string[];
    rows: Array<any[]>;
  };
  error?: string | null;
}

const ResultTable: React.FC<ResultTableProps> = ({ result, error }) => {
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
