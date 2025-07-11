import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { TabType } from "@/contexts/TabsTypes";

// You should provide MOCK_RESULT identical to MainContent usage
const MOCK_RESULT = {
  columns: ["id", "name", "email", "phone", "country_code"],
  rows: [
    [1, "Alice", "alice@email.com", "555-0100", "US"],
    [2, "Bob", "bob@email.com", "555-0101", "CA"],
    [3, "Charlie", "charlie@email.com", "555-0102", "UK"],
    [4, "David", "david@email.com", "555-0103", "AU"],
    [5, "Eva", "eva@email.com", "555-0104", "DE"],
    [6, "Frank", "frank@email.com", "555-0105", "FR"],
    [7, "Grace", "grace@email.com", "555-0106", "ES"],
    [8, "Hannah", "hannah@email.com", "555-0107", "IT"],
    [9, "Ian", "ian@email.com", "555-0108", "NL"],
    [10, "Julia", "julia@email.com", "555-0109", "CH"],
    [11, "Kyle", "kyle@email.com", "555-0110", "AT"],
    [12, "Luna", "luna@email.com", "555-0111", "SE"],
    [13, "Maya", "maya@email.com", "555-0112", "NO"],
    [14, "Noah", "noah@email.com", "555-0113", "DK"],
    [15, "Olivia", "olivia@email.com", "555-0114", "FI"],
  ]
};

export function useQueryApi({ updateTab, DEFAULT_SQL }: {
  updateTab: (id: string, updates: Partial<TabType>) => void;
  DEFAULT_SQL: string;
}) {
  const apiUrl = "http://localhost:8000";
  const USE_MOCK_QUERY = true;

  function normalizeSql(sql: string) {
    // Remove extra whitespace, lowercase, and remove trailing semicolons
    return sql.trim().replace(/\s+/g, " ").replace(/;$/, "").toLowerCase();
  }

  const runSql = useCallback(
    async (sql: string, tabId: string) => {
      updateTab(tabId, { isRunning: true, error: null, result: null });
      try {
        if (USE_MOCK_QUERY) {
          await new Promise((res) => setTimeout(res, 350));
          const normalized = normalizeSql(sql);
          const expected = normalizeSql(DEFAULT_SQL);
          console.log("[useQueryApi] Normalized input:", normalized, "Expected:", expected);
          if (normalized === expected) {
            // COMBINE all relevant state in a single call!
            updateTab(tabId, { result: MOCK_RESULT, error: null, isRunning: false });
            console.log("[useQueryApi] set MOCK_RESULT for", tabId);
          } else {
            // Set error and reset, but isRunning: false as well
            updateTab(tabId, { error: "Only the default mock query is supported: SELECT * FROM users LIMIT 10;", result: null, isRunning: false });
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
          updateTab(tabId, { result: data, error: null, isRunning: false });
        }
      } catch (error: any) {
        console.error("Query failed!", error);
        // Error already set, just toast
        toast({
          title: "Query failed!",
          description: error.message,
          variant: "destructive",
        });
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
