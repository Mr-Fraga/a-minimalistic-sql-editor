
import React, { useRef } from "react";
import { SqlEditorImperativeHandle } from "@/components/SqlEditor";
import { SidebarProvider } from "@/components/ui/sidebar";
import MainContent from "@/components/MainContent";
import AccountSection from "@/components/AccountSection";

const Index: React.FC = () => {
  const sqlEditorRef = useRef<SqlEditorImperativeHandle | null>(null);

  return (
    <div className="min-h-screen h-screen w-full flex flex-col bg-white">
      {/* Top slim horizontal panel */}
      <div
        className="w-full bg-white flex items-center"
        style={{
          zIndex: 10,
          minHeight: "48px",
          maxHeight: "48px",
        }}
      >
        {/* Titles: SQL and Worksheets */}
        <div className="flex flex-row items-center gap-6 px-6">
          <span className="text-xl font-bold text-gray-900 tracking-tight select-none">SQL</span>
          <span className="text-md font-semibold text-gray-600 select-none">Worksheets</span>
        </div>
        <div className="flex-1 px-4" />
        {/* AccountSection on the right */}
        <AccountSection account="john@example.com" role="readonly" />
      </div>
      {/* Main content area */}
      <div className="flex-1 flex flex-row w-full min-h-0 h-full bg-white">
        <MainContent sqlEditorRef={sqlEditorRef} />
      </div>
    </div>
  );
};

export default Index;
