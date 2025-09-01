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
import { Save } from "lucide-react";
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
  onSuccess?: (data: Partial<UpdateCrewDataForm>) => void;
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
    setIsSubmitting(true);

    try {
      // Return type is explicitly string | undefined
      const buildPayloadField = (
        formValue?: string,
        originalValue?: string | null
      ): string | undefined => {
        const normalizedFormValue = formValue?.trim() ?? "";
        const normalizedOriginalValue = originalValue ?? "";

        if (normalizedFormValue === normalizedOriginalValue) {
          return undefined;
        }

        return normalizedFormValue;
      };

      // Allow only optional keys from UpdateCrewDataForm
      const payload: Partial<UpdateCrewDataForm> = {};

      const sssNumber = buildPayloadField(values.sssNumber, crewGovtTypeData.SSSNumber);
      if (sssNumber !== undefined) payload.sssNumber = sssNumber;

      const taxIdNumber = buildPayloadField(values.taxIdNumber, crewGovtTypeData.TaxIDNumber);
      if (taxIdNumber !== undefined) payload.taxIdNumber = taxIdNumber;

      const philhealthNumber = buildPayloadField(values.philhealthNumber, crewGovtTypeData.PhilHealthNumber);
      if (philhealthNumber !== undefined) payload.philhealthNumber = philhealthNumber;

      const hdmfNumber = buildPayloadField(values.hdmfNumber, crewGovtTypeData.HDMFNumber);
      if (hdmfNumber !== undefined) payload.hdmfNumber = hdmfNumber;

      // Call API only if payload is not empty
      if (Object.keys(payload).length === 0) {
        toast({
          title: "No changes detected",
          description: "No updates to send.",
          variant: "default",
        });
        setIsSubmitting(false);
        return;
      }

      // updateCrew should accept Partial<UpdateCrewDataForm>
      const response = await updateCrew(crewGovtTypeData.CrewCode, payload);

      if (response.success) {
        toast({
          title: "Success",
          description: "Deduction description updated successfully.",
          variant: "success",
        });

        // onSuccess should also accept Partial<UpdateCrewDataForm>
        onSuccess?.(payload);
      } else {
        console.warn("API returned failure response:", response);
      }

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "An error occurred while updating the deduction.",
        variant: "destructive",
      });
    } finally {
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
