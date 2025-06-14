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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Updated worksheet mock data with comment fields
const worksheetData = [
  {
    type: "folder",
    name: "Finance",
    createdAt: "2024-01-03",
    updatedAt: "2024-06-10",
    comment: "Quarterly finance queries",
    files: [
      {
        type: "query",
        name: "income_statement_2024.sql",
        createdAt: "2024-01-12",
        updatedAt: "2024-02-22",
        comment: "Latest income statement script",
      },
      {
        type: "query",
        name: "accounts_payable_audit.sql",
        createdAt: "2024-03-01",
        updatedAt: "2024-05-08",
        comment: "Audit for payables",
      },
      {
        type: "query",
        name: "cash_flow_monthly.sql",
        createdAt: "2024-03-11",
        updatedAt: "2024-06-01",
        comment: "Monthly cash flow",
      },
    ],
  },
  {
    type: "folder",
    name: "HR",
    createdAt: "2024-02-15",
    updatedAt: "2024-05-16",
    comment: "HR queries",
    files: [
      {
        type: "query",
        name: "employee_hires.sql",
        createdAt: "2024-04-15",
        updatedAt: "2024-05-15",
        comment: "Employee hiring report",
      },
    ],
  },
  {
    type: "query",
    name: "project_status_update.sql",
    createdAt: "2024-04-14",
    updatedAt: "2024-06-13",
    comment: "Status report for all projects",
  },
];

const initialWorksheetData = worksheetData;

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
    comment?: string;
  }> = [];
  for (const item of data) {
    if (item.type === "folder") {
      rows.push({
        key: item.name,
        type: item.type,
        name: item.name,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        comment: item.comment,
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
            comment: file.comment,
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
        comment: item.comment,
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
  { key: "comment", label: "Comment" },
  { key: "owner", label: "Owner" }
] as const;

type SortField = typeof sortFields[number]["key"];

const WorksheetsPage: React.FC = () => {
  // Sorting state
  const [sort, setSort] = useState<{ field: SortField; direction: "asc" | "desc" }>({
    field: "name",
    direction: "asc",
  });
  // Track which folders are expanded
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  // Worksheet data can now be mutated
  const [data, setData] = useState(initialWorksheetData);
  // For delete modal
  const [modalState, setModalState] = useState<{
    open: boolean;
    fileName: string | null;
    parentFolder: string | undefined;
  }>({ open: false, fileName: null, parentFolder: undefined });

  // SEARCH state
  const [search, setSearch] = useState<string>("");

  // COMMENT MODAL state
  const [commentModal, setCommentModal] = useState<{
    open: boolean;
    rowKey: string | null;
    currentComment: string;
  }>({ open: false, rowKey: null, currentComment: "" });

  // COMMENTS state: a map of key -> comment (so edits stay persistent in UI)
  const [comments, setComments] = useState<{[key: string]: string}>({});

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
      if (!parentFolder) {
        return prev.filter(item => !(item.type === "query" && item.name === fileName));
      }
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

  // Enhance: replace comment column values with state value for possible edits
  rows = rows.map(row => ({
    ...row,
    comment: comments[row.key] !== undefined ? comments[row.key] : row.comment ?? "",
  }));

  // Filter by search (match on name, comment, or parentFolder)
  if (search.trim()) {
    const s = search.trim().toLowerCase();
    rows = rows.filter(
      row =>
        row.name.toLowerCase().includes(s) ||
        (row.comment && row.comment.toLowerCase().includes(s)) ||
        (row.parentFolder && row.parentFolder.toLowerCase().includes(s))
    );
  }

  // Sorting the flattened data
  rows = [...rows].sort((a, b) => {
    const multiplier = sort.direction === "asc" ? 1 : -1;
    if (sort.field === "name") {
      if (a.type === "folder" && b.parentFolder === a.name) return -1;
      if (b.type === "folder" && a.parentFolder === b.name) return 1;
      return a.name.localeCompare(b.name) * multiplier;
    } else if (sort.field === "type") {
      if (a.type !== b.type) return (a.type === "folder" ? -1 : 1) * multiplier;
      return a.name.localeCompare(b.name) * multiplier;
    } else if (sort.field === "createdAt" || sort.field === "updatedAt") {
      const aVal = a[sort.field] || "";
      const bVal = b[sort.field] || "";
      if (!aVal) return 1;
      if (!bVal) return -1;
      return (aVal.localeCompare(bVal)) * multiplier;
    } else if (sort.field === "comment") {
      const aVal = a.comment || "";
      const bVal = b.comment || "";
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

  // Handle double-click to edit comment
  const handleRowDoubleClick = (row: typeof rows[number]) => {
    setCommentModal({
      open: true,
      rowKey: row.key,
      currentComment: row.comment || "",
    });
  };

  const handleCommentChange = (val: string) => {
    setCommentModal(cm => ({ ...cm, currentComment: val }));
  };

  const handleSaveComment = () => {
    if (commentModal.rowKey) {
      setComments(prev => ({
        ...prev,
        [commentModal.rowKey!]: commentModal.currentComment,
      }));
    }
    setCommentModal({ open: false, rowKey: null, currentComment: "" });
  };

  // Render
  return (
    <div className="flex-1 w-full h-full bg-white p-0 px-10 md:px-20">
      <div className="w-full pt-12">
        {/* Header row: title on left, search on right */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold mb-0">Your queries</h1>
          <div className="w-full max-w-xs flex justify-end">
            <Input
              type="text"
              placeholder="Search by name or comment..."
              className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 outline-none text-base bg-gray-50"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 420 }}
            />
          </div>
        </div>
        <TooltipProvider>
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              {[
                { key: "name", label: "Name" },
                { key: "type", label: "Type" },
                { key: "createdAt", label: "Created At" },
                { key: "updatedAt", label: "Updated At" },
                { key: "comment", label: "Comment" },
                { key: "owner", label: "Owner" },
              ].map((col) => (
                <TableHead
                  key={col.key}
                  className="cursor-pointer select-none"
                  onClick={() =>
                    setSort((prev) => ({
                      field: col.key as SortField,
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
              
                
                  
                    
                      {row.type === "folder" ? (
                        
                      ) : (
                        
                      )}
                      
                        {row.name}
                      
                    
                  
                
                  {row.type === "folder" ? "Folder" : "File"}
                
                  {row.createdAt || "-"}
                
                  {row.updatedAt || "-"}
                
                  {row.comment || "-"}
                
                  {/* Owner column (always "john.smith") */}
                  john.smith
                
                  {row.parentFolder ? row.parentFolder : row.type === "folder" ? "" : "-"}
                
                  {row.type === "query" && (
                    
                      {/* Duplicate icon */}
                      
                        
                          
                            handleDuplicateFile(row.parentFolder, row.name);
                          }}
                        >
                          
                        
                      
                      {/* Trash icon */}
                      
                        
                          
                            setModalState({ open: true, fileName: row.name, parentFolder: row.parentFolder });
                          }}
                        >
                          
                        
                      
                    
                  )}
                
              
            ))}
          </TableBody>
        </Table>
        </TooltipProvider>
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
      
    
  );
};

export default WorksheetsPage;
