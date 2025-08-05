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
  sssNumber: z
    .string()
    .transform(clean)
    .refine((val) => val === "" || val.length === 10, {
      message: "Must be 10 digits",
    })
    .optional(),

  taxIdNumber: z
    .string()
    .transform(clean)
    .refine((val) => val === "" || (val.length >= 9 && val.length <= 12), {
      message: "Must be 9 to 12 digits",
    })
    .optional(),

  philhealthNumber: z
    .string()
    .transform(clean)
    .refine((val) => val === "" || val.length === 12, {
      message: "Must be 12 digits",
    })
    .optional(),

  hdmfNumber: z
    .string()
    .transform(clean)
    .refine((val) => val === "" || val.length === 12, {
      message: "Must be 12 digits",
    })
    .optional(),
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
  sssNumber: data.SSSNumber ?? "",
  taxIdNumber: data.TaxIDNumber ?? "",
  philhealthNumber: data.PhilHealthNumber ?? "",
  hdmfNumber: data.HDMFNumber ?? "",
});

//  Maps form data to backend format
const mapFormToApiData = (formData: CrewGovtFormData): UpdateCrewDataForm => ({
  sssNumber: formData.sssNumber?.replace(/[-–—]/g, ""),
  tinNumber: formData.taxIdNumber?.replace(/[-–—]/g, ""),
  philhealthNumber: formData.philhealthNumber?.replace(/-/g, ""),
  hdmfNumber: formData.hdmfNumber?.replace(/-/g, ""),
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
  //console.log("Submitted Form Values (raw):", values);

  if (!crewGovtTypeData.CrewCode) {
    console.error("Missing CrewCode");
    toast({
      title: "Error",
      description: "Missing crew code.",
      variant: "destructive",
    });
    return;
  }

  setIsSubmitting(true);
  //console.log("Submitting...");

  try {
    // Remove keys with empty, null, or undefined values
    const filteredPayload = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v?.toString().trim() !== "")
    );

    //console.log("Mapped API Payload:", filteredPayload);

    const response = await updateCrew(crewGovtTypeData.CrewCode, filteredPayload);
    //console.log("API Response:", response);

    if (response.success) {
      toast({
        title: "Crew Government Details Updated",
        description: "The government details were successfully updated.",
        variant: "success",
      });

        setSelectedCrewData?.((prev) => {
        if (!prev) return prev;
        return {
            ...prev,
            ...(filteredPayload.sssNumber !== undefined && { SSSNumber: filteredPayload.sssNumber }),
            ...(filteredPayload.tinNumber !== undefined && { TaxIDNumber: filteredPayload.tinNumber }),
            ...(filteredPayload.philhealthNumber !== undefined && { PhilHealthNumber: filteredPayload.philhealthNumber }),
            ...(filteredPayload.hdmfNumber !== undefined && { HDMFNumber: filteredPayload.hdmfNumber }),
        };
        });

      onSuccess?.(filteredPayload);
      onOpenChange(false);
    } else {
      throw new Error("Failed to update crew government records.");
    }
  } catch (err: any) {
    console.error("Submission Error:", err);
    toast({
      title: "Update Failed",
      description: err.message || "An unexpected error occurred.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
    //console.log("Submission complete.");
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
