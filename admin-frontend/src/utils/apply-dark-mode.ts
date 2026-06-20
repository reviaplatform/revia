// Utility function to apply dark mode classes to common elements
export const applyDarkModeClasses = {
  // Background classes
  background: "bg-background",
  cardBackground: "bg-card",

  // Text classes
  text: "text-foreground",
  mutedText: "text-muted-foreground",

  // Border classes
  border: "border-border",

  // Button classes
  button: "bg-muted hover:bg-accent",
  buttonText: "text-foreground hover:text-foreground",

  // Header classes
  header: "bg-background border-b border-border",

  // Page content classes
  pageContent: "bg-background",

  // Badge classes
  badgeGreen:
    "text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
  badgeYellow:
    "text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  badgeRed: "text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
  badgeBlue:
    "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",

  // Status indicator classes
  statusGreen: "bg-green-500 dark:bg-green-400",
  statusBlue: "bg-blue-500 dark:bg-blue-400",
  statusYellow: "bg-yellow-500 dark:bg-yellow-400",
  statusRed: "bg-red-500 dark:bg-red-400",
};

// Common page structure with dark mode
export const getPageStructure = (
  content: React.ReactNode,
  currentPage: string
) => {
  return {
    sidebar: {
      className: "bg-sidebar",
    },
    pageContent: {
      className: "bg-background",
    },
    header: {
      className: "bg-background border-b border-border",
    },
    content: content,
  };
};




