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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function OTPForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60); // 60 seconds timer
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  useEffect(() => {
    const resetEmail = sessionStorage.getItem("resetEmail");
    if (!resetEmail) {
      toast.error("Session Expired", {
        description: "Please restart the password reset process.",
      });
      router.push("/auth/forgot-password");
    }
  }, [router]);

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsResending(true);
    const resetEmail = sessionStorage.getItem("resetEmail");

    if (!resetEmail) {
      toast.error("Error", { description: "Email not found." });
      setIsResending(false);
      return;
    }

    try {
      await api.forgotPassword({
        email: resetEmail,
        languagePreference: "en",
      });

      // Reset timer and disable resend
      setResendTimer(60);
      setCanResend(false);

      // Show success message
      toast.success("Code Sent", {
        description: "A new verification code has been sent to your email.",
      });
    } catch (error: any) {
      toast.error("Resend Failed", {
        description: error.message || "Failed to resend code. Please try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex(
      (val, idx) => idx >= pastedData.length && !val
    );
    const focusIndex =
      nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if OTP is complete
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Incomplete Code", {
        description: "Please enter all 6 digits of the verification code.",
      });
      return;
    }

    setIsLoading(true);

    const resetEmail = sessionStorage.getItem("resetEmail");

    if (!resetEmail) {
      toast.error("Session Expired", {
        description: "Please restart the password reset process.",
      });
      router.push("/auth/forgot-password");
      return;
    }

    try {
      await api.verifyPasswordOtp({
        email: resetEmail,
        otp: otpString,
        languagePreference: "en",
      });

      // Save verified OTP for final step
      sessionStorage.setItem("resetOtp", otpString);

      // Show success toast
      toast.success("Code Verified", {
        description: "Your verification code has been verified successfully!",
      });

      // Navigate to reset password page after successful OTP verification
      router.push("/auth/reset-password");
    } catch (error: any) {
      toast.error("Verification Failed", {
        description: error.message || "Invalid or expired OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card {...props}>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Enter verification code</CardTitle>
        <CardDescription>We sent a 6-digit code to your email.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="otp" className="sr-only">
                Verification code
              </FieldLabel>
              <InputOTP maxLength={6} id="otp" required>
                <InputOTPGroup className="gap-2.5 justify-center *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                  {otp.map((digit, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      maxLength={1}
                      className="text-center text-lg font-semibold"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <FieldDescription className="text-center">
                Enter the 6-digit code sent to your email.
              </FieldDescription>
            </Field>
            <Field>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>
              <FieldDescription className="text-center">
                Didn&apos;t receive the code?{" "}
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isResending}
                    className="text-primary hover:text-primary-hover underline underline-offset-4 hover:no-underline font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? (
                      <>
                        <Spinner className="inline w-3 h-3 mr-1" />
                        Sending...
                      </>
                    ) : (
                      "Resend code"
                    )}
                  </button>
                ) : (
                  <span className="text-text-muted font-medium">
                    Resend in {resendTimer}s
                  </span>
                )}
              </FieldDescription>
            </Field>
            <Field>
              <FieldDescription className="text-center">
                Wrong email?{" "}
                <Link
                  href="/auth/forgot-password"
                  className="text-primary hover:text-primary-hover underline underline-offset-4 transition-colors"
                >
                  Go back
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
