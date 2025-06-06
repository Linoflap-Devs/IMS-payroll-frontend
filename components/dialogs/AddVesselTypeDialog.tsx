import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { addVesselType } from "@/src/services/vessel/vesselType.api";
import { VesselTypeItem } from "@/src/services/vessel/vesselType.api";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AxiosError } from "axios";
import { useState } from "react";

// Define form schema with Zod
const formSchema = z.object({
  vesselTypeCode: z.string().min(1, "Vessel Code is required"),
  vesselTypeName: z.string().min(1, "Vessel Type Name is required"),
});

// Type for form values
type FormValues = z.infer<typeof formSchema>;

interface AddVesselTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newVesselType: VesselTypeItem) => void;
}

export function AddVesselTypeDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddVesselTypeDialogProps) {
  const { toast } = useToast();

  // Initialize react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vesselTypeCode: "",
      vesselTypeName: "",
    },
  });

  const [uniqueError, setUniqueError] = useState<boolean>(false);

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  // Reset form when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setUniqueError(false);
      reset();
    }
    onOpenChange(open);
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setUniqueError(false);
    try {
      const response = await addVesselType({
        vesselTypeCode: data.vesselTypeCode.trim(),
        vesselTypeName: data.vesselTypeName.trim(),
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Vessel type added successfully.",
          variant: "success",
        });

        // Call success callback with the new vessel type if provided
        if (onSuccess && response.data) {
          // Ensure we pass a single VesselTypeItem
          const vesselTypeData = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          onSuccess(vesselTypeData);
        }

        // Close the dialog
        handleOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add vessel type.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const err = error as Error;

      if (err instanceof AxiosError) {
        if (err.response?.data?.message.includes("Unique constraint failed")) {
          toast({
            title: "Error",
            description: "Vessel type code or name already exists.",
            variant: "destructive",
          });

          setUniqueError(true);
          return;
        }
      }

      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try agains.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-4 bg-[#FCFCFC]">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold text-primary w-full text-center">
              Add Vessel Type
            </DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 flex flex-col space-y-6">
            <FormField
              control={form.control}
              name="vesselTypeCode"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel
                    className={`text-sm text-gray-600 ${
                      uniqueError ? "text-red-500" : ""
                    }`}>
                    Vessel Code
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter vessel code"
                      className={`h-10 ${
                        uniqueError
                          ? "border-destructive focus:!ring-destructive/50"
                          : ""
                      }`}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vesselTypeName"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel
                    className={`text-sm text-gray-600 ${
                      uniqueError ? "text-red-500" : ""
                    }`}>
                    Vessel Type Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter vessel type"
                      className={`h-10 ${
                        uniqueError
                          ? "border-destructive focus:!ring-destructive/50"
                          : ""
                      }`}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-10"
                onClick={() => {
                  setUniqueError(false);
                  handleOpenChange(false);
                }}
                disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-10"
                disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Vessel Type"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
