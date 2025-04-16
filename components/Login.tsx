"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
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
import { loginUser, LoginResponse } from "../src/services/auth/auth.api";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setErrorMessage(""); // reset any previous error

    try {
      // Call the login API with email and password
      const response: LoginResponse = await loginUser(values);
      console.log("Login response:", response);

      if (response.success) {
        // On success, the backend sets the auth cookie.
        // Redirect the user to the dashboard.
        router.push("/home/dashboard");
      } else {
        // Display error message from API when login fails
        setErrorMessage(
          response.message || "Invalid credentials, please try again."
        );
        console.error("Error during login:", response.message);
      }
    } catch (error: any) {
      // Handle any unexpected errors. Customize the message as needed.
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred.";
      setErrorMessage(errorMsg);
      console.error("Login failed:", errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-[550px] px-6">
      <Card className="w-full p-14 bg-[#FDFDFD] shadow-[2px_2px_25%_#C1BAD840] rounded-xl border-0">
        <div className="mb-4 mt-12">
          <h2 className="flex justify-center text-4xl font-semibold text-[#1F279C] mb-2">
            Log in
          </h2>
        </div>
        <div className="space-y-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="mb-28 space-y-5">
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
                      <FormMessage className="text-base" />
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
                      <FormMessage className="text-base" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Display error message if any */}
              {errorMessage && (
                <div className="text-sm text-red-500 text-center">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10 text-sm bg-[#1e2f8d] hover:bg-[#1e2f8d]/90 mt-4"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log in"}
              </Button>
            </form>
          </Form>
          <p className="text-base text-center text-gray-600 mb-20">
            Don't have an account yet?{" "}
            <a href="/register" className="text-[#1e2f8d] hover:underline">
              Register here
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
