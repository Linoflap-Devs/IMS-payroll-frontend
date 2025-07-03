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

interface DeleteAllotteeReqDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestData: {
    AllotteeRequestID: number;
    ApplicationRequestID: number;
    TargetID: number | null;
    AllotteeName: string;
    RelationID: number;
    Relation: string;
    ContactNumber: string;
    Address: string;
    CityID: number;
    City: string;
    ProvinceID: number;
    Province: string;
    BankID: number;
    Bank: string;
    BankBranchID: number;
    BankBranch: string;
    AccountNumber: string;
    Allotment: number;
  };
  onSuccess?: () => void;
}

export function DeleteAllotteeReqDialog({
  open,
  onOpenChange,
  requestData,
  onSuccess,
}: DeleteAllotteeReqDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const handleClose = () => onOpenChange(false);

  const handleProcess = async (status: number) => {
    setIsSubmitting(true);
    try {
      const response: ProcessApplicationResponse = await processApplication(
        requestData.ApplicationRequestID,
        status
      );

      if (response.success) {
        toast({
          title: "Success",
          description: `Delete request ${
            status === 2 ? "approved" : "declined"
          } successfully`,
          variant: "default",
        });
        if (onSuccess) {
          onSuccess();
        }
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to process delete request",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error processing delete request:", err);
      toast({
        title: "Error",
        description:
          err.message ||
          "An error occurred while processing the delete request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[700px] gap-0 border rounded-lg overflow-hidden bg-[#FCFCFC] px-2">
        <div className="p-6 pb-8">
          <div className="flex justify-center items-center mb-8">
            <DialogTitle className="text-2xl font-bold text-[#2F3593] items-center">
              View Delete Allottee Request
            </DialogTitle>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="allotteeName"
                  className="block text-sm font-medium text-gray-500">
                  Allottee Name
                </label>
                <Input
                  id="allotteeName"
                  value={requestData.AllotteeName}
                  className="w-full bg-gray-50"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="relation"
                  className="block text-sm font-medium text-gray-500">
                  Relationship
                </label>
                <Input
                  id="relation"
                  value={requestData.Relation}
                  className="w-full bg-gray-50"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="contactNumber"
                  className="block text-sm font-medium text-gray-500">
                  Contact Number
                </label>
                <Input
                  id="contactNumber"
                  value={requestData.ContactNumber}
                  className="w-full bg-gray-50"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-500">
                  Address
                </label>
                <Input
                  id="address"
                  value={requestData.Address}
                  className="w-full bg-gray-50"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-500">
                  City
                </label>
                <Input
                  id="city"
                  value={requestData.City}
                  className="w-full bg-gray-50"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="province"
                  className="block text-sm font-medium text-gray-500">
                  Province
                </label>
                <Input
                  id="province"
                  value={requestData.Province}
                  className="w-full bg-gray-50"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="bank"
                  className="block text-sm font-medium text-gray-500">
                  Bank
                </label>
                <Input
                  id="bank"
                  value={requestData.Bank}
                  className="w-full bg-gray-50"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="bankBranch"
                  className="block text-sm font-medium text-gray-500">
                  Bank Branch
                </label>
                <Input
                  id="bankBranch"
                  value={requestData.BankBranch}
                  className="w-full bg-gray-50"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="accountNumber"
                  className="block text-sm font-medium text-gray-500">
                  Account Number
                </label>
                <Input
                  id="accountNumber"
                  value={requestData.AccountNumber}
                  className="w-full bg-gray-50"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="allotment"
                  className="block text-sm font-medium text-gray-500">
                  Allotment Amount
                </label>
                <Input
                  id="allotment"
                  value={`${requestData.Allotment}%`}
                  className="w-full bg-gray-50"
                  disabled
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                className="flex-1 bg-[#2F3593] text-white hover:bg-[#252a72] hover:color-[#fffff] rounded-md p-5"
                onClick={() => handleClose()}
                disabled={isSubmitting}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
