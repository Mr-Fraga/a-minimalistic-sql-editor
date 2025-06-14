
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, ToggleLeft, ToggleRight } from "lucide-react";

interface ResultsActionsBarProps {
  onDownload: () => void;
  toggled: boolean;
  onToggle: () => void;
}

export const ResultsActionsBar: React.FC<ResultsActionsBarProps> = ({
  onDownload,
  toggled,
  onToggle,
}) => (
  <div className="flex gap-2 items-center px-4 pt-3 pb-4 justify-end">
    <Button
      variant="default"
      size="sm"
      className="bg-black hover:bg-black/90 text-white border-none"
      onClick={onDownload}
      aria-label="Download CSV"
    >
      <Download size={18} />
    </Button>
    <Button
      variant="default"
      size="sm"
      className="bg-black hover:bg-black/90 text-white border-none"
      onClick={onToggle}
      aria-label={toggled ? "Toggled On" : "Export all results"}
    >
      {toggled ? (
        <ToggleRight size={18} />
      ) : (
        <>
          <ToggleLeft size={18} className="mr-1" />
          <span className="ml-1">Export all results</span>
        </>
      )}
    </Button>
  </div>
);
