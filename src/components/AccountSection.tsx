
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  },
  {
    key: "readwrite",
    label: "Read/Write",
  },
  {
    key: "admin",
    label: "Admin",
  },
];

const AccountSection: React.FC<AccountSectionProps> = ({
  account,
  role: initialRole,
}) => {
  // Local role state for demonstration (since there's no backend)
  const [role, setRole] = React.useState(initialRole);
  // Tooltip state for account info
  const [accountTooltipOpen, setAccountTooltipOpen] = React.useState(false);
  // Dropdown state for role selection (open on hover)
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Find role label
  const roleLabel =
    ROLES.find((r) => r.key === role)?.label ?? ROLES[0].label;

  // On hover/focus, open dropdown menu
  const handleDropdownOpenChange = (open: boolean) => setDropdownOpen(open);

  return (
    <div className="flex items-center gap-4 bg-white text-black px-6 py-5 rounded-t-none shadow-none select-none relative">
      <TooltipProvider>
        <DropdownMenu open={dropdownOpen} onOpenChange={handleDropdownOpenChange}>
          <Tooltip open={accountTooltipOpen && !dropdownOpen} onOpenChange={setAccountTooltipOpen} delayDuration={200}>
            <DropdownMenuTrigger asChild>
              <div
                className="flex items-center justify-center cursor-pointer"
                tabIndex={0}
                aria-label="View account details"
                onMouseEnter={() => { setAccountTooltipOpen(true); setDropdownOpen(true); }}
                onMouseLeave={() => { setAccountTooltipOpen(false); setDropdownOpen(false); }}
                onFocus={() => { setAccountTooltipOpen(true); setDropdownOpen(true); }}
                onBlur={() => { setAccountTooltipOpen(false); setDropdownOpen(false); }}
              >
                <Avatar className="h-12 w-12 border-2 border-black shadow bg-white">
                  <AvatarFallback className="bg-white text-black font-bold text-xl flex items-center justify-center">
                    J
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <TooltipContent
              side="bottom"
              align="start"
              className="bg-black text-white font-mono text-base px-4 py-4 rounded shadow border border-gray-500 min-w-[230px] mt-1"
            >
              <div>
                <div className="font-bold mb-1 text-lg">{MOCK_NAME}</div>
                <div className="text-xs text-zinc-300 mb-2">{account}</div>
                <div className="text-xs">
                  <span className="font-semibold text-white mr-1">Role:</span>
                  <span>{roleLabel}</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent
            side="bottom"
            align="start"
            className="z-50 min-w-[160px] bg-white border text-black shadow-lg mt-2"
            style={{ marginTop: "4px" }}
          >
            <div className="font-semibold text-sm px-3 py-2">Change Role</div>
            {ROLES.map((r) => (
              <DropdownMenuItem
                key={r.key}
                onSelect={() => setRole(r.key)}
                className={`py-2 px-3 text-sm cursor-pointer ${role === r.key ? "bg-gray-100 font-bold" : ""}`}
                aria-checked={role === r.key}
                role="menuitemradio"
              >
                {r.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
    </div>
  );
};

export default AccountSection;

