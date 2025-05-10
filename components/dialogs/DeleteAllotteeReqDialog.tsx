import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
}

export function DeleteAllotteeReqDialog({
  open,
  onOpenChange,
  requestData,
}: DeleteAllotteeReqDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-[800px] gap-0 border rounded-lg overflow-hidden bg-[#FCFCFC]">
        <div className="p-6 pb-8">
          <div className="flex justify-between items-center mb-8">
            <DialogTitle className="text-center text-2xl font-bold text-[#2F3593]">
              Delete Allottee Request Details
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
                  className="w-full bg-gray-50"
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
                  className="w-full bg-gray-50"
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
                  className="w-full bg-gray-50"
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
                  className="w-full bg-gray-50"
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
                  className="w-full bg-gray-50"
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
                  className="w-full bg-gray-50"
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
                  className="w-full bg-gray-50"
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
                  className="w-full bg-gray-50"
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
                  className="w-full bg-gray-50"
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
                  className="w-full bg-gray-50"
                  disabled
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Decline
              </Button>
              <Button
                type="button"
                className="flex-1 bg-red-700 text-white hover:bg-red-500 rounded-md"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve Delete Request
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
