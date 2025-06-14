
import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { TabType } from "./useTabsState";

// You should provide MOCK_RESULT identical to MainContent usage
const MOCK_RESULT = {
  columns: ["id", "name", "email"],
  rows: [
    [1, "Alice", "alice@email.com"],
    [2, "Bob", "bob@email.com"],
    [3, "Charlie", "charlie@email.com"],
  ]
};

export function useQueryApi({ updateTab, DEFAULT_SQL }: {
  updateTab: (id: string, updates: Partial<TabType>) => void;
  DEFAULT_SQL: string;
}) {
  const apiUrl = "http://localhost:8000";
  const USE_MOCK_QUERY = true;

  const runSql = useCallback(
    async (sql: string, tabId: string) => {
      updateTab(tabId, { isRunning: true, error: null, result: null });
      try {
        if (USE_MOCK_QUERY) {
          await new Promise((res) => setTimeout(res, 350));
          if (
            sql.trim().replace(/\s+/g, " ") === DEFAULT_SQL.trim().replace(/\s+/g, " ")
          ) {
            updateTab(tabId, { result: MOCK_RESULT, error: null });
          } else {
            throw new Error("Only the default mock query is supported: SELECT * FROM users LIMIT 10;");
          }
        } else {
          const response = await fetch(`${apiUrl}/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sql }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Unknown error occurred");
          }
          const data = await response.json();
          updateTab(tabId, { result: data, error: null });
        }
      } catch (error: any) {
        console.error("Query failed!", error);
        updateTab(tabId, { error: error.message, result: null });
        toast({
          title: "Query failed!",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        updateTab(tabId, { isRunning: false });
      }
    },
    [updateTab, DEFAULT_SQL]
  );

  const formatSql = useCallback(async (sql: string, onSqlChange: (formatted: string) => void) => {
    try {
      const response = await fetch(`${apiUrl}/format`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unknown error occurred");
      }
      const data = await response.json();
      onSqlChange(data.formatted);
      toast({
        title: "SQL Formatted!",
        description: "Your SQL has been formatted.",
      });
    } catch (error: any) {
      console.error("Format failed!", error);
      toast({
        title: "Format failed!",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [apiUrl]);

  return { runSql, formatSql };
}
