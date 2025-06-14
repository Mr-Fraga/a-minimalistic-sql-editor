
import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Folder, File } from "lucide-react";

// Mock folders/files data
const worksheetData = [
  {
    type: "folder",
    name: "Finance Reports",
    files: [
      { type: "file", name: "Q1_2024_Balance.xlsx" },
      { type: "file", name: "Expenses_April.csv" },
    ],
  },
  {
    type: "folder",
    name: "HR",
    files: [
      { type: "file", name: "Employee_List_2025.xlsx" },
    ],
  },
  {
    type: "file",
    name: "Roadmap_2025.xlsx",
  },
];

// Flatten the data for easier table mapping
function flattenData(data: typeof worksheetData, expandedFolders: Record<string, boolean>) {
  const rows: Array<{ key: string; type: string; name: string; parentFolder?: string }> = [];
  for (const item of data) {
    if (item.type === "folder") {
      rows.push({
        key: item.name,
        type: item.type,
        name: item.name,
      });
      if (expandedFolders[item.name]) {
        for (const file of item.files) {
          rows.push({
            key: `${item.name}/${file.name}`,
            type: file.type,
            name: file.name,
            parentFolder: item.name,
          });
        }
      }
    } else {
      rows.push({
        key: item.name,
        type: item.type,
        name: item.name,
      });
    }
  }
  return rows;
}

const WorksheetsPage: React.FC = () => {
  // Sorting state: { field: "name" | "type", direction: "asc" | "desc" }
  const [sort, setSort] = useState<{ field: "name" | "type"; direction: "asc" | "desc" }>({
    field: "name",
    direction: "asc",
  });
  // Track which folders are expanded
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Flatten rows for the current UI
  let rows = flattenData(worksheetData, expandedFolders);

  // Sorting the flattened data
  rows = [...rows].sort((a, b) => {
    const multiplier = sort.direction === "asc" ? 1 : -1;
    if (sort.field === "name") {
      // Always prioritize folders above their children
      if (a.type === "folder" && b.parentFolder === a.name) return -1;
      if (b.type === "folder" && a.parentFolder === b.name) return 1;
      // Sort folders alphabetically, then files;
      return a.name.localeCompare(b.name) * multiplier;
    } else if (sort.field === "type") {
      if (a.type !== b.type) return (a.type === "folder" ? -1 : 1) * multiplier;
      return a.name.localeCompare(b.name) * multiplier;
    }
    return 0;
  });

  const toggleFolder = (name: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Render
  return (
    <div className="flex-1 w-full h-full bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Worksheets</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2 cursor-pointer select-none" onClick={() => {
                setSort((prev) => ({
                  field: "name",
                  direction: prev.field === "name" && prev.direction === "asc" ? "desc" : "asc",
                }));
              }}>
                Name
                {sort.field === "name" && (
                  <span className="ml-1">{sort.direction === "asc" ? "▲" : "▼"}</span>
                )}
              </TableHead>
              <TableHead className="w-1/6 cursor-pointer select-none" onClick={() => {
                setSort((prev) => ({
                  field: "type",
                  direction: prev.field === "type" && prev.direction === "asc" ? "desc" : "asc",
                }));
              }}>
                Type
                {sort.field === "type" && (
                  <span className="ml-1">{sort.direction === "asc" ? "▲" : "▼"}</span>
                )}
              </TableHead>
              <TableHead className="w-1/3">Folder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.key}
                className={"hover:bg-gray-50 transition-colors cursor-pointer"}
                onClick={() => {
                  if (row.type === "folder") toggleFolder(row.name);
                }}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {row.type === "folder" ? (
                      <Folder
                        className={`text-yellow-600`}
                        size={18}
                        strokeWidth={2}
                        // Visual (down arrow for expanded, right for collapsed)
                      />
                    ) : (
                      <File className="text-gray-500" size={18} strokeWidth={2} />
                    )}
                    <span
                      className={
                        row.type === "folder" ? "font-semibold" : row.parentFolder ? "ml-5" : ""
                      }
                    >
                      {row.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {row.type === "folder" ? "Folder" : "File"}
                </TableCell>
                <TableCell>
                  {row.parentFolder ? row.parentFolder : row.type === "folder" ? "" : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default WorksheetsPage;

