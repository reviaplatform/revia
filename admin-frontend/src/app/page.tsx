"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SpinnerCustom } from "@/components/ui/spinner-custom";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated (you can implement your own auth logic here)
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <SpinnerCustom />
    </div>
  );
}
