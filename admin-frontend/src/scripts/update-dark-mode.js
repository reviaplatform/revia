// Script to update all pages with dark mode support
const fs = require("fs");
const path = require("path");

const pages = [
  "src/app/analytics/page.tsx",
  "src/app/bookings/page.tsx",
  "src/app/brands/page.tsx",
  "src/app/categories/page.tsx",
  "src/app/payment-methods/page.tsx",
  "src/app/payout/page.tsx",
  "src/app/auth/login/page.tsx",
  "src/app/auth/forgot-password/page.tsx",
  "src/app/auth/otp-verification/page.tsx",
  "src/app/auth/reset-password/page.tsx",
];

const darkModeReplacements = [
  // Background classes
  { from: "bg-white", to: "bg-background" },
  { from: "bg-gray-100", to: "bg-muted" },
  { from: "bg-gray-200", to: "bg-accent" },

  // Text classes
  { from: "text-black", to: "text-foreground" },
  { from: "text-gray-700", to: "text-foreground" },
  { from: "text-gray-500", to: "text-muted-foreground" },

  // Border classes
  { from: "border-gray-200", to: "border-border" },
  { from: "border-gray-300", to: "border-border" },

  // Button classes
  { from: "hover:text-black", to: "hover:text-foreground" },
  { from: "focus:text-black", to: "focus:text-foreground" },
];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");

    // Add ThemeToggle import if not present
    if (!content.includes("ThemeToggle")) {
      content = content.replace(
        'import { PanelLeft } from "lucide-react";',
        'import { PanelLeft } from "lucide-react";\nimport { ThemeToggle } from "@/components/theme-toggle";'
      );
    }

    // Apply dark mode replacements
    darkModeReplacements.forEach((replacement) => {
      const regex = new RegExp(replacement.from, "g");
      content = content.replace(regex, replacement.to);
    });

    // Add theme toggle to header if not present
    if (
      content.includes("</Breadcrumb>") &&
      !content.includes("<ThemeToggle")
    ) {
      content = content.replace(
        "</Breadcrumb>\n                </div>",
        '</Breadcrumb>\n                </div>\n                <div className="ml-auto">\n                  <ThemeToggle />\n                </div>'
      );
    }

    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

// Update all pages
pages.forEach(updateFile);
console.log("Dark mode updates completed!");




