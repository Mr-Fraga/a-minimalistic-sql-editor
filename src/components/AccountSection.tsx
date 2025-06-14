
import React, { useState, useRef } from "react";
import {
  Select,
  SelectGroup,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import { User, UserRound, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AccountSectionProps {
  account: string;
  role: string;
}

const ROLES = [
  {
    key: "readonly",
    label: "Readonly",
    Icon: UserRound,
  },
  {
    key: "readwrite",
    label: "Read/Write",
    Icon: Shield,
  },
  {
    key: "admin",
    label: "Admin",
    Icon: ShieldCheck,
  },
];

const AccountSection: React.FC<AccountSectionProps> = ({ account, role }) => {
  const [currentRole, setCurrentRole] = useState(role);
  const [roleOpen, setRoleOpen] = useState(false);

  // Get details for current role
  const currentRoleObj = ROLES.find((r) => r.key === currentRole) ?? ROLES[0];

  return (
    <div className="flex items-center gap-4 bg-black text-white px-6 py-3 rounded-t-lg shadow-sm select-none">
      {/* Role Icon with tooltip and dropdown */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex items-center justify-center cursor-pointer border-none focus:outline-none"
              tabIndex={0}
              onClick={() => setRoleOpen((o) => !o)}
              onBlur={() => setRoleOpen(false)}
            >
              <currentRoleObj.Icon className="w-7 h-7 text-white" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-black text-white font-mono text-base px-4 py-2 rounded shadow border border-gray-500">
            {currentRoleObj.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* Dropdown for selecting role */}
      {roleOpen && (
        <div className="absolute mt-12 z-40">
          <Select value={currentRole} onValueChange={(val) => { setCurrentRole(val); setRoleOpen(false); }}>
            <SelectTrigger className="w-[150px] bg-white text-black font-mono h-8 rounded px-2 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Role</SelectLabel>
                {ROLES.map((r) => (
                  <SelectItem value={r.key} key={r.key}>
                    <div className="flex items-center gap-2">
                      <r.Icon className="w-4 h-4" />
                      {r.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}
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

