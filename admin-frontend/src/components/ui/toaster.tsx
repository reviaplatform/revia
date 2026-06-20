"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      richColors
      className="toast"
      toastOptions={{
        className: "toast-container",
      }}
    />
  );
}
