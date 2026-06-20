// Script to remove theme toggle from all pages
const fs = require("fs");

const pages = [
  "src/app/analytics/page.tsx",
  "src/app/bookings/page.tsx",
  "src/app/brands/page.tsx",
  "src/app/categories/page.tsx",
  "src/app/payment-methods/page.tsx",
  "src/app/payout/page.tsx",
];

function removeThemeToggle(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");

    // Remove ThemeToggle import
    content = content.replace(
      'import { ThemeToggle } from "@/components/theme-toggle";\n',
      ""
    );
    content = content.replace(
      'import { ThemeToggle } from "@/components/theme-toggle";',
      ""
    );

    // Remove theme toggle from header
    content = content.replace(
      /                <div className="ml-auto">\n                  <ThemeToggle \/>\n                <\/div>/g,
      ""
    );
    content = content.replace(
      /                <div className="ml-auto">\n                  <ThemeToggle \/>\n                <\/div>/g,
      ""
    );

    // Remove any remaining ThemeToggle references
    content = content.replace(/<ThemeToggle \/>/g, "");

    fs.writeFileSync(filePath, content);
    console.log(`✅ Removed theme toggle from: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

console.log("🚀 Starting theme toggle removal...");
pages.forEach(removeThemeToggle);
console.log("✅ Theme toggle removal completed!");




