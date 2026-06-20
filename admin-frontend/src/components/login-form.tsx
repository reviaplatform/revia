"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeClosed, Letter, LockPassword } from "@solar-icons/react";
import { validateEmail, validatePassword } from "@/lib/validation";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: Record<string, string> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);

    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      // Show toast for first error
      const firstError = Object.values(newErrors)[0];
      toast.error("Validation Error", {
        description: firstError,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        languagePreference: "en",
      });

      const accessToken = response.data?.accessToken;
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }

      // Set authentication state
      localStorage.setItem("isAuthenticated", "true");

      // Show success toast
      toast.success("Login Successful", {
        description: "Welcome back! You have been logged in successfully.",
      });

      // Navigate to dashboard after successful login
      router.push("/dashboard");
    } catch (error: any) {
      toast.error("Login Failed", {
        description: error.message || "Invalid credentials. Please try again.",
      });
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Enter your credentials to login</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              <Field>
                <div className="relative group">
                  <Letter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors duration-200 group-focus-within:text-secondary" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </Field>
              <Field>
                <div className="relative group">
                  <LockPassword className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors duration-200 group-focus-within:text-secondary" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeClosed className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:text-primary-hover underline-offset-4 hover:underline transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <a
          href="#"
          className="text-primary hover:text-primary-hover underline underline-offset-4 transition-colors"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="text-primary hover:text-primary-hover underline underline-offset-4 transition-colors"
        >
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
}
