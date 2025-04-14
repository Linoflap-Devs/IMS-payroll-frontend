"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService, LoginResponse } from "@/src/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { setCookie, setAuthCookie } from "@/utils/cookies";
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
  const [error, setError] = useState("");
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
    setError("");

    try {
      const response = await authService.login(values);

      if (response.data.success) {
        // Store auth token in httpOnly cookie
        setAuthCookie(response.data.data.token);
        // Store user email in regular cookie
        setCookie("userEmail", response.data.data.email);

        // Redirect to dashboard after successful login
        router.push("/home/dashboard");
      } else {
        // Handle unsuccessful login
        setError(response.data.message || "Invalid email or password");
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "An error occurred during login. Please try again."
      );
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
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <div className="">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
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

                <Button
                  type="submit"
                  className="w-full h-10 text-sm bg-[#1e2f8d] hover:bg-[#1e2f8d]/90 mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Log in"}
                </Button>
              </form>
            </Form>
          </div>

          <p className="text-base text-center text-gray-600 mb-20">
            Dont have account yet?{" "}
            <a href="/register" className="text-[#1e2f8d] hover:underline">
              Register here
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
