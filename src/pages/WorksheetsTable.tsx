import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import WorksheetTableRow from "./WorksheetTableRow";
import { useWorksheetsTableLogic } from "./useWorksheetsTableLogic";

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
  const logic = useWorksheetsTableLogic({
    worksheetData,
    setWorksheetData,
    expandedFolders,
    setExpandedFolders,
    comments,
    setComments,
    draggingFile,
    setDraggingFile,
    setModalState,
    search,
  });

  return (
    <div
      onDrop={logic.handleRootDrop}
      onDragOver={e => {
        if (
          logic.draggingFile &&
          Array.isArray(logic.draggingFile) &&
          logic.draggingFile[0]?.parentFolder
        )
          e.preventDefault();
      }}
      className={`
        w-full
        ${logic.draggingFile &&
        Array.isArray(logic.draggingFile) &&
        logic.draggingFile[0]?.parentFolder
          ? "outline outline-blue-400 outline-2 rounded"
          : ""
        }
      `}
      style={{ minHeight: 50 }}
    >
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            {logic.sortFields.map(col => (
              <TableHead
                key={col.key}
                className="cursor-pointer select-none"
                onClick={() =>
                  logic.setSort((prev) => ({
                    field: col.key,
                    direction:
                      prev.field === col.key && prev.direction === "asc"
                        ? "desc"
                        : "asc",
                  }))
                }
              >
                {col.label}
                {logic.sort.field === col.key && (
                  <span className="ml-1">{logic.sort.direction === "asc" ? "▲" : "▼"}</span>
                )}
              </TableHead>
            ))}
            <TableHead className="w-1/5">Folder</TableHead>
            <TableHead className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {logic.rows.map((row: any) => (
            <WorksheetTableRow
              key={row.key}
              row={row}
              expandedFolders={expandedFolders}
              toggleFolder={logic.toggleFolder}
              draggingFile={logic.draggingFile}
              isSelected={logic.isSelected}
              handleDragStart={logic.handleDragStart}
              handleDragEnd={logic.handleDragEnd}
              handleFolderDrop={logic.handleFolderDrop}
              handleFolderDragOver={logic.handleFolderDragOver}
              handleRowClick={logic.handleRowClick}
              handleDuplicateFile={logic.handleDuplicateFile}
              setModalState={logic.setModalState}
              worksheetData={worksheetData}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WorksheetsTable;
