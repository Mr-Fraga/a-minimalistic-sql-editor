
import React from "react";

// Mock folders/files data
const worksheetData = [
  {
    type: "folder",
    name: "Finance Reports",
    files: [
      { type: "file", name: "Q1_2024_Balance.xlsx" },
      { type: "file", name: "Expenses_April.csv" },
    ],
  },
  {
    type: "folder",
    name: "HR",
    files: [
      { type: "file", name: "Employee_List_2025.xlsx" },
    ],
  },
  {
    type: "file",
    name: "Roadmap_2025.xlsx",
  },
];

const WorksheetsPage: React.FC = () => {
  return (
    <div className="flex-1 w-full h-full bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Worksheets</h1>
        <ul>
          {worksheetData.map((item, idx) =>
            item.type === "folder" ? (
              <li key={item.name + idx} className="mb-4">
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  <span role="img" aria-label="Folder">📁</span>
                  {item.name}
                </div>
                <ul className="ml-7 mt-2">
                  {item.files.map((file, fIdx) => (
                    <li key={file.name + fIdx}
                        className="flex items-center gap-2 py-1 text-gray-800 hover:bg-gray-50 rounded cursor-pointer">
                      <span role="img" aria-label="File">📄</span>
                      {file.name}
                    </li>
                  ))}
                </ul>
              </li>
            ) : (
              <li key={item.name + idx}
                  className="flex items-center gap-2 py-1 text-gray-800 hover:bg-gray-50 rounded cursor-pointer">
                <span role="img" aria-label="File">📄</span>
                {item.name}
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
};

export default WorksheetsPage;
