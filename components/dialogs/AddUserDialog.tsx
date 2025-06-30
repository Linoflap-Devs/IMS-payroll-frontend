"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { toast } from "../ui/use-toast";
import {
  AddUserPayload,
  addUsers,
  UsersItem,
} from "@/src/services/users/users.api";
import { cn } from "@/lib/utils";

const userSchema = z.object({
  email: z.string().nonempty("Email is required").email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.coerce
    .number({
      required_error: "Please select a role",
      invalid_type_error: "Please select a role",
    })
    .refine((val) => !isNaN(val), {
      message: "Please select a valid role",
    }),
});

type UserFormValues = z.infer<typeof userSchema>;

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newUser: UsersItem) => void;
}

export function AddUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddUserDialogProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      role: undefined,
    },
  });

  const { reset, formState } = form;
  const { isSubmitting } = formState;

  const roleOptions = [
    { label: "System Admin", value: 1 },
    { label: "Payroll Admin", value: 3 },
    { label: "Payroll Staff", value: 4 },
    { label: "Accounting Staff", value: 5 },
  ];

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onSubmit = async (data: UserFormValues) => {
    try {
      const payload: AddUserPayload = {
        ...data,
        role: data.role,
      };

      //console.log("SUBMITTING DATA:", payload);
      const response = await addUsers(payload);
      if (response?.success) {
        onSuccess(response.data[0]);
        toast({
          title: "User Created",
          description:
            "The user has been successfully added. Ask the user to verify their email.",
          variant: "success",
        });
        onOpenChange(false);
        reset();
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to create user",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error(err);

      // Check for Prisma unique constraint error
      if (
        err.response?.data?.message?.includes("Unique constraint failed") ||
        err.message?.includes("Unique constraint failed")
      ) {
        toast({
          title: "Email Already Taken",
          description:
            "This email is already registered. Please use another one.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: err?.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#FCFCFC] p-10">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold text-[#2E37A4]">
            Add User
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full mt-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* First Name */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="w-full gap-1 mt-1">
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="w-full gap-1 mt-1">
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="w-full gap-1 mt-1">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field, fieldState }) => (
                <FormItem className="w-full gap-1 mt-1">
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={
                        field.value !== undefined
                          ? field.value.toString()
                          : undefined
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full rounded-md h-10 gap-1",
                          fieldState.invalid
                            ? "border-red-500 focus:ring-red-500"
                            : "border-[#E0E0E0]"
                        )}
                      >
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem
                            key={role.value}
                            value={role.value.toString()}
                          >
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
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
                className="flex-1 bg-[#2E37A4] hover:bg-[#2E37A4]/90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Adding..."
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
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
