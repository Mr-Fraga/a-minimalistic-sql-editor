
import React from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import TableTooltipContent from "./TableTooltipContent";

interface Table {
  name: string;
  columns: string[];
  description?: string;
  owner?: string;
}
interface SchemaExplorerProps {
  schemaName: string;
  tables: Table[];
  open: boolean;
  onToggleOpen: (schema: string) => void;
  onInsertSchemaTable?: (schema: string, table: string) => void;
  onInsertColumn?: (col: string) => void;
}
const SchemaExplorer: React.FC<SchemaExplorerProps> = ({
  schemaName,
  tables,
  open,
  onToggleOpen,
  onInsertSchemaTable,
  onInsertColumn,
}) => {
  return (
    <Collapsible open={open} onOpenChange={() => onToggleOpen(schemaName)}>
      <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => onToggleOpen(schemaName)}>
        {open ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
        <span className="font-din text-gray-700 text-base font-bold">
          {schemaName}
          <span className="ml-2 text-xs text-gray-400 font-normal">
            ({tables.length})
          </span>
        </span>
      </div>
      <CollapsibleContent>
        <ul className="pl-6 mt-2 space-y-1">
          {tables.map((table) => (
            <li key={table.name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="font-din text-left text-sm w-full px-2 py-1 rounded hover:bg-black hover:text-white transition"
                    onClick={() => onInsertSchemaTable?.(schemaName, table.name)}
                    type="button"
                  >
                    {table.name}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="p-3 max-w-xs break-words">
                  <TableTooltipContent
                    schema={schemaName}
                    table={table}
                    onInsertColumn={onInsertColumn}
                  />
                </TooltipContent>
              </Tooltip>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
};
export default SchemaExplorer;

