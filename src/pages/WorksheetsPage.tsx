
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

// Mock folders/files data with dates
const worksheetData = [
  {
    type: "folder",
    name: "Finance Reports",
    createdAt: "2024-01-10",
    updatedAt: "2024-06-11",
    files: [
      {
        type: "file",
        name: "Q1_2024_Balance.xlsx",
        createdAt: "2024-02-01",
        updatedAt: "2024-03-20",
      },
      {
        type: "file",
        name: "Expenses_April.csv",
        createdAt: "2024-04-02",
        updatedAt: "2024-04-30",
      },
    ],
  },
  {
    type: "folder",
    name: "HR",
    createdAt: "2024-02-01",
    updatedAt: "2024-05-21",
    files: [
      {
        type: "file",
        name: "Employee_List_2025.xlsx",
        createdAt: "2024-05-10",
        updatedAt: "2024-05-28",
      },
    ],
  },
  {
    type: "file",
    name: "Roadmap_2025.xlsx",
    createdAt: "2024-03-15",
    updatedAt: "2024-06-13",
  },
];

// Flatten the data for easier table mapping
function flattenData(
  data: typeof worksheetData,
  expandedFolders: Record<string, boolean>
) {
  const rows: Array<{
    key: string;
    type: string;
    name: string;
    parentFolder?: string;
    createdAt: string;
    updatedAt: string;
  }> = [];
  for (const item of data) {
    if (item.type === "folder") {
      rows.push({
        key: item.name,
        type: item.type,
        name: item.name,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
      if (expandedFolders[item.name]) {
        for (const file of item.files) {
          rows.push({
            key: `${item.name}/${file.name}`,
            type: file.type,
            name: file.name,
            parentFolder: item.name,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
          });
        }
      }
    } else {
      rows.push({
        key: item.name,
        type: item.type,
        name: item.name,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
    }
  }
  return rows;
}

// Table column types
const sortFields = [
  { key: "name", label: "Name" },
  { key: "type", label: "Type" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
] as const;

type SortField = typeof sortFields[number]["key"];

const WorksheetsPage: React.FC = () => {
  // Sorting state: { field, direction }
  const [sort, setSort] = useState<{ field: SortField; direction: "asc" | "desc" }>({
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
      // Sort folders and files alphabetically
      return a.name.localeCompare(b.name) * multiplier;
    } else if (sort.field === "type") {
      if (a.type !== b.type) return (a.type === "folder" ? -1 : 1) * multiplier;
      return a.name.localeCompare(b.name) * multiplier;
    } else if (sort.field === "createdAt" || sort.field === "updatedAt") {
      // For date sorting; empty folders go up or down based on direction
      const aVal = a[sort.field] || "";
      const bVal = b[sort.field] || "";
      if (!aVal) return 1;
      if (!bVal) return -1;
      return (aVal.localeCompare(bVal)) * multiplier;
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
    <div className="flex-1 w-full h-full bg-white p-0">
      <div className="w-full max-w-6xl mx-auto pt-12">
        <h1 className="text-2xl font-bold mb-6 ml-0">Worksheets</h1>
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              {sortFields.map((col) => (
                <TableHead
                  key={col.key}
                  className="cursor-pointer select-none"
                  onClick={() =>
                    setSort((prev) => ({
                      field: col.key,
                      direction:
                        prev.field === col.key && prev.direction === "asc"
                          ? "desc"
                          : "asc",
                    }))
                  }
                >
                  {col.label}
                  {sort.field === col.key && (
                    <span className="ml-1">{sort.direction === "asc" ? "▲" : "▼"}</span>
                  )}
                </TableHead>
              ))}
              <TableHead className="w-1/5">Folder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.key}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  if (row.type === "folder") toggleFolder(row.name);
                }}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {row.type === "folder" ? (
                      <Folder
                        className="text-yellow-600"
                        size={18}
                        strokeWidth={2}
                      />
                    ) : (
                      <File className="text-gray-500" size={18} strokeWidth={2} />
                    )}
                    <span
                      className={
                        row.type === "folder"
                          ? "font-semibold"
                          : row.parentFolder
                          ? "ml-5"
                          : ""
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
                  {row.createdAt || "-"}
                </TableCell>
                <TableCell>
                  {row.updatedAt || "-"}
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
