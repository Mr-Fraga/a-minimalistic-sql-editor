
import React, { useRef } from "react";
import MainContent from "@/components/MainContent";
import { SqlEditorImperativeHandle } from "@/components/SqlEditor";
import FloatingAIAssistant from "@/components/FloatingAIAssistant";

const SqlPage: React.FC = () => {
  // This ref is passed down for command execution
  const sqlEditorRef = useRef<SqlEditorImperativeHandle | null>(null);

  return (
    <div className="flex-1 flex flex-col h-full w-full relative">
      <MainContent sqlEditorRef={sqlEditorRef} />
      <FloatingAIAssistant />
    </div>
  );
};

export default SqlPage;
