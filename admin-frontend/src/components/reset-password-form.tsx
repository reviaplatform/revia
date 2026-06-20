"use client";

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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeClosed, LockPassword } from "@solar-icons/react";
import { Spinner } from "@/components/ui/spinner";
import { validatePassword, validateConfirmPassword } from "@/lib/validation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useEffect } from "react";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const email = sessionStorage.getItem("resetEmail");
    const otp = sessionStorage.getItem("resetOtp");
    if (!email || !otp) {
      toast.error("Session Expired", {
        description: "Please restart the password reset process.",
      });
      router.push("/auth/forgot-password");
    }
  }, [router]);

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

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

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

    const resetEmail = sessionStorage.getItem("resetEmail");
    const resetOtp = sessionStorage.getItem("resetOtp");

    if (!resetEmail || !resetOtp) {
      toast.error("Session Expired", {
        description: "Please restart the password reset process.",
      });
      router.push("/auth/forgot-password");
      return;
    }

    try {
      await api.resetPassword({
        email: resetEmail,
        otp: resetOtp,
        newPassword: formData.password,
        languagePreference: "en",
      });

      // Clear session storage securely
      sessionStorage.removeItem("resetEmail");
      sessionStorage.removeItem("resetOtp");

      // Show success toast
      toast.success("Password Reset", {
        description:
          "Your password has been reset successfully! You can now log in with your new password.",
      });

      // Navigate to login page
      router.push("/auth/login");
    } catch (error: any) {
      toast.error("Reset Failed", {
        description: error.message || "Failed to reset password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              <Field>
                <div className="relative group">
                  <LockPassword className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors duration-200 group-focus-within:text-secondary" />
                  <Input
                    id="new-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
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
              </Field>
              <Field>
                <div className="relative group">
                  <LockPassword className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors duration-200 group-focus-within:text-secondary" />
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeClosed className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  Password must be at least 7 characters long
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
