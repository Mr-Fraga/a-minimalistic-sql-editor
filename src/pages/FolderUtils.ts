
export function flattenWorksheetData(
  data,
  expandedFolders
) {
  // Returns: [{key, type, name, parentFolder?, ...}]
  const rows: Array<any> = [];
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

export function sortWorksheetRows(rows, sort) {
  const multiplier = sort.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
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
}

// Used for duplication logic in the table
export function handleDuplicateFile(
  parentFolder: string | undefined,
  fileName: string,
  setWorksheetData: (cb: (prev: any[]) => any[]) => void
) {
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
}
