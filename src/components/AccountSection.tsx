
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Circle } from "lucide-react";

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
  role,
}) => {
  // find label for role
  const roleLabel =
    ROLES.find((r) => r.key === role)?.label ?? ROLES[0].label;

  // Tooltip state for account info
  const [accountTooltipOpen, setAccountTooltipOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-4 bg-white text-black px-6 py-6 rounded-t-none shadow-none select-none relative">
      <TooltipProvider>
        <Tooltip open={accountTooltipOpen} onOpenChange={setAccountTooltipOpen} delayDuration={200}>
          <TooltipTrigger asChild>
            <div
              className="flex items-center justify-center cursor-pointer"
              tabIndex={0}
              aria-label="View account details"
              onMouseEnter={() => setAccountTooltipOpen(true)}
              onMouseLeave={() => setAccountTooltipOpen(false)}
              onFocus={() => setAccountTooltipOpen(true)}
              onBlur={() => setAccountTooltipOpen(false)}
            >
              <Avatar className="h-14 w-14 border-2 border-black shadow bg-white">
                <AvatarFallback className="bg-white text-black font-bold text-xl flex items-center justify-center">
                  <Circle className="w-7 h-7 mr-2" />
                  {/* Only show one initial if space */}
                  {MOCK_NAME.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </TooltipTrigger>
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
      </TooltipProvider>
    </div>
  );
};

export default AccountSection;
