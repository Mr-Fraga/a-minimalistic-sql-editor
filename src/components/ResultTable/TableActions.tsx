
import React from "react";
import { Copy as CopyIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  downloadBtnClass: string;
  handleCopy: () => void;
  handleCopyColumn: () => void;
  handleClearSelection: () => void;
  canCopy: boolean;
  canCopyColumn: boolean;
  selection: any;
  handleDownloadCSV: () => void;
}

export const TableActions: React.FC<Props> = ({
  downloadBtnClass,
  handleCopy,
  handleCopyColumn,
  handleClearSelection,
  canCopy,
  canCopyColumn,
  selection,
  handleDownloadCSV,
}) => (
  <div className="flex flex-wrap gap-2 items-center justify-end px-2 pt-4 pb-2">
    <button
      type="button"
      className={downloadBtnClass}
      onClick={handleCopy}
      disabled={!canCopy}
      title="Copy selected (or all) to clipboard"
    >
      <CopyIcon className="inline-block mr-1" size={14} /> Copy
    </button>
    <button
      type="button"
      className={downloadBtnClass}
      onClick={handleCopyColumn}
      disabled={!canCopyColumn}
      title="Copy column to clipboard"
    >
      <CopyIcon className="inline-block mr-1" size={14} /> Copy Column
    </button>
    {selection && (
      <button
        type="button"
        className={downloadBtnClass + " bg-gray-200 hover:bg-gray-300 text-black"}
        onClick={handleClearSelection}
        title="Clear selection"
      >
        Clear Selection
      </button>
    )}
    <button
      type="button"
      className={downloadBtnClass}
      onClick={handleDownloadCSV}
    >
      Download CSV
    </button>
  </div>
);
