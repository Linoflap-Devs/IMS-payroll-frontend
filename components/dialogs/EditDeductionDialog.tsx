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
import { DeductionEntries, updateCrewDeductionEntry } from "@/src/services/deduction/crewDeduction.api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const formSchema = z.object({
  deductionAmount: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: "Amount is required and must be a number >= 1",
    }),
  deductionRemarks: z.string().optional(),
  //status: z.number().min(0, "Status is required"),
  deductionDate: z.string().min(1, "Deduction date is required."),
});

type FormValues = z.infer<typeof formSchema>;

interface EditDeductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deduction: DeductionEntries;
  crewCode: string;
  setOnSuccess: Dispatch<SetStateAction<boolean>>;
}

export function EditDeductionDialog({
  open,
  onOpenChange,
  deduction,
  setOnSuccess,
  crewCode,
}: EditDeductionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log('DEDUCTION: ', deduction);

  // const statusMap = {
  //   0: "Pending",
  //   1: "Completed",
  // };

  // const numericStatus =
  //   typeof deduction.Status === "string" && deduction.Status in statusMap
  //     ? statusMap[deduction.Status]
  //     : 0;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deductionAmount: deduction.Amount || 0,
      deductionRemarks: deduction.Remarks || "",
      deductionDate:
        deduction.DeductionDate instanceof Date
          ? deduction.DeductionDate.toISOString().split("T")[0]
          : (deduction.DeductionDate || ""),
      //status: 0,
    },
  });

  useEffect(() => {
    form.reset({
      deductionAmount: deduction.Amount || 0,
      deductionRemarks: deduction.Remarks || "",
      deductionDate:
        deduction.DeductionDate instanceof Date
          ? deduction.DeductionDate.toISOString().split("T")[0]
          : (deduction.DeductionDate || ""),
      //status: 0,
    });
  }, [deduction, form]);

  const onSubmit = async (values: FormValues) => {
    console.log("onSubmit called with values:", values);
    setIsSubmitting(true);

    try {
      const payload = {
        ...values,
        deductionAmount: Number(values.deductionAmount), // ensure number
        deductionDate: new Date(values.deductionDate),   // FIX: use values not FormValues
        status: 0, // force status to 0 (Pending)
      };

      console.log("Payload prepared for update (forced status=0):", payload);

      const response = await updateCrewDeductionEntry(
        crewCode,
        deduction.DeductionDetailID,
        payload
      );

      if (response.success) {
        toast({
          title: "Success",
          description: "Deduction updated successfully.",
          variant: "success",
        });
        setOnSuccess(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to update deduction.",
          variant: "destructive",
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error updating deduction (catch block):", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Error updating deduction.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-6 space-y-6"
          >






            
            <FormField
              control={form.control}
              name="deductionAmount"
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
              name="deductionRemarks"
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

            {/* <FormField
              control={form.control}
              name="status"
              render={({ field }) => {
                console.log("statusMap entries:", Object.entries(statusMap));
                console.log("field value:", field.value);

                return (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value.toString()}
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <SelectTrigger className="w-full border border-[#E0E0E0] rounded-md">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="h-40">
                          {Object.entries(statusMap).map(([label, value]) => (
                            <SelectItem key={value} value={value.toString()}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            /> */}

            <FormField
              control={form.control}
              name="deductionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deduction Date</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
