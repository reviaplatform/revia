"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Letter } from "@solar-icons/react";
import { validateEmail } from "@/lib/validation";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
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
      await api.forgotPassword({
        email: formData.email,
        languagePreference: "en",
      });

      // Save email for the next steps in the flow
      sessionStorage.setItem("resetEmail", formData.email);

      // Show success toast
      toast.success("Verification Code Sent", {
        description: "We've sent a 6-digit code to your email address.",
      });

      // Navigate to OTP verification page
      router.push("/auth/otp-verification");
    } catch (error: any) {
      toast.error("Process Failed", {
        description: error.message || "Failed to send reset code. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a verification code
          </CardDescription>
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner />
                      Sending...
                    </>
                  ) : (
                    "Send verification code"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  Remember your password?{" "}
                  <Link
                    href="/auth/login"
                    className="text-primary hover:text-primary-hover underline underline-offset-4 transition-colors"
                  >
                    Sign in
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
}
