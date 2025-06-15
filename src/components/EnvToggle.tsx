
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface EnvToggleProps {
  value: "DEV" | "STG" | "PRD";
  onChange: (val: "DEV" | "STG" | "PRD") => void;
}

const EnvToggle: React.FC<EnvToggleProps> = ({ value, onChange }) => (
  <ToggleGroup
    type="single"
    value={value}
    onValueChange={val => {
      if (val === "DEV" || val === "STG" || val === "PRD") onChange(val);
    }}
    className="w-full"
  >
    <ToggleGroupItem
      value="DEV"
      aria-label="DEV"
      className={`flex-1 text-xs font-din transition-colors ${
        value === "DEV"
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-500"
      } rounded-lg first:rounded-l-lg last:rounded-r-lg h-8 px-0`}
      style={{
        fontFamily:
          '"DIN Next","DIN Next LT Pro","DINNextLTPro-Regular","DINNextLTPro","DIN",sans-serif',
        minWidth: 0,
        borderRadius: "1.5rem",
        marginRight: "-1px",
        height: 32, // Exact match to tab height (h-8 = 32px)
        padding: 0,
      }}
    >
      DEV
    </ToggleGroupItem>
    <ToggleGroupItem
      value="STG"
      aria-label="STG"
      className={`flex-1 text-xs font-din transition-colors ${
        value === "STG"
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-500"
      } rounded-lg first:rounded-l-lg last:rounded-r-lg h-8 px-0`}
      style={{
        fontFamily:
          '"DIN Next","DIN Next LT Pro","DINNextLTPro-Regular","DINNextLTPro","DIN",sans-serif',
        minWidth: 0,
        borderRadius: "1.5rem",
        marginRight: "-1px",
        height: 32,
        padding: 0,
      }}
    >
      STG
    </ToggleGroupItem>
    <ToggleGroupItem
      value="PRD"
      aria-label="PRD"
      className={`flex-1 text-xs font-din transition-colors ${
        value === "PRD"
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-500"
      } rounded-lg first:rounded-l-lg last:rounded-r-lg h-8 px-0`}
      style={{
        fontFamily:
          '"DIN Next","DIN Next LT Pro","DINNextLTPro-Regular","DINNextLTPro","DIN",sans-serif',
        minWidth: 0,
        borderRadius: "1.5rem",
        height: 32,
        padding: 0,
      }}
    >
      PRD
    </ToggleGroupItem>
  </ToggleGroup>
);

export default EnvToggle;
