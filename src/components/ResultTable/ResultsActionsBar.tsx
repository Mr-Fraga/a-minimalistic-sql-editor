
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
  <div className="flex gap-3 items-center p-0 m-0">
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
        <ToggleLeft size={18} />
      )}
    </Button>
    <span className="text-gray-400 text-xs ml-1 select-none">Export all results</span>
  </div>
);
