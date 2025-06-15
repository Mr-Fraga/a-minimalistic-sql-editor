import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorksheets } from "@/contexts/WorksheetsContext";
import DeleteFileModal from "@/components/DeleteFileModal";
import WorksheetsTable from "./WorksheetsTable";
import NewFolderInput from "./NewFolderInput";
import { Card, CardContent } from "@/components/ui/card";
import { useTabs } from "@/contexts/TabsContext";

const WorksheetsPage: React.FC = () => {
  const { worksheetData, setWorksheetData } = useWorksheets();
  const { tabs } = useTabs(); // NEW: get all current open tabs

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [modalState, setModalState] = useState<{
    open: boolean;
    type?: "query" | "folder";
    fileName: string | null;
    parentFolder: string | undefined;
    folderIsEmpty?: boolean;
  }>({ open: false, fileName: null, parentFolder: undefined, type: undefined });

  const [search, setSearch] = useState("");
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [draggingFile, setDraggingFile] = useState<{ fileName: string; parentFolder?: string } | null>(null);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // New: selected file for preview section
  const [selectedFile, setSelectedFile] = useState<any>(null);

  // Handler for selecting a file (passed to the table)
  const handleSelectFile = (file: any) => {
    setSelectedFile(file);
  };

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

  const handleDeleteConfirmed = () => {
    if (!modalState.fileName) return;
    if (modalState.type === "folder") {
      setWorksheetData(prev =>
        prev.filter(
          item =>
            !(item.type === "folder" && item.name === modalState.fileName)
        )
      );
    } else if (modalState.type === "query") {
      setWorksheetData(prev => {
        if (!modalState.parentFolder) {
          return prev.filter(item => !(item.type === "query" && item.name === modalState.fileName));
        }
        return prev.map(item => {
          if (item.type !== "folder" || item.name !== modalState.parentFolder) return item;
          return {
            ...item,
            files: item.files.filter((f: any) => f.name !== modalState.fileName),
          };
        });
      });
    }
    setModalState({ open: false, type: undefined, fileName: null, parentFolder: undefined });
    // Also clear preview if the deleted file is being previewed
    if (
      selectedFile &&
      selectedFile.name === modalState.fileName &&
      // match parent folder or root
      ((modalState.parentFolder && selectedFile.parentFolder === modalState.parentFolder) ||
        (!modalState.parentFolder && !selectedFile.parentFolder))
    ) {
      setSelectedFile(null);
    }
  };

  // Helper: get latest SQL for selected file (by name & maybe by folder too)
  function getSelectedFileSql(selectedFile: any): string | null {
    if (!selectedFile || selectedFile.type !== "query") return null;
    // Find a tab with this file name
    const matchingTab = tabs.find(tab => tab.name === selectedFile.name);
    if (matchingTab) return matchingTab.sql;

    // Else, find file in worksheetData: at root or inside folder
    let found: any = worksheetData.find(
      item => item.type === "query" && item.name === selectedFile.name
    );
    if (!found) {
      // search inside folders
      for (const item of worksheetData) {
        if (item.type === "folder") {
          found = item.files.find(f => f.name === selectedFile.name);
          if (found) break;
        }
      }
    }
    if (found) return found.sql || "-- SQL not available --";
    return "-- SQL not available --";
  }

  return (
    <div className="flex-1 w-full h-full bg-white p-0 px-10 md:px-20">
      <div className="w-full pt-12">

        {/* Header with search and plus button */}
        <div className="flex justify-between items-center mb-4 gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold mb-0">Your queries</h1>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Search by name or comment..."
              className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 outline-none text-base bg-gray-50"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 350 }}
            />
            <Button
              aria-label="New Folder"
              variant="outline"
              size="icon"
              className="ml-2"
              onClick={() => setCreatingFolder(true)}
            >
              <span className="sr-only">Add Folder</span>
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            </Button>
          </div>
        </div>
        {/* New folder input/modal */}
        {creatingFolder && (
          <NewFolderInput
            newFolderName={newFolderName}
            setNewFolderName={setNewFolderName}
            onCreate={handleCreateFolder}
            onCancel={() => { setCreatingFolder(false); setNewFolderName(""); }}
          />
        )}
        {/* Worksheets table */}
        <WorksheetsTable
          worksheetData={worksheetData}
          setWorksheetData={setWorksheetData}
          expandedFolders={expandedFolders}
          setExpandedFolders={setExpandedFolders}
          search={search}
          comments={comments}
          setComments={setComments}
          draggingFile={draggingFile}
          setDraggingFile={setDraggingFile}
          setModalState={setModalState}
          onSelectFile={handleSelectFile}
          selectedFile={selectedFile}
        />
        {/* Preview Section */}
        <div className="mt-12">
          <h1 className="text-2xl font-bold mb-2">Preview</h1>
          <Card className="border border-gray-200 rounded-lg mt-2 shadow-sm bg-gray-50">
            <CardContent className="pt-4 pb-6 min-h-[120px] flex flex-col justify-center">
              {selectedFile && selectedFile.type === "query" ? (
                <>
                  <div className="mb-2 font-semibold text-lg text-gray-800">{selectedFile.name}</div>
                  {/* NEW: Show SQL content */}
                  <pre className="text-sm bg-gray-100 rounded px-3 py-2 text-gray-700 overflow-auto max-h-56 whitespace-pre-wrap mb-2">
                    {getSelectedFileSql(selectedFile)}
                  </pre>
                </>
              ) : (
                <div className="text-gray-400 text-center">No file selected</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <DeleteFileModal
        open={modalState.open}
        onOpenChange={open => setModalState(ms => ({ ...ms, open }))}
        fileName={modalState.fileName}
        type={modalState.type}
        folderIsEmpty={modalState.folderIsEmpty}
        onConfirm={handleDeleteConfirmed}
      />
    </div>
  );
};

export default WorksheetsPage;
