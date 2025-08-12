import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Save, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "../ui/use-toast";
import { DeductionEntries } from "@/src/services/deduction/crewDeduction.api";
import { editDeductionDescription } from "@/src/services/deduction/deductionDescription.api";

// Schema for your DeductionEntries fields
const formSchema = z.object({
  month: z.string().min(1, "Month is required"),
  year: z.number().min(1900, "Year is required"),
  deduction: z.string().min(1, "Deduction name is required"),
  amount: z.number().min(1, "Amount is required"),
  remarks: z.string().optional(),
  status: z.number().min(0, "Status is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface EditDeductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deduction: DeductionEntries;
  setOnSuccess: Dispatch<SetStateAction<boolean>>;
}

export function EditDeductionDialog({
  open,
  onOpenChange,
  deduction,
  setOnSuccess,
}: EditDeductionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      month: deduction.Month || "",
      year: deduction.Year || new Date().getFullYear(),
      deduction: deduction.Deduction || "",
      amount: deduction.Amount || 0,
      remarks: deduction.Remarks || "",
      status: deduction.Status ?? 1,
    },
  });

  useEffect(() => {
    form.reset({
      month: deduction.Month || "",
      year: deduction.Year || new Date().getFullYear(),
      deduction: deduction.Deduction || "",
      amount: deduction.Amount || 0,
      remarks: deduction.Remarks || "",
      status: deduction.Status ?? 1,
    });
  }, [deduction, form]);

//   const onSubmit = async (values: FormValues) => {
//     setIsSubmitting(true);
//     try {
//       const payload = {
//         ...values,
//       };

//       await editDeductionDescription(deduction.DeductionDetailID, payload)
//         .then((response) => {
//           if (response.success) {
//             toast({
//               title: "Success",
//               description: "Deduction updated successfully.",
//               variant: "success",
//             });
//             setOnSuccess(true);
//           } else {
//             toast({
//               title: "Error",
//               description: "Failed to update deduction.",
//               variant: "destructive",
//             });
//           }
//         })
//         .catch((error) => {
//           toast({
//             title: "Error",
//             description: error.message || "Error updating deduction.",
//             variant: "destructive",
//           });
//         });

//       onOpenChange(false);
//     } catch (error) {
//       console.error("Error updating deduction:", error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#FCFCFC]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold text-[#2E37A4]">
            Edit Deduction Entry
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            //onSubmit={form.handleSubmit(onSubmit)}
            className="mt-6 space-y-6"
          >
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deduction</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 text-sm h-11"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 text-sm h-11 bg-[#2E37A4] hover:bg-[#2E37A4]/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
