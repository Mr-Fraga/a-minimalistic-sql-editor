
import React, { useRef } from "react";
import { SqlEditorImperativeHandle } from "@/components/SqlEditor";
import { SidebarProvider } from "@/components/ui/sidebar";
import MainContent from "@/components/MainContent";
import AccountSection from "@/components/AccountSection";

// Home page layout, now much cleaner!
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
          // Border removed per instruction
        }}
      >
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
