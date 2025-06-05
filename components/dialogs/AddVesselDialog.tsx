import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
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

import { addVessel } from "@/src/services/vessel/vessel.api";
import { VesselItem } from "@/src/services/vessel/vessel.api";
import { useToast } from "@/components/ui/use-toast";
import {
  getVesselTypeList,
  VesselTypeItem,
} from "@/src/services/vessel/vesselType.api";
import {
  getVesselPrincipalList,
  VesselPrincipalItem,
} from "@/src/services/vessel/vesselPrincipal.api";

import { addVesselSchema } from "@/lib/zod-validations";
// Form schema with validation

type FormValues = z.infer<typeof addVesselSchema>;

interface AddVesselDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newVessel: VesselItem) => void;
}

export function AddVesselDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddVesselDialogProps) {
  const [vesselTypes, setVesselTypes] = useState<VesselTypeItem[]>([]);
  const [principals, setPrincipals] = useState<VesselPrincipalItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(addVesselSchema),
    defaultValues: {
      vesselCode: "",
      vesselName: "",
      vesselType: "",
      principalName: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesResponse, principalsResponse] = await Promise.all([
          getVesselTypeList(),
          getVesselPrincipalList(),
        ]);

        if (typesResponse.success && Array.isArray(typesResponse.data)) {
          setVesselTypes(typesResponse.data);
        }

        if (principalsResponse.success) {
          setPrincipals(principalsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching vessel types and principals:", error);
        toast({
          title: "Error",
          description: "Failed to fetch vessel types and principals",
          variant: "destructive",
        });
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, toast]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setIsSubmitting(false);
    }
    onOpenChange(open);
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await addVessel({
        vesselCode: data.vesselCode.trim(),
        vesselName: data.vesselName.trim(),
        vesselType: Number(data.vesselType),
        vesselPrincipal: Number(data.principalName),
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Vessel added successfully.",
          variant: "success",
        });

        // Call the onSuccess callback if provided
        if (onSuccess && response.data) {
          // Ensure we pass a single VesselItem
          const vesselData = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          onSuccess(vesselData);
        }

        handleOpenChange(false); // Close the dialog after success
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add vessel.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding vessel:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 max-w-[600px] gap-0 border rounded-lg overflow-hidden bg-[#FCFCFC]">
        <div className="p-6 pb-8">
          <div className="flex justify-center items-center mb-8">
            <DialogTitle className="text-2xl font-bold text-[#2F3593]">
              Add Vessel
            </DialogTitle>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="">
              <div className="grid grid-cols-2 gap-x-6">
                <FormField
                  control={form.control}
                  name="vesselCode"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>Vessel Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter vessel code"
                          {...field}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vesselName"
                  render={({ field }) => (
                    <FormItem className="mt-5 col-span-2">
                      <FormLabel>Vessel Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter vessel name"
                          {...field}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vesselType"
                  render={({ field }) => (
                    <FormItem className="mt-5 col-span-2">
                      <FormLabel>Vessel Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select vessel type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vesselTypes.map((type) => (
                            <SelectItem
                              key={type.VesselTypeID}
                              value={type.VesselTypeID.toString()}>
                              {type.VesselTypeName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="principalName"
                  render={({ field }) => (
                    <FormItem className="mt-5 col-span-2">
                      <FormLabel>Principal Name</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select principal name" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {principals.map((principal) => (
                            <SelectItem
                              key={principal.PrincipalID}
                              value={principal.PrincipalID.toString()}>
                              {principal.PrincipalName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="flex gap-4 pt-6 mt-5">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-gray-300 rounded-md text-black hover:bg-gray-100 hover:text-black">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="flex-1 bg-[#2F3593] text-white hover:bg-[#252a72] rounded-md"
                  disabled={isSubmitting}>
                  <Plus className="mr-2 h-4 w-4" /> Add Vessel
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
