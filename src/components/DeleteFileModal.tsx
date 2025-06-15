
import React from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface DeleteFileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string | null;
  type?: "query" | "folder";
  folderIsEmpty?: boolean;
  onConfirm: () => void;
}

const DeleteFileModal: React.FC<DeleteFileModalProps> = ({
  open,
  onOpenChange,
  fileName,
  type = "query",
  folderIsEmpty = true,
  onConfirm,
}) => {
  // Only allow folder delete if empty
  const showCannotDelete = type === "folder" && !folderIsEmpty;
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {type === "folder"
              ? "Delete folder?"
              : "Delete file?"
            }
          </AlertDialogTitle>
          <AlertDialogDescription>
            {type === "folder" ? (
              <>
                Are you sure you want to delete folder <span className="font-medium">{fileName}</span>?
                {showCannotDelete ? (
                  <div className="text-red-600 mt-2">
                    You must remove all queries inside this folder before deleting it.
                  </div>
                ) : (
                  <>This action cannot be undone.</>
                )}
              </>
            ) : (
              <>
                Are you sure you want to delete <span className="font-medium">{fileName}</span>?
                This action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={showCannotDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteFileModal;
