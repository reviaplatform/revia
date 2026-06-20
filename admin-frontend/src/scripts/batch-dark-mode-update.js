// Batch script to update all remaining pages with dark mode
const fs = require("fs");

const pages = [
  "src/app/brands/page.tsx",
  "src/app/categories/page.tsx",
  "src/app/payment-methods/page.tsx",
  "src/app/payout/page.tsx",
  "src/app/auth/login/page.tsx",
  "src/app/auth/forgot-password/page.tsx",
  "src/app/auth/otp-verification/page.tsx",
  "src/app/auth/reset-password/page.tsx",
];

const replacements = [
  // Background classes
  { from: /bg-white/g, to: "bg-background" },
  { from: /bg-gray-100/g, to: "bg-muted" },
  { from: /bg-gray-200/g, to: "bg-accent" },

  // Text classes
  { from: /text-black/g, to: "text-foreground" },
  { from: /text-gray-700/g, to: "text-foreground" },
  { from: /text-gray-500/g, to: "text-muted-foreground" },

  // Border classes
  { from: /border-gray-200/g, to: "border-border" },
  { from: /border-gray-300/g, to: "border-border" },

  // Button classes
  { from: /hover:text-black/g, to: "hover:text-foreground" },
  { from: /focus:text-black/g, to: "focus:text-foreground" },

  // Card colors for dark mode
  { from: /bg-blue-100/g, to: "bg-blue-100 dark:bg-blue-900/20" },
  { from: /bg-green-100/g, to: "bg-green-100 dark:bg-green-900/20" },
  { from: /bg-yellow-100/g, to: "bg-yellow-100 dark:bg-yellow-900/20" },
  { from: /bg-red-100/g, to: "bg-red-100 dark:bg-red-900/20" },
  { from: /bg-purple-100/g, to: "bg-purple-100 dark:bg-purple-900/20" },

  // Text colors for dark mode
  { from: /text-blue-600/g, to: "text-blue-600 dark:text-blue-400" },
  { from: /text-green-600/g, to: "text-green-600 dark:text-green-400" },
  { from: /text-yellow-600/g, to: "text-yellow-600 dark:text-yellow-400" },
  { from: /text-red-600/g, to: "text-red-600 dark:text-red-400" },
  { from: /text-purple-600/g, to: "text-purple-600 dark:text-purple-400" },
];

function updatePage(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");

    // Add ThemeToggle import if not present
    if (!content.includes("ThemeToggle")) {
      content = content.replace(
        'import { PanelLeft } from "lucide-react";',
        'import { PanelLeft } from "lucide-react";\nimport { ThemeToggle } from "@/components/theme-toggle";'
      );
    }

    // Apply all replacements
    replacements.forEach((replacement) => {
      content = content.replace(replacement.from, replacement.to);
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

    // Update mobile close button
    content = content.replace(
      "bg-gray-100 hover:bg-gray-200",
      "bg-muted hover:bg-accent"
    );

    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

console.log("🚀 Starting batch dark mode update...");
pages.forEach(updatePage);
console.log("✅ Batch dark mode update completed!");




