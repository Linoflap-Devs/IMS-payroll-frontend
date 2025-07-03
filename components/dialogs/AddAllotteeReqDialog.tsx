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

interface AddAllotteeReqDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedApplicationStatus: string;
  selectedApplicationOperation: string;
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

export function AddAllotteeReqDialog({
  open,
  onOpenChange,
  selectedApplicationStatus,
  selectedApplicationOperation,
  requestData,
  onSuccess,
}: AddAllotteeReqDialogProps) {
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
          description: `Application ${
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
          description: response.message || "Failed to process application",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error processing application:", err);
      toast({
        title: "Error",
        description:
          err.message || "An error occurred while processing the application",
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
            <DialogTitle className="text-2xl font-bold text-[#2F3593]">
              Allottee Application Details
            </DialogTitle>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="allotteeName"
                  className="block text-sm font-medium text-gray-500"
                >
                  Allottee Name
                </label>
                <Input
                  id="allotteeName"
                  value={requestData.AllotteeName}
                  className="w-full bg-white text-black"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="relation"
                  className="block text-sm font-medium text-gray-500"
                >
                  Relationship
                </label>
                <Input
                  id="relation"
                  value={requestData.Relation}
                  className="w-full bg-white text-black"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="contactNumber"
                  className="block text-sm font-medium text-gray-500"
                >
                  Contact Number
                </label>
                <Input
                  id="contactNumber"
                  value={requestData.ContactNumber}
                  className="w-full bg-white text-black"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-500"
                >
                  Address
                </label>
                <Input
                  id="address"
                  value={requestData.Address}
                  className="w-full bg-white text-black"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-500"
                >
                  City
                </label>
                <Input
                  id="city"
                  value={requestData.City}
                  className="w-full bg-white text-black"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="province"
                  className="block text-sm font-medium text-gray-500"
                >
                  Province
                </label>
                <Input
                  id="province"
                  value={requestData.Province}
                  className="w-full bg-white text-black"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="bank"
                  className="block text-sm font-medium text-gray-500"
                >
                  Bank
                </label>
                <Input
                  id="bank"
                  value={requestData.Bank}
                  className="w-full bg-white text-black"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="bankBranch"
                  className="block text-sm font-medium text-gray-500"
                >
                  Bank Branch
                </label>
                <Input
                  id="bankBranch"
                  value={requestData.BankBranch}
                  className="w-full bg-white text-black"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="accountNumber"
                  className="block text-sm font-medium text-gray-500"
                >
                  Account Number
                </label>
                <Input
                  id="accountNumber"
                  value={requestData.AccountNumber}
                  className="w-full bg-white text-black"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="allotment"
                  className="block text-sm font-medium text-gray-500"
                >
                  Allotment Amount
                </label>
                <Input
                  id="allotment"
                  value={`${requestData.Allotment}%`}
                  className="w-full bg-white text-black"
                  disabled
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              {selectedApplicationStatus !== "Approved" && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md"
                    onClick={() => handleProcess(3)}
                    disabled={isSubmitting}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Processing..." : "Decline"}
                  </Button>

                  <Button
                    type="button"
                    className="flex-1 bg-[#2F3593] text-white hover:bg-[#252a72] rounded-md p-5"
                    onClick={() => handleProcess(2)}
                    disabled={
                      isSubmitting || selectedApplicationStatus === "Approved"
                    }
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Processing..." : "Approve Request"}
                  </Button>
                </>
              )}

              {selectedApplicationStatus === "Approved" && (
                <Button
                  type="button"
                  className="flex-1 bg-[#2F3593] text-white hover:bg-[#252a72] rounded-md p-5"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
