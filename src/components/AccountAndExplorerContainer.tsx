
import React from "react";
import AccountSection from "./AccountSection";
import TableExplorer from "./TableExplorer";

// You may want to update this according to your real user context:
const DEFAULT_EMAIL = "john.smith@email.com";
const DEFAULT_ROLE = "readonly";

const AccountAndExplorerContainer: React.FC = () => {
  const [role, setRole] = React.useState<string>(DEFAULT_ROLE);

  return (
    <div className="flex flex-col min-h-0 w-full h-full">
      {/* Account top bar */}
      <AccountSection
        account={DEFAULT_EMAIL}
        role={role}
        onRoleChange={setRole}
      />
      {/* Table explorer below */}
      <div className="flex-1 w-full h-full">
        <TableExplorer role={role} />
      </div>
    </div>
  );
};

export default AccountAndExplorerContainer;
