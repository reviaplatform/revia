"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sun,
  Palette,
  StarsMinimalistic as Sparkles,
  Layers,
  Bolt as Zap,
  Star,
  Heart,
  Shield,
} from "@solar-icons/react";

export function LightModeEnhancementDemo() {
  return (
    <div className="space-y-8">
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-primary" />
            Enhanced Light Mode System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Palette Showcase */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Enhanced Color Palette
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-medium">
                    Primary
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Rich Blue</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-secondary flex items-center justify-center">
                  <span className="text-secondary-foreground font-medium">
                    Secondary
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Light Gray</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground font-medium">
                    Muted
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Very Light</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-accent flex items-center justify-center">
                  <span className="text-accent-foreground font-medium">
                    Accent
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Light Gray</p>
              </div>
            </div>
          </div>

          {/* Input & Select Border Demo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Input & Select Border Visibility
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Demo */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Input Elements</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="default-input">Default Input</Label>
                    <Input id="default-input" placeholder="Default styling" />
                    <p className="text-xs text-muted-foreground">
                      Standard border
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="enhanced-input-demo">Enhanced Input</Label>
                    <Input
                      id="enhanced-input-demo"
                      placeholder="Enhanced styling"
                      className="input-enhanced"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enhanced border
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visible-input">Visible Input</Label>
                    <Input
                      id="visible-input"
                      placeholder="Visible border"
                      className="input-visible"
                    />
                    <p className="text-xs text-muted-foreground">
                      High visibility
                    </p>
                  </div>
                </div>
              </div>

              {/* Select Demo */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Select Elements</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="default-select">Default Select</Label>
                    <select
                      id="default-select"
                      className="w-full px-3 py-2 rounded-md"
                    >
                      <option>Default styling</option>
                      <option>Option 1</option>
                      <option>Option 2</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Standard border
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="enhanced-select">Enhanced Select</Label>
                    <select
                      id="enhanced-select"
                      className="w-full px-3 py-2 rounded-md input-enhanced"
                    >
                      <option>Enhanced styling</option>
                      <option>Option 1</option>
                      <option>Option 2</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Enhanced border
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visible-select">Visible Select</Label>
                    <select
                      id="visible-select"
                      className="w-full px-3 py-2 rounded-md select-enhanced"
                    >
                      <option>Visible border</option>
                      <option>Option 1</option>
                      <option>Option 2</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      High visibility
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Components */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Enhanced Components
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Enhanced Buttons */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">
                  Enhanced Buttons
                </h4>
                <div className="space-y-2">
                  <Button className="btn-primary-enhanced w-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Primary Enhanced
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Layers className="h-4 w-4 mr-2" />
                    Secondary
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Outline
                  </Button>
                </div>
              </div>

              {/* Enhanced Inputs */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Enhanced Inputs</h4>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="enhanced-input">Enhanced Input</Label>
                    <Input
                      id="enhanced-input"
                      placeholder="Type something..."
                      className="input-enhanced"
                    />
                  </div>
                  <div>
                    <Label htmlFor="normal-input">Normal Input</Label>
                    <Input
                      id="normal-input"
                      placeholder="Compare styling..."
                      className="input-visible"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Status Indicators
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge className="status-success">
                <Heart className="h-3 w-3 mr-1" />
                Success
              </Badge>
              <Badge className="status-warning">
                <Star className="h-3 w-3 mr-1" />
                Warning
              </Badge>
              <Badge className="status-error">
                <Shield className="h-3 w-3 mr-1" />
                Error
              </Badge>
              <Badge className="status-info">
                <Palette className="h-3 w-3 mr-1" />
                Info
              </Badge>
            </div>
          </div>

          {/* Enhanced Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Enhanced Cards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="card-enhanced">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Standard Card
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This is a standard card with basic styling.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-enhanced">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Enhanced Card
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This card uses enhanced styling with gradients and shadows.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-enhanced">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Professional Card
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Professional appearance with enhanced visual hierarchy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Light Mode Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Light Mode Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-card border border-border rounded-lg">
                <h4 className="font-medium text-card-foreground mb-2">
                  Visual Enhancements
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Soft white background (#fafbfc)</li>
                  <li>• Rich blue primary color (#1d4ed8)</li>
                  <li>• Professional shadows and depth</li>
                  <li>• Enhanced contrast ratios</li>
                </ul>
              </div>
              <div className="p-4 bg-card border border-border rounded-lg">
                <h4 className="font-medium text-card-foreground mb-2">
                  Professional Polish
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Gradient backgrounds</li>
                  <li>• Subtle hover animations</li>
                  <li>• Enhanced focus states</li>
                  <li>• Improved accessibility</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Before vs After
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium text-foreground mb-2">
                  Before Enhancement
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Basic white backgrounds</li>
                  <li>• Standard blue colors</li>
                  <li>• Minimal shadows</li>
                  <li>• Basic contrast</li>
                </ul>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-medium text-foreground mb-2">
                  After Enhancement
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Soft, professional backgrounds</li>
                  <li>• Rich, vibrant colors</li>
                  <li>• Professional shadows and depth</li>
                  <li>• Enhanced visual hierarchy</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
