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
import Link from "next/link";
import { PiWarningCircleLight } from "react-icons/pi";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import Image from "next/image";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password must be at least 1 character.",
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
        // Store the user's email in localStorage
        localStorage.setItem("userEmail", response.data.email);
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
        <div className="mb-4">
          <h2 className="flex justify-center text-4xl font-semibold text-[#1F279C] mb-2">
            Log in
          </h2>
        </div>
        <div className="space-y-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="mb-22 space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className={`text-sm ${
                          errorMessage ? "text-red-600" : ""
                        }`}>
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter email address"
                          {...field}
                          className={`h-10 text-sm  ${
                            errorMessage
                              ? "border-red-500 ring-red-500 focus-visible:ring-red-200 focus-visible:border-red-500"
                              : ""
                          }`}
                        />
                      </FormControl>
                      <div className="flex items-center gap-1">
                        {form.formState.errors.email && (
                          <PiWarningCircleLight color="red" size={20} />
                        )}
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
                      <FormLabel
                        className={`text-sm ${
                          errorMessage ? "text-red-600" : ""
                        }`}>
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter password"
                          {...field}
                          className={`h-10 text-sm  ${
                            errorMessage
                              ? "border-red-500 ring-red-500 focus-visible:ring-red-200 focus-visible:border-red-500"
                              : ""
                          }`}
                        />
                      </FormControl>
                      <div className="flex items-center gap-1">
                        {form.formState.errors.password && (
                          <PiWarningCircleLight color="red" size={20} />
                        )}
                        <FormMessage className="text-base" />
                      </div>{" "}
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
                className="w-full h-10 text-sm bg-[#1e2f8d] hover:bg-[#1e2f8d]/90"
                disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log in"}
              </Button>
            </form>
          </Form>

          <div className="flex items-center justify-center mt-4 flex-col gap-20">
            <Dialog>
              <DialogTrigger className="text-base text-center text-[#1e2f8d] hover:underline">
                Forgot password?
              </DialogTrigger>
              <DialogContent className="p-13 [&>button:last-child]:hidden">
                <DialogHeader className="gap-3">
                  {/* <DialogTitle>Are you absolutely sure?</DialogTitle> */}
                  <Image
                    src="/mail-logo.png"
                    alt="Forgot Password"
                    width={100}
                    height={100}
                    className="mx-auto"
                  />
                  <DialogDescription className="text-md text-center text-[#1e2f8d]">
                    To reset your password, please send a request to the
                    administrator at admin@gmail.com.
                  </DialogDescription>
                  <DialogClose>
                    <Button
                      variant="outline"
                      className="py-5 px-18 text-sm bg-[#1e2f8d] hover:bg-[#1e2f8d]/90 text-white hover:text-white">
                      Okay
                    </Button>
                  </DialogClose>
                </DialogHeader>
              </DialogContent>
            </Dialog>

            <p className="text-base text-center text-gray-600">
              Don't have an account yet?{" "}
              <Link href="/register" className="text-[#1e2f8d] hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
