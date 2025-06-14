
import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

// Optional: in a real app, this would come from user profile props
const MOCK_NAME = "John Smith";

interface AccountSectionProps {
  account: string; // This is email
  role: string;    // Should match one of: "readonly", "admin", "sensitive"
  onRoleChange?: (newRole: string) => void;
}

const ROLES = [
  {
    key: "readonly",
    label: "Readonly",
  },
  {
    key: "sensitive",
    label: "Sensitive",
  },
  {
    key: "admin",
    label: "Admin",
  },
];

const AccountSection: React.FC<AccountSectionProps> = ({
  account,
  role: initialRole,
  onRoleChange,
}) => {
  // Local role state for demonstration (if no onRoleChange passed)
  const [role, setRole] = React.useState(initialRole);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  React.useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  // Find role label
  const roleLabel = ROLES.find((r) => r.key === role)?.label ?? ROLES[0].label;

  // Avatar click toggles the menu
  const handleAvatarClick = () => {
    setDropdownOpen((prev) => !prev);
  };

  // Support keyboard activation (enter/space)
  const handleAvatarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setDropdownOpen((prev) => !prev);
    }
  };

  const handleAvatarBlur = () => {
    setDropdownOpen(false);
  };

  // Handle role change, show toast, then close dropdown
  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    const label = ROLES.find((r) => r.key === newRole)?.label || newRole;
    toast({
      title: "Role changed",
      description: `Your role has been set to "${label}".`,
    });
    setDropdownOpen(false);
    if (onRoleChange) onRoleChange(newRole);
  };

  return (
    <div className="flex items-center gap-4 bg-white text-black px-6 py-5 rounded-t-none shadow-none select-none relative">
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <div
            className="flex items-center justify-center cursor-pointer"
            tabIndex={0}
            aria-label="View account details"
            onClick={handleAvatarClick}
            onKeyDown={handleAvatarKeyDown}
            onBlur={handleAvatarBlur}
          >
            <Avatar className="h-12 w-12 border-2 border-gray-200 shadow bg-gray-200">
              <AvatarFallback className="bg-gray-200 text-black font-bold text-xl flex items-center justify-center border-2 border-gray-200">
                J
              </AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="start"
          className="z-50 min-w-[230px] bg-white border text-black shadow-lg mt-2"
          style={{ marginTop: "4px" }}
        >
          <div className="px-4 py-3 border-b mb-2">
            <div className="font-bold mb-1 text-lg">{MOCK_NAME}</div>
            <div className="text-xs text-zinc-400 mb-2">{account}</div>
            <div className="text-xs">
              <span className="font-semibold text-black mr-1">Role:</span>
              <span>{roleLabel}</span>
            </div>
          </div>
          <div className="font-semibold text-sm px-4 pt-2 pb-2">Change Role</div>
          {ROLES.map((r) => (
            <DropdownMenuItem
              key={r.key}
              onSelect={() => handleRoleChange(r.key)}
              className={`py-2 px-4 text-sm cursor-pointer ${
                role === r.key ? "bg-gray-100 font-bold" : ""
              }`}
              aria-checked={role === r.key}
              role="menuitemradio"
            >
              {r.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AccountSection;
