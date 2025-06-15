import { useState } from "react";
import { flattenWorksheetData, sortWorksheetRows, handleDuplicateFile } from "./FolderUtils";

export function useWorksheetsTableLogic(params: {
  worksheetData: any[];
  setWorksheetData: (cb: (prev: any[]) => any[]) => void;
  expandedFolders: Record<string, boolean>;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  comments: { [key: string]: string };
  setComments: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  draggingFile: any;
  setDraggingFile: React.Dispatch<React.SetStateAction<any>>;
  setModalState: React.Dispatch<React.SetStateAction<any>>;
  search: string;
  onSelectFile?: (file: any) => void;
  selectedFile?: any;
}) {
  const {
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
  } = params;

  const sortFields = [
    { key: "name", label: "Name" },
    { key: "type", label: "Type" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
    { key: "comment", label: "Comment" },
    { key: "owner", label: "Owner" },
  ] as const;
  type SortField = typeof sortFields[number]["key"];

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

  const toggleFolder = (name: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Flatten and prepare rows
  let rows = flattenWorksheetData(worksheetData, expandedFolders);
  rows = rows.map(row => ({
    ...row,
    comment: comments[row.key] !== undefined ? comments[row.key] : row.comment ?? "",
  }));
  if (search.trim()) {
    const s = search.trim().toLowerCase();
    rows = rows.filter(
      row =>
        row.name.toLowerCase().includes(s) ||
        (row.comment && row.comment.toLowerCase().includes(s)) ||
        (row.parentFolder && row.parentFolder.toLowerCase().includes(s))
    );
  }
  rows = sortWorksheetRows(rows, sort);

  return {
    sortFields,
    sort,
    setSort,
    selectedFiles,
    setSelectedFiles,
    draggingFile,
    setDraggingFile,
    rows,
    handleDragStart: (
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
    },
    handleDragEnd: () => setDraggingFile(null),
    handleFolderDrop: (folderName: string, evt: React.DragEvent) => {
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
    },
    handleRootDrop: (evt: React.DragEvent) => {
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
    },
    handleFolderDragOver: (evt: React.DragEvent) => {
      evt.preventDefault();
      evt.dataTransfer.dropEffect = "move";
    },
    handleRowClick: (evt: React.MouseEvent, row: any) => {
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
    },
    isSelected: (row: any) => {
      if (row.type !== "query") return false;
      return selectedFiles.some(
        f =>
          f.fileName === row.name &&
          (f.parentFolder || "") === (row.parentFolder || "")
      );
    },
    toggleFolder: (name: string) => {
      setExpandedFolders((prev) => ({
        ...prev,
        [name]: !prev[name],
      }));
    },
    handleDuplicateFile: (parentFolder: string | undefined, name: string) => {
      handleDuplicateFile(parentFolder, name, setWorksheetData);
    },
    setModalState,
    worksheetData,
    setWorksheetData,
    expandedFolders,
    comments,
    setComments,
  };
}
