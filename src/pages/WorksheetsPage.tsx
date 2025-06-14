import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Folder, File, Trash, Copy } from "lucide-react";
import DeleteFileModal from "@/components/DeleteFileModal";

// Updated worksheet mock data with only .sql files and accurate types
const worksheetData = [
  {
    type: "folder",
    name: "Finance",
    createdAt: "2024-01-03",
    updatedAt: "2024-06-10",
    files: [
      {
        type: "query",
        name: "income_statement_2024.sql",
        createdAt: "2024-01-12",
        updatedAt: "2024-02-22",
      },
      {
        type: "query",
        name: "accounts_payable_audit.sql",
        createdAt: "2024-03-01",
        updatedAt: "2024-05-08",
      },
      {
        type: "query",
        name: "cash_flow_monthly.sql",
        createdAt: "2024-03-11",
        updatedAt: "2024-06-01",
      },
    ],
  },
  {
    type: "folder",
    name: "HR",
    createdAt: "2024-02-15",
    updatedAt: "2024-05-16",
    files: [
      {
        type: "query",
        name: "employee_hires.sql",
        createdAt: "2024-04-15",
        updatedAt: "2024-05-15",
      },
    ],
  },
  {
    type: "query",
    name: "project_status_update.sql",
    createdAt: "2024-04-14",
    updatedAt: "2024-06-13",
  },
];

const initialWorksheetData = [
  {
    type: "folder",
    name: "Finance",
    createdAt: "2024-01-03",
    updatedAt: "2024-06-10",
    files: [
      {
        type: "query",
        name: "income_statement_2024.sql",
        createdAt: "2024-01-12",
        updatedAt: "2024-02-22",
      },
      {
        type: "query",
        name: "accounts_payable_audit.sql",
        createdAt: "2024-03-01",
        updatedAt: "2024-05-08",
      },
      {
        type: "query",
        name: "cash_flow_monthly.sql",
        createdAt: "2024-03-11",
        updatedAt: "2024-06-01",
      },
    ],
  },
  {
    type: "folder",
    name: "HR",
    createdAt: "2024-02-15",
    updatedAt: "2024-05-16",
    files: [
      {
        type: "query",
        name: "employee_hires.sql",
        createdAt: "2024-04-15",
        updatedAt: "2024-05-15",
      },
    ],
  },
  {
    type: "query",
    name: "project_status_update.sql",
    createdAt: "2024-04-14",
    updatedAt: "2024-06-13",
  },
];

// Flatten the data for easier table mapping
function flattenData(
  data: typeof initialWorksheetData,
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
  // Worksheet data can now be mutated
  const [data, setData] = useState(initialWorksheetData);
  const [modalState, setModalState] = useState<{
    open: boolean;
    fileName: string | null;
    parentFolder: string | undefined;
  }>({ open: false, fileName: null, parentFolder: undefined });

  // Handler to duplicate a file (either in a folder or root)
  const handleDuplicateFile = (
    parentFolder: string | undefined,
    fileName: string
  ) => {
    setData((prev) => {
      function createCopyName(
        existingNames: string[],
        baseName: string
      ): string {
        // Remove " (copy)" or " (copy N)" suffixes for base
        const copyPattern = /\s?\(copy(?: (\d+))?\)$/i;
        const rawBase =
          baseName.replace(copyPattern, "") || baseName;
        let copyName = `${rawBase} (copy).sql`;
        let i = 1;
        while (existingNames.includes(copyName)) {
          copyName = `${rawBase} (copy ${++i}).sql`;
        }
        return copyName;
      }

      function cloneFileEntry(file: any, name: string) {
        return {
          ...file,
          name,
          updatedAt: new Date().toISOString().split("T")[0],
          createdAt: new Date().toISOString().split("T")[0],
        };
      }

      if (!parentFolder) {
        // root files
        const rootFiles = prev.filter((item) => item.type === "query");
        const fileToCopy = rootFiles.find((f) => f.name === fileName);
        if (!fileToCopy) return prev;
        const allNames = rootFiles.map((f) => f.name);
        const newName = createCopyName(allNames, fileToCopy.name.replace(/\.sql$/, ""));
        const idx = prev.findIndex((item) => item.type === "query" && item.name === fileName);
        const clone = cloneFileEntry(fileToCopy, newName);
        const newArr = [...prev];
        newArr.splice(idx + 1, 0, clone);
        return newArr;
      } else {
        // file is within a folder
        return prev.map((item) => {
          if (item.type !== "folder" || item.name !== parentFolder) return item;
          const fileToCopy = item.files.find((f: any) => f.name === fileName);
          if (!fileToCopy) return item;
          const existingNames = item.files.map((f: any) => f.name);
          const newName = createCopyName(existingNames, fileToCopy.name.replace(/\.sql$/, ""));
          const clone = cloneFileEntry(fileToCopy, newName);
          const fileIdx = item.files.findIndex((f: any) => f.name === fileName);
          const newFiles = [...item.files];
          newFiles.splice(fileIdx + 1, 0, clone);
          return {
            ...item,
            files: newFiles,
          };
        });
      }
    });
  };

  // To handle file deletion
  const handleDeleteFile = (parentFolder: string | undefined, fileName: string) => {
    setData(prev => {
      // If it's a root file (no parent folder)
      if (!parentFolder) {
        return prev.filter(item => !(item.type === "query" && item.name === fileName));
      }
      // For files inside folders
      return prev.map(item => {
        if (item.type !== "folder" || item.name !== parentFolder) return item;
        return {
          ...item,
          files: item.files.filter((f: any) => f.name !== fileName),
        };
      });
    });
    setModalState({ open: false, fileName: null, parentFolder: undefined });
  };

  // Flatten for current data
  let rows = flattenData(data, expandedFolders);

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
        <h1 className="text-2xl font-bold mb-6 ml-0">Your queries</h1>
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
              <TableHead className="text-right"> </TableHead>
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
                        className="text-black"
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
                <TableCell className="text-right">
                  {row.type === "query" && (
                    <div className="flex items-center justify-end gap-2">
                      {/* Duplicate icon */}
                      <button
                        className="p-1 rounded hover:bg-blue-50"
                        title="Duplicate file"
                        onClick={e => {
                          e.stopPropagation();
                          handleDuplicateFile(row.parentFolder, row.name);
                        }}
                      >
                        <Copy className="text-blue-500" size={18} strokeWidth={2} />
                      </button>
                      {/* Trash icon */}
                      <button
                        className="p-1 rounded hover:bg-red-50"
                        title="Delete file"
                        onClick={e => {
                          e.stopPropagation();
                          setModalState({ open: true, fileName: row.name, parentFolder: row.parentFolder });
                        }}
                      >
                        <Trash className="text-red-500" size={18} strokeWidth={2} />
                      </button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Delete confirmation modal */}
      <DeleteFileModal
        open={modalState.open}
        onOpenChange={open => setModalState(ms => ({ ...ms, open }))}
        fileName={modalState.fileName}
        onConfirm={() => {
          if (modalState.fileName) {
            handleDeleteFile(modalState.parentFolder, modalState.fileName);
          }
        }}
      />
    </div>
  );
};

export default WorksheetsPage;
