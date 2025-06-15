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

  const [selectedFiles, setSelectedFiles] = useState<Array<{ fileName: string, parentFolder?: string }>>([]);

  // Drag handlers (multi-file support)
  const handleDragStart = (
    evt: React.DragEvent, 
    fileName: string, 
    parentFolder?: string
  ) => {
    // If file is one of multi-selected, drag all multi-selected
    let dragging;
    const thisFileKey = parentFolder ? `${parentFolder}/${fileName}` : fileName;
    const selectedKeys = selectedFiles.map(
      f => f.parentFolder ? `${f.parentFolder}/${f.fileName}` : f.fileName
    );

    if (selectedKeys.includes(thisFileKey) && selectedFiles.length > 1) {
      dragging = selectedFiles;
    } else {
      dragging = [{ fileName, parentFolder }];
      setSelectedFiles([{ fileName, parentFolder }]);
    }
    setDraggingFile(dragging);
    evt.dataTransfer.effectAllowed = "move";
    evt.dataTransfer.setData(
      "application/lovable-query-files", 
      JSON.stringify(dragging)
    );
  };

  const handleDragEnd = () => setDraggingFile(null);

  // Drop one or multiple files into folder
  const handleFolderDrop = (folderName: string, evt: React.DragEvent) => {
    evt.preventDefault();
    let files: Array<{ fileName: string, parentFolder?: string }>;
    try {
      const d = evt.dataTransfer.getData("application/lovable-query-files");
      files = JSON.parse(d);
    } catch {
      setDraggingFile(null);
      return;
    }
    if (!files || !files.length) return;
    setWorksheetData(prev => {
      // Remove files from sources
      let updated = prev.map(entry => {
        if (entry.type === "folder") {
          let changed = false;
          let newFiles = entry.files;
          files.forEach(file => {
            if (entry.name === file.parentFolder) {
              const idx = newFiles.findIndex((f: any) => f.name === file.fileName);
              if (idx > -1) {
                newFiles = [...newFiles.slice(0, idx), ...newFiles.slice(idx + 1)];
                changed = true;
              }
            }
          });
          if (changed) return { ...entry, files: newFiles };
        } else if (entry.type === "query") {
          if (!files.some(f => !f.parentFolder && f.fileName === entry.name)) return entry; // keep
          return null; // remove from root
        }
        return entry;
      }).filter(Boolean);

      // Find removed objects (regardless of source)
      const removed: any[] = [];
      prev.forEach(entry => {
        files.forEach(file => {
          if (entry.type === "folder" && entry.name === file.parentFolder) {
            const obj = entry.files.find((f: any) => f.name === file.fileName);
            if (obj) removed.push(obj);
          } else if (entry.type === "query" && !file.parentFolder && entry.name === file.fileName) {
            removed.push(entry);
          }
        });
      });

      // Append to target folder
      updated = updated.map(entry => {
        if (entry.type === "folder" && entry.name === folderName) {
          let filesToAdd = removed.filter(r =>
            !entry.files.some((f: any) => f.name === r.name)
          );
          return { ...entry, files: [...entry.files, ...filesToAdd] };
        }
        return entry;
      });
      return updated;
    });
    setDraggingFile(null);
    setSelectedFiles([]);
  };

  // Drop into root (from folders to root)
  const handleRootDrop = (evt: React.DragEvent) => {
    evt.preventDefault();
    let files: Array<{ fileName: string; parentFolder?: string }>;
    try {
      const d = evt.dataTransfer.getData("application/lovable-query-files");
      files = JSON.parse(d);
    } catch {
      setDraggingFile(null);
      return;
    }
    if (!files?.length || !files.every(f => !!f.parentFolder)) return;
    setWorksheetData(prev => {
      let updated = prev.map(entry => {
        if (entry.type === "folder") {
          let changed = false;
          let newFiles = entry.files;
          files.forEach(file => {
            if (entry.name === file.parentFolder) {
              const idx = newFiles.findIndex((f: any) => f.name === file.fileName);
              if (idx > -1) {
                newFiles = [...newFiles.slice(0, idx), ...newFiles.slice(idx + 1)];
                changed = true;
              }
            }
          });
          if (changed) return { ...entry, files: newFiles };
        }
        return entry;
      });
      // Find removed from folders
      let removedItems: any[] = [];
      prev.forEach(entry => {
        files.forEach(file => {
          if (entry.type === "folder" && entry.name === file.parentFolder) {
            const obj = entry.files.find((f: any) => f.name === file.fileName);
            if (obj) removedItems.push(obj);
          }
        });
      });
      if (removedItems.length > 0) {
        const firstQueryIdx = updated.findIndex(entry => entry.type === "query");
        if (firstQueryIdx === -1) {
          updated = [...updated, ...removedItems];
        } else {
          updated = [
            ...updated.slice(0, firstQueryIdx),
            ...removedItems,
            ...updated.slice(firstQueryIdx),
          ];
        }
      }
      return updated.filter(Boolean);
    });
    setDraggingFile(null);
    setSelectedFiles([]);
  };

  const handleFolderDragOver = (evt: React.DragEvent) => {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "move";
  };

  // Multi-selection handler
  const handleRowClick = (evt: React.MouseEvent, row: any) => {
    if (row.type !== "query") return;
    // File key = full path (folder/name)
    const fileObj = { fileName: row.name, parentFolder: row.parentFolder };
    if (evt.ctrlKey || evt.metaKey) {
      // Multi-select add/remove
      setSelectedFiles(prev => {
        const present = prev.some(
          f => f.fileName === fileObj.fileName && f.parentFolder === fileObj.parentFolder
        );
        if (present) {
          // Remove from selection
          return prev.filter(
            f => !(f.fileName === fileObj.fileName && f.parentFolder === fileObj.parentFolder)
          );
        }
        return [...prev, fileObj];
      });
    } else {
      setSelectedFiles([fileObj]);
    }
  };

  const isSelected = (row: any) => {
    if (row.type !== "query") return false;
    return selectedFiles.some(
      f =>
        f.fileName === row.name &&
        (f.parentFolder || "") === (row.parentFolder || "")
    );
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
        if (draggingFile && Array.isArray(draggingFile) && draggingFile[0]?.parentFolder) e.preventDefault();
      }}
      className={`
        w-full
        ${draggingFile && Array.isArray(draggingFile) && draggingFile[0]?.parentFolder
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
                  : isSelected(row)
                  ? "bg-blue-100"
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
              onClick={evt => handleRowClick(evt, row)}
              style={{ cursor: row.type === "query" ? "pointer" : undefined }}
            >
              <TableCell>
                {row.type === "folder" ? (
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center gap-2"
                      onClick={e => {
                        e.stopPropagation();
                        toggleFolder(row.name)
                      }}
                      title={expandedFolders[row.name] ? "Collapse folder" : "Expand folder"}
                    >
                      <Folder size={16} className="text-black" />
                      <span className="font-semibold">{row.name}</span>
                      <span className="ml-1 text-xs text-gray-400">
                        {expandedFolders[row.name] ? "▾" : "▸"}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div
                    className={`flex items-center gap-2 cursor-grab ${
                      isSelected(row) ? "bg-blue-100" : ""
                    }`}
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
              {/* Actions column, last cell */}
              <TableCell className="flex gap-2 justify-end">
                {row.type === "query" && (
                  <>
                    <button
                      className="text-gray-400 hover:text-blue-500"
                      onClick={e => {
                        e.stopPropagation();
                        handleDuplicateFile(row.parentFolder, row.name, setWorksheetData);
                      }}
                      title="Duplicate"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      className="text-gray-400 hover:text-red-600"
                      onClick={e => {
                        e.stopPropagation();
                        setModalState({ open: true, type: "query", fileName: row.name, parentFolder: row.parentFolder });
                      }}
                      title="Delete"
                    >
                      <Trash size={16} />
                    </button>
                  </>
                )}
                {row.type === "folder" && (
                  <button
                    className="text-gray-400 hover:text-red-600 ml-3"
                    onClick={e => {
                      e.stopPropagation();
                      // Find the folder in worksheetData
                      let folderObj = null;
                      if (Array.isArray(worksheetData)) {
                        folderObj = worksheetData.find(
                          (item: any) => item.type === "folder" && item.name === row.name
                        );
                      }
                      const folderIsEmpty =
                        folderObj && Array.isArray(folderObj.files) && folderObj.files.length === 0;
                      setModalState({
                        open: true,
                        type: "folder",
                        fileName: row.name,
                        parentFolder: undefined,
                        folderIsEmpty,
                      });
                    }}
                    title="Delete Folder"
                  >
                    <Trash size={16} />
                  </button>
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
