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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { addWageDescription } from "@/src/services/wages/wageDescription.api";

interface AddWageDescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newWageDescription: any) => void;
}

// Form validation schema
const formSchema = z.object({
  wageCode: z.string().min(1, "Wage code is required"),
  wageName: z.string().min(1, "Wage name is required"),
  payableOnBoard: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddWageDescriptionDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddWageDescriptionDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wageCode: "",
      wageName: "",
      payableOnBoard: false,
    },
  });

  const handleFormSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const AddWageDescriptionPayload = {
        wageCode: values.wageCode.trim(),
        wageName: values.wageName.trim(),
        wagePayableOnBoard: values.payableOnBoard ? 1 : 0,
      };

      const UIPayload = {
        WageCode: AddWageDescriptionPayload.wageCode,
        WageName: AddWageDescriptionPayload.wageName,
        PayableOnBoard: AddWageDescriptionPayload.wagePayableOnBoard ? 1 : 0,
      };

      addWageDescription(AddWageDescriptionPayload)
        .then(() => {
          toast({
            title: "Success",
            description: "Wage description added successfully",
            variant: "success",
          });

          if (onSuccess) {
            onSuccess(UIPayload);
          }

          // Reset form and close dialog
          form.reset();
          onOpenChange(false);
        })
        .catch(() => {
          toast({
            title: "Error",
            description: "Failed to add wage description",
            variant: "destructive",
          });
        });
    } catch (error) {
      console.error("Error adding wage description:", error);
      toast({
        title: "Error",
        description: "Failed to add wage description",
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
          <DialogTitle className="text-center text-lg font-semibold text-[#2E37A4]">
            Add Wage Description
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="mt-6 space-y-6">
            <FormField
              control={form.control}
              name="wageCode"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel className="text-sm text-gray-600">
                    Wage Code
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border border-[#E0E0E0] rounded-md"
                      placeholder="Enter wage code"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wageName"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel className="text-sm text-gray-600">
                    Wage Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border border-[#E0E0E0] rounded-md"
                      placeholder="Enter wage name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payableOnBoard"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel className="text-sm text-gray-600">
                    Payable On Board
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "yes")}
                    defaultValue={field.value ? "yes" : "no"}>
                    <FormControl>
                      <SelectTrigger className="w-full border border-[#E0E0E0] rounded-md">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 text-sm h-11"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 text-sm h-11 bg-[#2E37A4] hover:bg-[#2E37A4]/90"
                disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
