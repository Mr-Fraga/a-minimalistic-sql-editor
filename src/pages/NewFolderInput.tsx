
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const NewFolderInput = ({
  newFolderName,
  setNewFolderName,
  onCreate,
  onCancel
}: {
  newFolderName: string;
  setNewFolderName: (s: string) => void;
  onCreate: () => void;
  onCancel: () => void;
}) => (
  <div className="mb-4 flex gap-2 items-center">
    <Input
      autoFocus
      placeholder="Enter folder name"
      value={newFolderName}
      onChange={e => setNewFolderName(e.target.value)}
      className="w-64"
    />
    <Button size="sm" onClick={onCreate} disabled={!newFolderName.trim()}>Create</Button>
    <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
  </div>
);

export default NewFolderInput;
