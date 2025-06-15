
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
import { Button } from "@/components/ui/button";
import {
  flattenWorksheetData,
  sortWorksheetRows,
  handleDuplicateFile,
} from "./FolderUtils";

// Table column types
const sortFields = [
  { key: "name", label: "Name" },
  { key: "type", label: "Type" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
  { key: "comment", label: "Comment" },
  { key: "owner", label: "Owner" }
] as const;
type SortField = typeof sortFields[number]["key"];

const WorksheetsTable = ({
  worksheetData,
  setWorksheetData,
  expandedFolders,
  setExpandedFolders,
  search,
  comments,
  setComments,
  draggingFile,
  setDraggingFile,
  setModalState,
}: {
  worksheetData: any[];
  setWorksheetData: (cb: (prev: any[]) => any[]) => void;
  expandedFolders: Record<string, boolean>;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  search: string;
  comments: { [key: string]: string };
  setComments: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  draggingFile: any;
  setDraggingFile: React.Dispatch<React.SetStateAction<any>>;
  setModalState: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const [sort, setSort] = useState<{ field: SortField; direction: "asc" | "desc" }>({
    field: "name",
    direction: "asc",
  });

  // Drag handlers
  const handleDragStart = (evt: React.DragEvent, fileName: string, parentFolder?: string) => {
    setDraggingFile({ fileName, parentFolder });
    evt.dataTransfer.effectAllowed = "move";
    evt.dataTransfer.setData("application/lovable-query-file", JSON.stringify({fileName, parentFolder}));
  };
  const handleDragEnd = () => setDraggingFile(null);

  // Handle drop on folder
  const handleFolderDrop = (folderName: string, evt: React.DragEvent) => {
    evt.preventDefault();
    let file: { fileName: string, parentFolder?: string };
    try {
      const d = evt.dataTransfer.getData("application/lovable-query-file");
      file = JSON.parse(d);
    } catch {
      setDraggingFile(null);
      return;
    }
    if (!file || !file.fileName) return;
    setWorksheetData(prev => {
      let removed: any = {};
      let updated = prev
        .map(entry => {
          if (entry.type === "folder" && entry.files) {
            if (entry.name === file.parentFolder) {
              const idx = entry.files.findIndex((f: any) => f.name === file.fileName);
              if (idx > -1) {
                removed = entry.files[idx];
                const newFiles = [...entry.files.slice(0, idx), ...entry.files.slice(idx + 1)];
                return { ...entry, files: newFiles };
              }
            }
            return entry;
          } else if (entry.type === "query" && !file.parentFolder && entry.name === file.fileName) {
            removed = entry;
            return null;
          }
          return entry;
        })
        .filter(Boolean);
      // Now, add to target folder
      updated = updated.map(entry => {
        if (entry.type === "folder" && entry.name === folderName && removed.name) {
          if (!entry.files.some((f: any) => f.name === removed.name)) {
            return { ...entry, files: [...entry.files, removed] };
          }
        }
        return entry;
      });
      return updated;
    });
    setDraggingFile(null);
  };

  // Drop into root (drag from folder to root)
  const handleRootDrop = (evt: React.DragEvent) => {
    evt.preventDefault();
    let file: { fileName: string; parentFolder?: string };
    try {
      const d = evt.dataTransfer.getData("application/lovable-query-file");
      file = JSON.parse(d);
    } catch {
      setDraggingFile(null);
      return;
    }
    if (!file || !file.fileName || !file.parentFolder) return;
    setWorksheetData(prev => {
      let removed: any = {};
      let updated = prev.map(entry => {
        if (entry.type === "folder" && entry.name === file.parentFolder) {
          const idx = entry.files.findIndex((f: any) => f.name === file.fileName);
          if (idx > -1) {
            removed = entry.files[idx];
            const newFiles = [...entry.files.slice(0, idx), ...entry.files.slice(idx + 1)];
            return { ...entry, files: newFiles };
          }
        }
        return entry;
      });
      if (removed && removed.name) {
        const firstQueryIdx = updated.findIndex(entry => entry.type === "query");
        if (firstQueryIdx === -1) {
          updated = [...updated, removed];
        } else {
          updated = [
            ...updated.slice(0, firstQueryIdx),
            removed,
            ...updated.slice(firstQueryIdx),
          ];
        }
      }
      return updated.filter(Boolean);
    });
    setDraggingFile(null);
  };

  const handleFolderDragOver = (evt: React.DragEvent) => {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "move";
  };

  // Data/row flattening and sorting
  let rows = flattenWorksheetData(worksheetData, expandedFolders);

  // Enhance: use comments in state (for edits)
  rows = rows.map(row => ({
    ...row,
    comment: comments[row.key] !== undefined ? comments[row.key] : row.comment ?? "",
  }));

  // Filter by search
  if (search.trim()) {
    const s = search.trim().toLowerCase();
    rows = rows.filter(
      row =>
        row.name.toLowerCase().includes(s) ||
        (row.comment && row.comment.toLowerCase().includes(s)) ||
        (row.parentFolder && row.parentFolder.toLowerCase().includes(s))
    );
  }

  // Sort rows
  rows = sortWorksheetRows(rows, sort);

  const toggleFolder = (name: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <div
      onDrop={handleRootDrop}
      onDragOver={e => {
        if (draggingFile && draggingFile.parentFolder) e.preventDefault();
      }}
      className={`
        w-full
        ${draggingFile && draggingFile.parentFolder
          ? "outline outline-blue-400 outline-2 rounded"
          : ""
        }
      `}
      style={{ minHeight: 50 }}
    >
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            {sortFields.map(col => (
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
            <TableHead className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row: any) => (
            <TableRow
              key={row.key}
              className={
                row.type === "folder" && draggingFile
                  ? "outline outline-2 outline-blue-400"
                  : ""
              }
              onDrop={
                row.type === "folder"
                  ? evt => handleFolderDrop(row.name, evt)
                  : undefined
              }
              onDragOver={
                row.type === "folder"
                  ? handleFolderDragOver
                  : undefined
              }
            >
              <TableCell>
                {row.type === "folder" ? (
                  <button
                    className="flex items-center gap-2"
                    onClick={() => toggleFolder(row.name)}
                    title={expandedFolders[row.name] ? "Collapse folder" : "Expand folder"}
                  >
                    <Folder size={16} className="text-black" />
                    <span className="font-semibold">{row.name}</span>
                    <span className="ml-1 text-xs text-gray-400">
                      {expandedFolders[row.name] ? "▾" : "▸"}
                    </span>
                  </button>
                ) : (
                  <div
                    className="flex items-center gap-2 cursor-grab"
                    draggable
                    onDragStart={evt => handleDragStart(evt, row.name, row.parentFolder)}
                    onDragEnd={handleDragEnd}
                    title="Drag to folder"
                  >
                    <File size={16} className="text-blue-400" />
                    <span>{row.name}</span>
                  </div>
                )}
              </TableCell>
              <TableCell>{row.type === "folder" ? "Folder" : "File"}</TableCell>
              <TableCell>{row.createdAt || "-"}</TableCell>
              <TableCell>{row.updatedAt || "-"}</TableCell>
              <TableCell>{row.comment || "-"}</TableCell>
              <TableCell>john.smith</TableCell>
              <TableCell>
                {row.parentFolder ? row.parentFolder : row.type === "folder" ? "" : "-"}
              </TableCell>
              <TableCell className="flex gap-2 justify-end">
                {row.type === "query" && (
                  <>
                    <button
                      className="text-gray-400 hover:text-blue-500"
                      onClick={() => handleDuplicateFile(row.parentFolder, row.name, setWorksheetData)}
                      title="Duplicate"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      className="text-gray-400 hover:text-red-600"
                      onClick={() =>
                        setModalState({ open: true, fileName: row.name, parentFolder: row.parentFolder })
                      }
                      title="Delete"
                    >
                      <Trash size={16} />
                    </button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WorksheetsTable;
