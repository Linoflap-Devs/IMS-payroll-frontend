import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  processApplication,
  ProcessApplicationResponse,
} from "@/src/services/application_crew/application.api";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { UsersItem } from "@/src/services/users/users.api";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  SelectedUserData : UsersItem;
  onSuccess?: () => void;
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  SelectedUserData,
  onSuccess,
}: DeleteUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  console.log('SELECTED DATA:', SelectedUserData);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] gap-0 border rounded-lg overflow-hidden bg-[#FCFCFC] px-10">
        <div className="p-6 pb-8">
          <div className="flex justify-between items-center mb-8">
            <DialogTitle className="text-2xl font-bold text-[#2F3593]">
              Delete User
            </DialogTitle>
          </div>
          

          
        </div>
      </DialogContent>
    </Dialog>
  );
}
