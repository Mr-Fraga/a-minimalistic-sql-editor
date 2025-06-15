import React, { useState } from "react";
import AccountSection from "@/components/AccountSection";
import { Button } from "@/components/ui/button";
import SqlPage from "./SqlPage";
import WorksheetsPage from "./WorksheetsPage";
import { WorksheetsProvider } from "@/contexts/WorksheetsContext";
import { TabsProvider } from "@/contexts/TabsContext";

const Index: React.FC = () => {
  // Add state for active tab
  const [activeTab, setActiveTab] = useState<"sql" | "worksheets">("sql");
  // Now wrap everything in WorksheetsProvider
  return (
    <WorksheetsProvider>
      <TabsProvider>
        <div className="min-h-screen h-screen w-full flex flex-col bg-white">
          {/* Top slim horizontal panel */}
          <div
            className="w-full bg-white flex items-center pt-6"
            style={{
              zIndex: 10,
              minHeight: "66px",
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
          {/* White panel spacer between account bar and page */}
          <div
            className="w-full bg-white"
            style={{
              minHeight: "18px",
              maxHeight: "18px",
              boxShadow: "0 2px 6px 0 rgba(0,0,0,0.03)",
            }}
          />
          {/* Conditional page display */}
          <div className="flex-1 flex flex-col h-full w-full">
            {activeTab === "sql" ? <SqlPage /> : <WorksheetsPage />}
          </div>
        </div>
      </TabsProvider>
    </WorksheetsProvider>
  );
};

export default Index;
