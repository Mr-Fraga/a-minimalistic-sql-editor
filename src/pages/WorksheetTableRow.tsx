
import React from "react";
import { Folder, File, Trash, Copy } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Helper to determine if a file row matches selectedFile (handle folders as not selectable)
const isFileSelected = (row: any, selectedFile: any) => {
  if (!selectedFile) return false;
  // Only match files
  if (row.type !== "query") return false;
  if (row.name !== selectedFile.name) return false;
  if (row.parentFolder !== selectedFile.parentFolder) return false;
  return true;
};

const WorksheetTableRow = ({
  row,
  expandedFolders,
  toggleFolder,
  draggingFile,
  isSelected,
  handleDragStart,
  handleDragEnd,
  handleFolderDrop,
  handleFolderDragOver,
  handleRowClick,
  handleDuplicateFile,
  setModalState,
  worksheetData,
  onSelectFile,
  selectedFile,
}) => {
  if (!row) return null;

  const isFolder = row.type === "folder";
  const folderObj = isFolder
    ? worksheetData.find(
        (item: any) => item.type === "folder" && item.name === row.name
      )
    : null;
  const folderIsEmpty =
    folderObj && Array.isArray(folderObj.files) && folderObj.files.length === 0;

  const handleClick = (evt: React.MouseEvent) => {
    handleRowClick(evt, row);
    if (!isFolder && onSelectFile) {
      onSelectFile(row);
    }
  };

  return (
    <TableRow
      key={row.key}
      className={
        isFileSelected(row, selectedFile)
          ? "bg-blue-100"
          : isFolder && draggingFile
          ? "outline outline-2 outline-blue-400"
          : ""
      }
      onDrop={isFolder ? (evt) => handleFolderDrop(row.name, evt) : undefined}
      onDragOver={isFolder ? handleFolderDragOver : undefined}
      onClick={handleClick}
      style={{ cursor: row.type === "query" ? "pointer" : undefined }}
    >
      <TableCell>
        {isFolder ? (
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(row.name);
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
              isFileSelected(row, selectedFile) ? "bg-blue-100" : ""
            }`}
            draggable
            onDragStart={(evt) => handleDragStart(evt, row.name, row.parentFolder)}
            onDragEnd={handleDragEnd}
            title="Drag to folder"
          >
            <File size={16} className="text-blue-400" />
            <span>{row.name}</span>
          </div>
        )}
      </TableCell>
      <TableCell>{isFolder ? "Folder" : "File"}</TableCell>
      <TableCell>{row.createdAt || "-"}</TableCell>
      <TableCell>{row.updatedAt || "-"}</TableCell>
      <TableCell>{row.comment || "-"}</TableCell>
      <TableCell>john.smith</TableCell>
      <TableCell>
        {row.parentFolder ? row.parentFolder : isFolder ? "" : "-"}
      </TableCell>
      <TableCell className="flex gap-2 justify-end">
        {row.type === "query" && (
          <>
            <button
              className="text-gray-400 hover:text-blue-500"
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicateFile(row.parentFolder, row.name);
              }}
              title="Duplicate"
            >
              <Copy size={16} />
            </button>
            <button
              className="text-gray-400 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                setModalState({
                  open: true,
                  type: "query",
                  fileName: row.name,
                  parentFolder: row.parentFolder,
                });
              }}
              title="Delete"
            >
              <Trash size={16} />
            </button>
          </>
        )}
        {isFolder && (
          <button
            className="text-gray-400 hover:text-red-600 ml-3"
            onClick={(e) => {
              e.stopPropagation();
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
  );
};

export default WorksheetTableRow;
