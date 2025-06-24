"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import {
  addCrewRemittance,
  type AddCrewRemittanceData,
  type AllotteeOption,
} from "@/src/services/remittance/crewRemittance.api";
import { toast } from "../ui/use-toast";
import { addDeductionGovtRates } from "@/src/services/deduction/governmentDeduction.api";

interface SSSDeductionFormValues {
  year: string | number;
  salaryFrom: string | number;
  salaryTo: string | number;
  eePremium: string | number;
  eePremiumRate: string | number;
  regularSS: string | number;
  mutualFund: string | number;
  ec: string | number;
  eess: string | number;
  erss: string | number;
  eemf: string | number;
  ermf: string | number;
}

const formSchema = z.object({
  allotteeID: z.string().min(1, "Please select an allottee"),
  amount: z
    .string()
    .min(1, "Please enter an amount")
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      },
      { message: "Please enter a valid amount greater than 0" }
    ),
  remarks: z.string().min(1, "Please enter remarks"),
  status: z.string().min(1, "Please select a status"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddSSSRateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  onSuccess: () => void;
}

export function AddSSSRateDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddSSSRateDialogProps) {
  const form = useForm<SSSDeductionFormValues>({
    defaultValues: {
      year: "",
      salaryFrom: "",
      salaryTo: "",
      eePremium: "",
      eePremiumRate: "",
      regularSS: "",
      mutualFund: "",
      ec: "",
      eess: "",
      erss: "",
      eemf: "",
      ermf: "",
    },
  });

  const { reset, formState } = form;
  const { isSubmitting } = formState;
  const years = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: SSSDeductionFormValues) => {
    console.log("Submitted Form Data:", data);
    try {
      const payload = {
        type: "SSS" as const,
        data: {
          year: Number(data.year),
          salaryFrom: Number(data.salaryFrom),
          salaryTo: Number(data.salaryTo),
          eePremium: Number(data.eePremium),
          eePremiumRate: Number(data.eePremiumRate),
          regularSS: Number(data.regularSS),
          mutualFund: Number(data.mutualFund),
          ec: Number(data.ec),
          eess: Number(data.eess),
          erss: Number(data.erss),
          eemf: Number(data.eemf),
          ermf: Number(data.ermf),
        },
      };
      console.log("Payload to API:", payload);

      const response = await addDeductionGovtRates(payload);

      if (response && response.success) {
        onSuccess?.();      // Optional callback
        onOpenChange(false);
        reset();

        toast({
          title: "SSS Deduction Added",
          description: "The SSS deduction rate has been successfully added.",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to add SSS deduction",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding SSS deduction:", error);
      const err = error as Error;
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#FCFCFC] p-10">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold text-[#2E37A4]">
            Add Contribution Rate
          </DialogTitle>
          {/* <DialogDescription className="text-center text-sm text-gray-600">
            Add a new remittance entry for the selected allottee
          </DialogDescription> */}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-4">
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-sm text-gray-600 font-medium">
                    Select Year
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value?.toString() || ""}
                    >
                      <SelectTrigger className="w-full border border-[#E0E0E0] rounded-md h-10">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {years.map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-4 my-6">
              <FormField
                control={form.control}
                name="salaryFrom"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm text-gray-600 font-medium">
                      Salary From
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value?.toString() || ""}
                      >
                        <SelectTrigger className="w-full border border-[#E0E0E0] rounded-md h-10">
                          <SelectValue placeholder="Select starting year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={String(year)}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salaryTo"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm text-gray-600 font-medium">
                      Salary To
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value?.toString() || ""}
                      >
                        <SelectTrigger className="w-full border border-[#E0E0E0] rounded-md h-10">
                          <SelectValue placeholder="Select ending year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={String(year)}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 my-6">
              <FormField
                control={form.control}
                name="regularSS"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm text-gray-600 font-medium">
                      Regular SS
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        step="0.01"
                        min="0.01"
                        placeholder="Enter Regular SS"
                        className="border border-[#E0E0E0] rounded-md"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mutualFund"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm text-gray-600 font-medium">
                      Mutual Fund
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        step="0.01"
                        min="0.01"
                        placeholder="Enter Mutual Fund"
                        className="border border-[#E0E0E0] rounded-md"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 my-6">
              <FormField
                control={form.control}
                name="erss"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm text-gray-600 font-medium">
                      ERSS
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        step="0.01"
                        min="0.01"
                        placeholder="Enter ERSS"
                        className="border border-[#E0E0E0] rounded-md"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ermf"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm text-gray-600 font-medium">
                      ERMF
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        step="0.01"
                        min="0.01"
                        placeholder="Enter ERMF"
                        className="border border-[#E0E0E0] rounded-md"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 my-6">
              <FormField
                control={form.control}
                name="ec"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm text-gray-600 font-medium">
                      EC
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        step="0.01"
                        min="0.01"
                        placeholder="Enter EC"
                        className="border border-[#E0E0E0] rounded-md"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eess"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm text-gray-600 font-medium">
                      EESS
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        step="0.01"
                        min="0.01"
                        placeholder="Enter EESS"
                        className="border border-[#E0E0E0] rounded-md"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 my-6">
              <FormField
                control={form.control}
                name="eemf"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm text-gray-600 font-medium">
                      EEMF
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        step="0.01"
                        min="0.01"
                        placeholder="Enter EEMF"
                        className="border border-[#E0E0E0] rounded-md"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 text-sm"
                onClick={() => {
                  onOpenChange(false);
                  reset();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 text-sm bg-[#2E37A4] hover:bg-[#2E37A4]/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Adding..."
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add SSS year
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
