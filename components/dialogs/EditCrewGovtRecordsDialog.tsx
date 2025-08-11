"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { updateCrew, CrewItem, UpdateCrewDataForm } from "@/src/services/crew/crew.api";
import { Pencil } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema
const clean = (val: string | undefined) => val?.replace(/[^0-9]/g, "") || "";

// Schema with sanitization
const crewGovtSchema = z.object({
  sssNumber: z.preprocess(
    (val) => {
      const cleaned = clean(String(val ?? ""));
      return cleaned === "" ? undefined : cleaned;
    },
    z.string().length(10, { message: "Must be 10 digits" }).optional()
  ),
  taxIdNumber: z.preprocess(
    (val) => {
      const cleaned = clean(String(val ?? ""));
      return cleaned === "" ? undefined : cleaned;
    },
    z.string()
      .min(9, { message: "Must be 9 to 12 digits" })
      .max(12, { message: "Must be 9 to 12 digits" })
      .optional()
  ),
  philhealthNumber: z.preprocess(
    (val) => {
      const cleaned = clean(String(val ?? ""));
      return cleaned === "" ? undefined : cleaned;
    },
    z.string().length(12, { message: "Must be 12 digits" }).optional()
  ),
  hdmfNumber: z.preprocess(
    (val) => {
      const cleaned = clean(String(val ?? ""));
      return cleaned === "" ? undefined : cleaned;
    },
    z.string().length(12, { message: "Must be 12 digits" }).optional()
  ),
});

type CrewGovtFormData = z.infer<typeof crewGovtSchema>;

interface EditCrewGovtRecordsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crewGovtTypeData: CrewItem;
  onSuccess?: (updatedData: CrewGovtFormData) => void;
  setSelectedCrewData?: React.Dispatch<React.SetStateAction<CrewItem | null>>;
}

//  Maps backend data to form format
const mapCrewDataToForm = (data: CrewItem): CrewGovtFormData => ({
  sssNumber: data.SSSNumber || undefined,
  taxIdNumber: data.TaxIDNumber || undefined,
  philhealthNumber: data.PhilHealthNumber || undefined,
  hdmfNumber: data.HDMFNumber || undefined,
});

export function EditCrewGovtRecordsDialog({
  open,
  onOpenChange,
  crewGovtTypeData,
  onSuccess,
  setSelectedCrewData
}: EditCrewGovtRecordsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<CrewGovtFormData>({
    resolver: zodResolver(crewGovtSchema),
    defaultValues: mapCrewDataToForm(crewGovtTypeData),
  });

  const { reset } = form;

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset(mapCrewDataToForm(crewGovtTypeData));
    }
  }, [open, crewGovtTypeData, reset]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      setIsSubmitting(false);
    }
    onOpenChange(open);
  };

  const onSubmit = async (values: CrewGovtFormData) => {
    console.log("Form submitted with values:", values);
    setIsSubmitting(true);

    try {
      // Step 1: Build initial payload with null for empty strings
      const rawPayload = {
        sssNumber: values.sssNumber?.trim() === "" ? null : values.sssNumber,
        tinNumber: values.taxIdNumber?.trim() === "" ? null : values.taxIdNumber,
        philhealthNumber:
          values.philhealthNumber?.trim() === "" ? null : values.philhealthNumber,
        hdmfNumber: values.hdmfNumber?.trim() === "" ? null : values.hdmfNumber,
      };

      // Step 2: Remove null values for API
      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(([_, value]) => value !== null)
      );

      console.log("Payload to send to API:", payload);

      // Step 3: Call API
      const response = await updateCrew(crewGovtTypeData.CrewCode, payload);
      console.log("API Response:", response);

      if (response.success) {
        toast({
          title: "Success",
          description: "Deduction description updated successfully.",
          variant: "success",
        });

        // Step 4: Build updatedData for onSuccess
        const updatedData = Object.fromEntries(
          Object.entries({
            sssNumber: payload.sssNumber,
            philhealthNumber: payload.philhealthNumber,
            hdmfNumber: payload.hdmfNumber,
            taxIdNumber: payload.tinNumber,
          }).filter(([_, value]) => value !== undefined)
        );

        console.log("Data passed to onSuccess:", updatedData);
        onSuccess?.(updatedData);
      } else {
        console.warn("API returned failure response:", response);
      }

      console.log("Closing modal...");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating deduction:", error);
      toast({
        title: "Error",
        description:
          error.message || "An error occurred while updating the deduction.",
        variant: "destructive",
      });
    } finally {
      console.log("Finished submit process.");
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#FCFCFC] p-10">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold text-[#2E37A4]">
            Edit Crew Government Records
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 mt-3 mb-6">
              {[
                ["sssNumber", "SSS Number"],
                ["philhealthNumber", "PhilHealth Number"],
                ["taxIdNumber", "Tax ID Number"],
                ["hdmfNumber", "HDMF Number"],
              ].map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof CrewGovtFormData}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-600 font-medium">
                        {label}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder={`Enter ${label}`}
                          className="border border-[#E0E0E0] rounded-md"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 text-sm"
                onClick={() => handleOpenChange(false)}
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
                  "Updating..."
                ) : (
                  <>
                    <Pencil className="w-4 h-4 mr-2" />
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
