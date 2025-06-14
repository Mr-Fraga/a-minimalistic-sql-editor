
import React, { useRef } from "react";
import { SqlEditorImperativeHandle } from "@/components/SqlEditor";
import { SidebarProvider } from "@/components/ui/sidebar";
import TableExplorer from "@/components/TableExplorer";
import AccountSection from "@/components/AccountSection";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
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
          <AccountSection account="john@example.com" role="readonly" />
        </div>
      </div>
      {/* Main content area: MainContent (left) and TableExplorer (right) */}
      <div className="flex-1 flex flex-row w-full min-h-0 h-full bg-white">
        <ResizablePanelGroup direction="horizontal" className="w-full h-full">
          {/* Main content on the left */}
          <ResizablePanel minSize={30} defaultSize={82}>
            <div className="flex-1 min-h-0 flex flex-col h-full">
              <MainContent sqlEditorRef={sqlEditorRef} />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle={false} />
          {/* TableExplorer now on the right, fully collapsible */}
          <ResizablePanel
            defaultSize={18}
            minSize={0}
            maxSize={35}
            collapsible
            className="min-w-0"
          >
            <TableExplorer
              onInsertSchemaTable={(schema, table) => {
                if (sqlEditorRef.current) {
                  sqlEditorRef.current.insertAtCursor(`${schema}.${table}`);
                }
              }}
              onInsertColumn={(col) => {
                if (sqlEditorRef.current) {
                  sqlEditorRef.current.insertAtCursor(col);
                }
              }}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;
