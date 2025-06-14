
import React, { useState, useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User, UserRound, Shield, ShieldCheck } from "lucide-react";

// Optional: in a real app, this would come from user profile props
const MOCK_NAME = "John Smith";

interface AccountSectionProps {
  account: string; // This is email
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

const AccountSection: React.FC<AccountSectionProps> = ({
  account,
  role,
}) => {
  const [currentRole, setCurrentRole] = useState(role);
  const [roleOpen, setRoleOpen] = useState(false);
  const roleIconRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!roleOpen) return;
    function onClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        roleIconRef.current &&
        !roleIconRef.current.contains(e.target as Node)
      ) {
        setRoleOpen(false);
      }
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [roleOpen]);

  // Get details for current role
  const currentRoleObj =
    ROLES.find((r) => r.key === currentRole) ?? ROLES[0];

  // Tooltip state for account
  const [accountTooltipOpen, setAccountTooltipOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-4 bg-white text-black px-6 py-4 rounded-t-none shadow-none select-none relative">
      {/* Role Icon with tooltip and dropdown */}
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <div
              ref={roleIconRef}
              className="flex items-center justify-center cursor-pointer border-none focus:outline-none relative"
              tabIndex={0}
              onClick={() => setRoleOpen((o) => !o)}
              aria-label="Role"
            >
              <div
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center"
              >
                <currentRoleObj.Icon className="w-6 h-6 text-black" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            align="start"
            className="bg-black text-white font-mono text-base px-4 py-2 rounded shadow border border-gray-500 mt-1"
          >
            {currentRoleObj.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* Dropdown for selecting role */}
      {roleOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 left-0 mt-12"
          tabIndex={-1}
        >
          <div className="bg-white text-black rounded shadow-lg border w-[150px] font-mono text-sm py-1">
            <div className="px-3 py-2 font-semibold border-b">Switch Role</div>
            {ROLES.map((r) => (
              <button
                onClick={() => {
                  setCurrentRole(r.key);
                  setRoleOpen(false);
                }}
                key={r.key}
                className={`flex items-center gap-2 px-3 py-2 w-full hover:bg-gray-100 text-left ${
                  currentRole === r.key ? "font-bold bg-gray-50" : ""
                }`}
              >
                <r.Icon className="w-4 h-4" />
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Account icon with tooltip */}
      <TooltipProvider>
        <Tooltip open={accountTooltipOpen} onOpenChange={setAccountTooltipOpen} delayDuration={200}>
          <TooltipTrigger asChild>
            <div
              className="ml-1 flex items-center justify-center cursor-pointer"
              tabIndex={0}
              aria-label="View account details"
              onMouseEnter={() => setAccountTooltipOpen(true)}
              onMouseLeave={() => setAccountTooltipOpen(false)}
              onFocus={() => setAccountTooltipOpen(true)}
              onBlur={() => setAccountTooltipOpen(false)}
            >
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                <User className="w-6 h-6 text-black" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            align="start"
            className="bg-black text-white font-mono text-base px-4 py-3 rounded shadow border border-gray-500 min-w-[210px] mt-1"
          >
            <div>
              <div className="font-bold mb-1">{MOCK_NAME}</div>
              <div className="text-xs text-zinc-300">{account}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default AccountSection;

