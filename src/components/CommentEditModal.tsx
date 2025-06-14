
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CommentEditModalProps {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

const CommentEditModal: React.FC<CommentEditModalProps> = ({
  open,
  value,
  onChange,
  onSave,
  onClose,
}) => {
  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Tab Comment</DialogTitle>
          <DialogDescription>
            Add or update a comment for this tab.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="mb-4"
          autoFocus
        />
        <DialogFooter>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommentEditModal;
