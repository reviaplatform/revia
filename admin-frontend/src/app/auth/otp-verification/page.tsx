import Image from "next/image";
import { OTPForm } from "@/components/otp-form";

export default function OTPPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a
          href="#"
          className="flex items-center justify-center bg-transparent p-0 m-0"
        >
          <Image
            src="/revia-logo.png"
            alt="Revia Logo"
            width={120}
            height={40}
            priority
            className="object-contain bg-transparent p-0 m-0"
            style={{ backgroundColor: "transparent", padding: 0, margin: 0 }}
          />
        </a>
        <OTPForm />
      </div>
    </div>
  );
}
