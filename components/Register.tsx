"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import Link from "next/link";

const formSchema = z
  .object({
    lastName: z.string().min(1, {
      message: "Last name is required.",
    }),
    firstName: z.string().min(1, {
      message: "First name is required.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lastName: "",
      firstName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to dashboard after successful registration
      router.push("/home/dashboard");
    }, 1000);
  }

  return (
    <div className="w-[550px] px-6">
      <Card className="w-full p-14 bg-[#FDFDFD] shadow-[2px_2px_25%_#C1BAD840] rounded-xl border-0">
        <div className="mb-0 mt-4">
          <h2 className="flex justify-center text-4xl font-semibold text-[#1F279C] mb-2">
            Create Account
          </h2>
        </div>
        <div className="space-y-0">
          <div className="mb-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-0">
                <div className="mb-10 space-y-4">
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter last name"
                            {...field}
                            className="h-10 text-sm"
                          />
                        </FormControl>
                        <div className="flex items-center gap-1">
                          <FormMessage className="text-base" />
                        </div>{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter first name"
                            {...field}
                            className="h-10 text-sm"
                          />
                        </FormControl>
                        <div className="flex items-center gap-1">
                          <FormMessage className="text-base" />
                        </div>{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter email address"
                            {...field}
                            className="h-10 text-sm"
                          />
                        </FormControl>
                        <div className="flex items-center gap-1">
                          <FormMessage className="text-base" />
                        </div>{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter password"
                            {...field}
                            className="h-10 text-sm"
                          />
                        </FormControl>
                        <div className="flex items-center gap-1">
                       
                          <FormMessage className="text-base" />
                        </div>{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm password"
                            {...field}
                            className="h-10 text-sm"
                          />
                        </FormControl>
                        <div className="flex items-center gap-1">
                      
                          <FormMessage className="text-base" />
                        </div>{" "}
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 text-sm bg-[#1e2f8d] hover:bg-[#1e2f8d]/90 mt-2"
                  disabled={isLoading}>
                  {isLoading ? "Registering..." : "Register"}
                </Button>
              </form>
            </Form>
          </div>

          <p className="text-base text-center text-gray-600 mb-5">
            Already have an account?{" "}
            <Link href="/" className="text-[#1e2f8d] hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
