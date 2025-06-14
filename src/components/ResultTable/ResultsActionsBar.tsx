
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Copy, ToggleLeft, ToggleRight } from "lucide-react";

interface ResultsActionsBarProps {
  onCopy: () => void;
  onDownload: () => void;
  // Example toggle state/actions for demo (replace with real ones as needed)
  toggled: boolean;
  onToggle: () => void;
}

export const ResultsActionsBar: React.FC<ResultsActionsBarProps> = ({
  onCopy,
  onDownload,
  toggled,
  onToggle,
}) => (
  <div className="flex gap-2 items-center px-4 pt-1 pb-0">
    <Button variant="secondary" size="sm" onClick={onCopy}>
      <Copy size={16} className="mr-1" /> Copy
    </Button>
    <Button variant="secondary" size="sm" onClick={onDownload}>
      <Download size={16} className="mr-1" /> Download CSV
    </Button>
    <Button variant="outline" size="sm" onClick={onToggle}>
      {toggled ? (
        <>
          <ToggleRight size={16} className="mr-1" /> Toggled On
        </>
      ) : (
        <>
          <ToggleLeft size={16} className="mr-1" /> Toggled Off
        </>
      )}
    </Button>
  </div>
);
