
import React, { useRef, useState } from "react";
import { SqlEditorImperativeHandle } from "@/components/SqlEditor";
import { SidebarProvider } from "@/components/ui/sidebar";
import MainContent from "@/components/MainContent";
import AccountSection from "@/components/AccountSection";
import { Button } from "@/components/ui/button";

const Index: React.FC = () => {
  const sqlEditorRef = useRef<SqlEditorImperativeHandle | null>(null);
  // Add state for active tab
  const [activeTab, setActiveTab] = useState<"sql" | "worksheets">("sql");

  return (
    <div className="min-h-screen h-screen w-full flex flex-col bg-white">
      {/* Top slim horizontal panel */}
      <div
        className="w-full bg-white flex items-center pt-6" // Added pt-6 for extra top padding
        style={{
          zIndex: 10,
          minHeight: "66px",  // Increased minHeight for visual buffer
          maxHeight: "66px",
        }}
      >
        {/* Titles: SQL and Worksheets */}
        <div className="flex flex-row items-center gap-6 pl-6 md:pl-8">
          <Button
            variant="ghost"
            className={
              (activeTab === "sql"
                ? "text-black font-bold"
                : "text-gray-600 font-semibold") +
              " text-2xl px-6 py-2"
            }
            onClick={() => setActiveTab("sql")}
            aria-pressed={activeTab === "sql"}
          >
            SQL
          </Button>
          <Button
            variant="ghost"
            className={
              (activeTab === "worksheets"
                ? "text-black font-bold"
                : "text-gray-600 font-semibold") +
              " text-2xl px-6 py-2"
            }
            onClick={() => setActiveTab("worksheets")}
            aria-pressed={activeTab === "worksheets"}
          >
            Worksheets
          </Button>
        </div>
        <div className="flex-1 px-4" />
        {/* AccountSection on the right */}
        <AccountSection account="john@example.com" role="readonly" />
      </div>
      {/* White panel spacer between account bar and tab bar */}
      <div
        className="w-full bg-white"
        style={{
          minHeight: "18px",
          maxHeight: "18px",
          boxShadow: "0 2px 6px 0 rgba(0,0,0,0.03)",
        }}
      />
      {/* Main content area */}
      <div className="flex-1 flex flex-row w-full min-h-0 h-full bg-white">
        <MainContent sqlEditorRef={sqlEditorRef} />
      </div>
    </div>
  );
};

export default Index;

