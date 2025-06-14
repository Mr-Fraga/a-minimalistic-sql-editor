
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
    >
      <Download size={16} className="mr-1" /> Download CSV
    </Button>
    <Button
      variant="default"
      size="sm"
      className="bg-black hover:bg-black/90 text-white border-none"
      onClick={onToggle}
    >
      {toggled ? (
        <>
          <ToggleRight size={16} className="mr-1" /> Toggled On
        </>
      ) : (
        <>
          <ToggleLeft size={16} className="mr-1" /> Export all results
        </>
      )}
    </Button>
  </div>
);
