
import React, { useState } from "react";
import {
  Select,
  SelectGroup,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import { User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AccountSectionProps {
  account: string;
  role: string;
}

const ROLES = ["readonly", "readwrite", "admin"];

const AccountSection: React.FC<AccountSectionProps> = ({ account, role }) => {
  const [currentRole, setCurrentRole] = useState(role);

  return (
    <div className="flex items-center gap-4 bg-black text-white px-6 py-3 rounded-t-lg border-b border-gray-200 shadow-sm select-none">
      {/* Role selector */}
      <div className="font-mono text-lg tracking-tight flex items-center gap-2">
        <span className="font-bold">Role:</span>
        <Select value={currentRole} onValueChange={setCurrentRole}>
          <SelectTrigger className="w-[120px] bg-white text-black font-mono h-8 rounded px-2 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Role</SelectLabel>
              {ROLES.map((r) => (
                <SelectItem value={r} key={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {/* Account icon with tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="ml-1 flex items-center justify-center cursor-pointer"
              tabIndex={0}
            >
              <User className="w-7 h-7 text-white" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-black text-white font-mono text-base px-4 py-2 rounded shadow border border-gray-500">
            {account}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default AccountSection;
