import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Folder, File, Trash, Copy, Plus } from "lucide-react";
import DeleteFileModal from "@/components/DeleteFileModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // using shadcn UI button
import { useWorksheets } from "@/contexts/WorksheetsContext";

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
  // Use global worksheet data
  const { worksheetData, setWorksheetData } = useWorksheets();

  // Sorting state
  const [sort, setSort] = useState<{ field: SortField; direction: "asc" | "desc" }>({
    field: "name",
    direction: "asc",
  });
  // Track which folders are expanded
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  // For delete modal
  const [modalState, setModalState] = useState<{
    open: boolean;
    fileName: string | null;
    parentFolder: string | undefined;
  }>({ open: false, fileName: null, parentFolder: undefined });

  // SEARCH state
  const [search, setSearch] = useState<string>("");

  // COMMENTS state: a map of key -> comment (so edits stay persistent in UI)
  const [comments, setComments] = useState<{[key: string]: string}>({});

  // DRAG & DROP State
  const [draggingFile, setDraggingFile] = useState<{
    fileName: string;
    parentFolder?: string;
  } | null>(null);

  // FOLDER CREATE State
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const data = worksheetData;

  // DRAG & DROP Handlers
  const handleDragStart = (evt: React.DragEvent, fileName: string, parentFolder?: string) => {
    setDraggingFile({ fileName, parentFolder });
    evt.dataTransfer.effectAllowed = "move";
    evt.dataTransfer.setData("application/lovable-query-file", JSON.stringify({fileName, parentFolder}));
  };

  const handleDragEnd = () => {
    setDraggingFile(null);
  };

  // Accept drop only on folders!
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
    // Prevent self-drop or folder->folder
    if (!file || !file.fileName) return;

    setWorksheetData(prev => {
      // Remove from root or previous folder
      let removed: any = {};
      let updated = prev
        .map(entry => {
          if (entry.type === "folder" && entry.files) {
            // Remove from source folder (if moving from one to another)
            if (entry.name === file.parentFolder) {
              const idx = entry.files.findIndex((f: any) => f.name === file.fileName);
              if (idx > -1) {
                removed = entry.files[idx];
                const newFiles = [...entry.files.slice(0, idx), ...entry.files.slice(idx + 1)];
                return { ...entry, files: newFiles };
              }
            }
            // Just leave all others alone
            return entry;
          } else if (entry.type === "query" && !file.parentFolder && entry.name === file.fileName) {
            // Remove from root
            removed = entry;
            return null;
          }
          return entry;
        })
        .filter(Boolean);
      // Now, add to target folder
      updated = updated.map(entry => {
        if (entry.type === "folder" && entry.name === folderName && removed.name) {
          // Prevent duplicate names
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

  // Allow drag over folder
  const handleFolderDragOver = (evt: React.DragEvent) => {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "move";
  };

  // Allow creating a new folder
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const exists = worksheetData.some(
      entry => entry.type === "folder" && entry.name === newFolderName.trim()
    );
    if (exists) return; // don't allow duplicate
    const now = new Date().toISOString().split("T")[0];
    setWorksheetData(prev => [
      ...prev,
      {
        type: "folder",
        name: newFolderName.trim(),
        createdAt: now,
        updatedAt: now,
        comment: "",
        files: [],
      }
    ]);
    setNewFolderName("");
    setCreatingFolder(false);
  };

  const handleDuplicateFile = (
    parentFolder: string | undefined,
    fileName: string
  ) => {
    setWorksheetData((prev) => {
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
          return { ...item, files: newFiles };
        });
      }
    });
  };

  // To handle file deletion
  const handleDeleteFile = (parentFolder: string | undefined, fileName: string) => {
    setWorksheetData(prev => {
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

  // Render
  return (
    <div className="flex-1 w-full h-full bg-white p-0 px-10 md:px-20">
      <div className="w-full pt-12">
        {/* Header row: title on left, search on right, and New Folder button */}
        <div className="flex justify-between items-center mb-4 gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold mb-0">Your queries</h1>
            <Button
              size="sm"
              variant="outline"
              className="ml-2"
              onClick={() => setCreatingFolder(true)}
            >
              <Plus size={16} />
              New Folder
            </Button>
          </div>
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

        {/* New Folder Modal/Inline Input */}
        {creatingFolder && (
          <div className="mb-4 flex gap-2 items-center">
            <Input
              autoFocus
              placeholder="Enter folder name"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              className="w-64"
            />
            <Button
              size="sm"
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
            >
              Create
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setCreatingFolder(false); setNewFolderName(""); }}
            >
              Cancel
            </Button>
          </div>
        )}

        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() =>
                  setSort((prev) => ({
                    field: "name",
                    direction:
                      prev.field === "name" && prev.direction === "asc"
                        ? "desc"
                        : "asc",
                  }))
                }
              >
                Name
                {sort.field === "name" && (
                  <span className="ml-1">{sort.direction === "asc" ? "▲" : "▼"}</span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() =>
                  setSort((prev) => ({
                    field: "type",
                    direction:
                      prev.field === "type" && prev.direction === "asc"
                        ? "desc"
                        : "asc",
                  }))
                }
              >
                Type
                {sort.field === "type" && (
                  <span className="ml-1">{sort.direction === "asc" ? "▲" : "▼"}</span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() =>
                  setSort((prev) => ({
                    field: "createdAt",
                    direction:
                      prev.field === "createdAt" && prev.direction === "asc"
                        ? "desc"
                        : "asc",
                  }))
                }
              >
                Created At
                {sort.field === "createdAt" && (
                  <span className="ml-1">{sort.direction === "asc" ? "▲" : "▼"}</span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() =>
                  setSort((prev) => ({
                    field: "updatedAt",
                    direction:
                      prev.field === "updatedAt" && prev.direction === "asc"
                        ? "desc"
                        : "asc",
                  }))
                }
              >
                Updated At
                {sort.field === "updatedAt" && (
                  <span className="ml-1">{sort.direction === "asc" ? "▲" : "▼"}</span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() =>
                  setSort((prev) => ({
                    field: "comment",
                    direction:
                      prev.field === "comment" && prev.direction === "asc"
                        ? "desc"
                        : "asc",
                  }))
                }
              >
                Comment
                {sort.field === "comment" && (
                  <span className="ml-1">{sort.direction === "asc" ? "▲" : "▼"}</span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() =>
                  setSort((prev) => ({
                    field: "owner",
                    direction:
                      prev.field === "owner" && prev.direction === "asc"
                        ? "desc"
                        : "asc",
                  }))
                }
              >
                Owner
                {sort.field === "owner" && (
                  <span className="ml-1">{sort.direction === "asc" ? "▲" : "▼"}</span>
                )}
              </TableHead>
              <TableHead className="w-1/5">Folder</TableHead>
              <TableHead className="text-right"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.key}
                // Add highlighted border if folder is the drop target
                className={
                  row.type === "folder" && draggingFile
                    ? "outline outline-2 outline-blue-400"
                    : ""
                }
                // Drag-n-drop drop events for folders only
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
                  {/* Only for query file rows */}
                  {row.type === "query" && (
                    <>
                      <button
                        className="text-gray-400 hover:text-blue-500"
                        onClick={() => handleDuplicateFile(row.parentFolder, row.name)}
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
