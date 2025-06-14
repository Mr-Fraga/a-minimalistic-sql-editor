
import React from "react";
import { Selection } from "./utils";

interface Props {
  cell: any;
  rowIdx: number;
  colIdx: number;
  selected: boolean;
  onMouseDown: (row: number, col: number) => void;
  onMouseEnter: (row: number, col: number) => void;
  onDoubleClick: () => void;
  onClick: (e: React.MouseEvent) => void;
}

export const TableCell: React.FC<Props> = ({
  cell,
  rowIdx,
  colIdx,
  selected,
  onMouseDown,
  onMouseEnter,
  onDoubleClick,
  onClick,
}) => (
  <td
    className={
      "px-3 py-2 cursor-pointer" +
      (selected
        ? " bg-blue-200 text-blue-900 font-bold"
        : " hover:bg-blue-50")
    }
    onMouseDown={e => {
      if (e.button === 0) onMouseDown(rowIdx, colIdx);
    }}
    onMouseEnter={e => {
      if (e.buttons === 1) onMouseEnter(rowIdx, colIdx);
    }}
    onDoubleClick={onDoubleClick}
    onClick={onClick}
  >
    {cell}
  </td>
);
