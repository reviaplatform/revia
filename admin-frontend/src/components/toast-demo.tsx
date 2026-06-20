"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CheckCircle,
  CloseCircle as XCircle,
  DangerTriangle as AlertTriangle,
  InfoCircle as Info,
  Bell,
  Bolt as Zap,
  Star,
} from "@solar-icons/react";

export function ToastDemo() {
  const [toastCount, setToastCount] = useState(0);

  const showSuccessToast = () => {
    toast.success("Operation completed successfully!", {
      description: "Your changes have been saved and applied.",
      duration: 4000,
    });
    setToastCount((prev) => prev + 1);
  };

  const showErrorToast = () => {
    toast.error("Something went wrong!", {
      description: "Please check your input and try again.",
      duration: 5000,
    });
    setToastCount((prev) => prev + 1);
  };

  const showWarningToast = () => {
    toast.warning("Please review your settings", {
      description: "Some configurations may need your attention.",
      duration: 4000,
    });
    setToastCount((prev) => prev + 1);
  };

  const showInfoToast = () => {
    toast.info("New feature available!", {
      description: "Check out the latest updates in your dashboard.",
      duration: 4000,
    });
    setToastCount((prev) => prev + 1);
  };

  const showCustomToast = () => {
    toast.custom(
      (t) => (
        <div className="flex items-center gap-3 p-4 bg-card dark:bg-[#1a1a1a] border border-border dark:border-[#333333] rounded-lg">
          <div className="flex-shrink-0">
            <Star className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-card-foreground dark:text-white">
              Custom Toast
            </h4>
            <p className="text-sm text-muted-foreground dark:text-[#a3a3a3]">
              This is a custom toast with light black background!
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toast.dismiss(t)}
            className="text-muted-foreground hover:text-foreground dark:text-[#a3a3a3] dark:hover:text-white dark:hover:bg-[#333333]"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      ),
      {
        duration: 6000,
      }
    );
    setToastCount((prev) => prev + 1);
  };

  const showPromiseToast = () => {
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve("Data loaded successfully!");
        } else {
          reject("Failed to load data");
        }
      }, 2000);
    });

    toast.promise(promise, {
      loading: "Loading data...",
      success: (data) => `${data}`,
      error: (err) => `${err}`,
    });
    setToastCount((prev) => prev + 1);
  };

  const clearAllToasts = () => {
    toast.dismiss();
    setToastCount(0);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Toast Dark Mode Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toast Statistics */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-medium">Toasts Triggered:</span>
            <Badge variant="outline">{toastCount}</Badge>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={clearAllToasts}
            disabled={toastCount === 0}
          >
            Clear All
          </Button>
        </div>

        {/* Toast Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Toast Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              onClick={showSuccessToast}
              className="flex items-center gap-2 h-auto p-4"
              variant="outline"
            >
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <div className="text-left">
                <div className="font-medium">Success Toast</div>
                <div className="text-xs text-muted-foreground">
                  Positive feedback
                </div>
              </div>
            </Button>

            <Button
              onClick={showErrorToast}
              className="flex items-center gap-2 h-auto p-4"
              variant="outline"
            >
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <div className="text-left">
                <div className="font-medium">Error Toast</div>
                <div className="text-xs text-muted-foreground">
                  Error notifications
                </div>
              </div>
            </Button>

            <Button
              onClick={showWarningToast}
              className="flex items-center gap-2 h-auto p-4"
              variant="outline"
            >
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <div className="text-left">
                <div className="font-medium">Warning Toast</div>
                <div className="text-xs text-muted-foreground">
                  Caution alerts
                </div>
              </div>
            </Button>

            <Button
              onClick={showInfoToast}
              className="flex items-center gap-2 h-auto p-4"
              variant="outline"
            >
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <div className="font-medium">Info Toast</div>
                <div className="text-xs text-muted-foreground">
                  Information updates
                </div>
              </div>
            </Button>

            <Button
              onClick={showCustomToast}
              className="flex items-center gap-2 h-auto p-4"
              variant="outline"
            >
              <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <div className="text-left">
                <div className="font-medium">Custom Toast</div>
                <div className="text-xs text-muted-foreground">
                  Custom styling
                </div>
              </div>
            </Button>

            <Button
              onClick={showPromiseToast}
              className="flex items-center gap-2 h-auto p-4"
              variant="outline"
            >
              <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <div className="text-left">
                <div className="font-medium">Promise Toast</div>
                <div className="text-xs text-muted-foreground">
                  Async operations
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* Dark Mode Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Dark Mode Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-card border border-border rounded-lg">
              <h4 className="font-medium text-card-foreground mb-2">
                Light Mode
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Clean white background</li>
                <li>• Dark text for readability</li>
                <li>• Subtle borders and shadows</li>
                <li>• Professional color scheme</li>
              </ul>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <h4 className="font-medium text-card-foreground mb-2">
                Dark Mode
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Rich dark background</li>
                <li>• Light text for contrast</li>
                <li>• Consistent theming</li>
                <li>• Smooth transitions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
          <p className="font-medium mb-2">How to test:</p>
          <p>1. Click any toast button to see the notification</p>
          <p>2. Switch between light and dark themes</p>
          <p>3. Notice how toasts adapt to the current theme</p>
          <p>4. All toast elements maintain proper contrast and readability</p>
        </div>
      </CardContent>
    </Card>
  );
}
