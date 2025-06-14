
import React from "react";
import { Copy, Settings2, Glasses } from "lucide-react";

interface SqlEditorToolbarProps {
  onCopy: () => void;
  onFormat: () => void;
  onSearch: () => void;
  isRunning?: boolean;
}
const SqlEditorToolbar: React.FC<SqlEditorToolbarProps> = ({
  onCopy,
  onFormat,
  onSearch,
  isRunning,
}) => (
  <>
    {/* Copy button */}
    <button
      type="button"
      className="absolute top-2 right-2 z-10 bg-white/90 rounded-md px-2 py-1 border border-gray-300 text-xs font-mono hover:bg-gray-50 flex items-center gap-1 shadow transition"
      onClick={onCopy}
      tabIndex={-1}
      title="Copy SQL to clipboard"
      aria-label="Copy SQL to clipboard"
      disabled={isRunning}
    >
      <Copy size={14} className="inline-block" />
      Copy
    </button>
    {/* Format button */}
    <button
      className="absolute top-11 right-2 z-10 bg-white/90 rounded-md px-2 py-1 border border-gray-300 text-xs font-mono hover:bg-gray-50 flex items-center gap-1 shadow transition"
      onClick={onFormat}
      tabIndex={-1}
      title="Format SQL"
      aria-label="Format SQL"
      disabled={isRunning}
      style={{ marginTop: 2 }}
      type="button"
    >
      <Settings2 size={14} className="inline-block" />
      Format
    </button>
    {/* Search button */}
    <button
      className="absolute top-20 right-2 z-10 bg-white/90 rounded-md px-2 py-1 border border-gray-300 text-xs font-mono hover:bg-gray-50 flex items-center gap-1 shadow transition"
      onClick={onSearch}
      tabIndex={-1}
      title="search"
      aria-label="Search"
      disabled={isRunning}
      style={{ marginTop: 2 }}
      type="button"
    >
      <Glasses size={14} className="inline-block" />
      Search
    </button>
  </>
);

export default SqlEditorToolbar;
