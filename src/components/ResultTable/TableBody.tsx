
import React from "react";
import { TableCell } from "./TableCell";
import { Selection } from "./utils";

interface Props {
  rows: Array<any[]>;
  columnsLength: number;
  selection: Selection;
  selectedCellsSet: Set<string>;
  selectedCol: number | null;
  handleCellMouseDown: (row: number, col: number) => void;
  handleCellMouseEnter: (row: number, col: number) => void;
  handleCopy: () => void;
}

export const TableBody: React.FC<Props> = ({
  rows,
  columnsLength,
  selection,
  selectedCellsSet,
  selectedCol,
  handleCellMouseDown,
  handleCellMouseEnter,
  handleCopy,
}) => {
  if (rows.length === 0)
    return (
      <tbody>
        <tr>
          <td colSpan={columnsLength} className="text-center py-3 text-gray-400">
            (No data)
          </td>
        </tr>
      </tbody>
    );

  return (
    <tbody>
      {rows.map((row, rowIdx) => (
        <tr key={rowIdx} className={rowIdx % 2 ? "bg-gray-50" : undefined}>
          {row.map((cell, colIdx) => {
            const selected =
              (selection &&
                selection.type === "cell" &&
                selectedCellsSet.has(`${rowIdx},${colIdx}`)) ||
              (selection &&
                selection.type === "column" &&
                colIdx === selectedCol);
            return (
              <TableCell
                key={colIdx}
                cell={cell}
                rowIdx={rowIdx}
                colIdx={colIdx}
                selected={!!selected}
                onMouseDown={handleCellMouseDown}
                onMouseEnter={handleCellMouseEnter}
                onDoubleClick={handleCopy}
                onClick={e => e.detail === 2 && handleCopy()}
              />
            );
          })}
        </tr>
      ))}
    </tbody>
  );
};
