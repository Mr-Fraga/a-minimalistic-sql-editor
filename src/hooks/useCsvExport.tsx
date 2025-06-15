import { toast } from "@/hooks/use-toast";
import { TabType } from "@/contexts/TabsContext";

export function useCsvExport(activeTab: TabType | undefined | null) {
  // CSV Export
  const onDownloadCsv = (rowsToExport?: Array<any[]>) => {
    if (!activeTab || !activeTab.result) {
      toast({
        title: "No results to download!",
        description: "Run a query first.",
        variant: "destructive",
      });
      return;
    }

    const rows = rowsToExport || activeTab.result.rows;
    const columns = activeTab.result.columns;

    if (!rows || rows.length === 0) {
      toast({
        title: "No rows to download!",
        description: "The query returned no rows.",
        variant: "destructive",
      });
      return;
    }

    // Convert data to CSV format
    const csvRows = [];
    csvRows.push(columns.join(","));

    for (const row of rows) {
      const values = row.map((value) => {
        if (typeof value === "string") {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(","));
    }

    const csvString = csvRows.join("\n");

    function sanitize(str: string) {
      return str.replace(/[^a-zA-Z0-9_\- ]/g, "_");
    }
    const now = new Date();
    const timestamp =
      now.getFullYear().toString() +
      ("0" + (now.getMonth() + 1)).slice(-2) +
      ("0" + now.getDate()).slice(-2) +
      "_" +
      ("0" + now.getHours()).slice(-2) +
      ("0" + now.getMinutes()).slice(-2) +
      ("0" + now.getSeconds()).slice(-2);
    const fname = `${sanitize(activeTab.name)}_${timestamp}.csv`;

    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", fname);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({
      title: "CSV Download Started!",
      description: "Your download should start automatically.",
    });
  };

  return { onDownloadCsv };
}
