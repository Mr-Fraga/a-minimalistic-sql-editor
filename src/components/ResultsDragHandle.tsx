
import React from "react";

interface ResultsDragHandleProps {
  collapsed: boolean;
  onDragStart: (e: React.MouseEvent) => void;
}

const ResultsDragHandle: React.FC<ResultsDragHandleProps> = ({ collapsed, onDragStart }) => (
  <div
    className="flex-1 flex items-center"
    onMouseDown={collapsed ? undefined : onDragStart}
    role="separator"
    aria-label="Drag to resize results"
    tabIndex={0}
    style={{ cursor: collapsed ? undefined : "ns-resize" }}
  >
    <h2 className="font-din font-bold text-base text-gray-800 ml-4" style={{ letterSpacing: "0.04em" }}>
      Results
    </h2>
  </div>
);

export default ResultsDragHandle;
