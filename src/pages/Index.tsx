
import React, { useRef } from "react";
import { SqlEditorImperativeHandle } from "@/components/SqlEditor";
import { SidebarProvider } from "@/components/ui/sidebar";
import MainContent from "@/components/MainContent";

// Home page layout, now much cleaner!
const Index: React.FC = () => {
  const sqlEditorRef = useRef<SqlEditorImperativeHandle | null>(null);

  return (
    <div className="min-h-screen h-screen w-full flex flex-col bg-white">
      {/* Top horizontal panel */}
      <div
        className="w-full bg-white flex items-center"
        style={{ zIndex: 10, minHeight: "56px" }}
      >
        <div className="px-0 py-0 w-full flex items-center justify-end">
          {/* Account bar */}
          <SidebarProvider>
            <div className="flex-1 flex items-center justify-end">
              {/* Use the AccountSection component as before */}
              <div>
                <div className="flex gap-2 flex-row items-center">
                  <span className="text-xs font-mono text-gray-700">john@example.com</span>
                  <span className="inline-block px-2 rounded-full bg-gray-200 text-xs text-gray-700 ml-2">readonly</span>
                </div>
              </div>
            </div>
          </SidebarProvider>
        </div>
      </div>
      {/* Main content area: just MainContent (TabView now handles TableExplorer inside) */}
      <div className="flex-1 flex flex-row w-full min-h-0 h-full bg-white">
        <MainContent sqlEditorRef={sqlEditorRef} />
      </div>
    </div>
  );
};

export default Index;
