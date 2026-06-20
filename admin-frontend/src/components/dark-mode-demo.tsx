"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggleWithLabel } from "@/components/theme-toggle";

export function DarkModeDemo() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dark Mode Demo</h1>
        <ThemeToggleWithLabel />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Light/Dark Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This card adapts to the current theme. In dark mode, it uses pure
              black backgrounds.
            </p>
            <div className="flex gap-2">
              <Badge variant="default">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <Button className="w-full">Sample Button</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Color Contrast</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="bg-primary text-primary-foreground p-2 rounded">
                Primary Background
              </div>
              <div className="bg-secondary text-secondary-foreground p-2 rounded">
                Secondary Background
              </div>
              <div className="bg-muted text-muted-foreground p-2 rounded">
                Muted Background
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dark Mode Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Background:</span>
                <span className="font-mono">#000000</span>
              </div>
              <div className="flex justify-between">
                <span>Card:</span>
                <span className="font-mono">#111111</span>
              </div>
              <div className="flex justify-between">
                <span>Text:</span>
                <span className="font-mono">#FFFFFF</span>
              </div>
              <div className="flex justify-between">
                <span>Border:</span>
                <span className="font-mono">#333333</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

