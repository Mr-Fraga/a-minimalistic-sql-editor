
import React, { createContext, useContext, useState } from "react";

export interface WorksheetFile {
  type: "query";
  name: string;
  createdAt: string;
  updatedAt: string;
  comment?: string;
}

export interface WorksheetFolder {
  type: "folder";
  name: string;
  createdAt: string;
  updatedAt: string;
  comment?: string;
  files: WorksheetFile[];
}

export type WorksheetEntry = WorksheetFile | WorksheetFolder;

type WorksheetsContextType = {
  worksheetData: WorksheetEntry[];
  addWorksheetQuery: (name: string, comment?: string) => void;
  setWorksheetData: React.Dispatch<React.SetStateAction<WorksheetEntry[]>>;
};

const WorksheetsContext = createContext<WorksheetsContextType | undefined>(undefined);

export const WorksheetsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // NOTE: You could initialize this from localStorage or the standard mock data.
  const initial: WorksheetEntry[] = [
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
  const [worksheetData, setWorksheetData] = useState<WorksheetEntry[]>(initial);

  function addWorksheetQuery(name: string, comment?: string) {
    // Only add to root, not in folders, unless desired otherwise
    setWorksheetData(prev => [
      ...prev,
      {
        type: "query",
        name,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        comment: comment ?? "New tab query",
      },
    ]);
  }

  return (
    <WorksheetsContext.Provider value={{ worksheetData, setWorksheetData, addWorksheetQuery }}>
      {children}
    </WorksheetsContext.Provider>
  );
};

export function useWorksheets() {
  const ctx = useContext(WorksheetsContext);
  if (!ctx) throw new Error("useWorksheets must be used within WorksheetsProvider");
  return ctx;
}
