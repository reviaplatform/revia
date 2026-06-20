"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Palette, Eye, ColourTuning } from "@solar-icons/react";

export function ProfessionalColorPalette() {
  const colorGroups = [
    {
      title: "Primary Colors",
      colors: [
        {
          name: "Primary",
          class: "bg-primary text-primary-foreground",
          description: "Main brand color",
        },
        {
          name: "Secondary",
          class: "bg-secondary text-secondary-foreground",
          description: "Secondary actions",
        },
        {
          name: "Muted",
          class: "bg-muted text-muted-foreground",
          description: "Subtle backgrounds",
        },
      ],
    },
    {
      title: "Status Colors",
      colors: [
        {
          name: "Success",
          class: "status-success",
          description: "Positive actions",
        },
        {
          name: "Warning",
          class: "status-warning",
          description: "Caution states",
        },
        { name: "Error", class: "status-error", description: "Error states" },
        { name: "Info", class: "status-info", description: "Information" },
      ],
    },
    {
      title: "Chart Colors",
      colors: [
        {
          name: "Chart 1",
          class: "bg-chart-1 text-white",
          description: "Primary data",
        },
        {
          name: "Chart 2",
          class: "bg-chart-2 text-white",
          description: "Secondary data",
        },
        {
          name: "Chart 3",
          class: "bg-chart-3 text-white",
          description: "Success data",
        },
        {
          name: "Chart 4",
          class: "bg-chart-4 text-white",
          description: "Warning data",
        },
        {
          name: "Chart 5",
          class: "bg-chart-5 text-white",
          description: "Error data",
        },
      ],
    },
  ];

  const utilityClasses = [
    {
      name: "Hover Primary",
      class: "hover-primary",
      description: "Primary hover state",
    },
    {
      name: "Hover Secondary",
      class: "hover-secondary",
      description: "Secondary hover state",
    },
    {
      name: "Focus Primary",
      class: "focus-primary",
      description: "Primary focus state",
    },
    {
      name: "Focus Ring",
      class: "focus-ring",
      description: "Focus ring utility",
    },
    {
      name: "Shadow Primary",
      class: "shadow-primary",
      description: "Primary shadow",
    },
    {
      name: "Shadow Secondary",
      class: "shadow-secondary",
      description: "Secondary shadow",
    },
    {
      name: "Gradient Primary",
      class: "gradient-primary text-white",
      description: "Primary gradient",
    },
    {
      name: "Gradient Secondary",
      class: "gradient-secondary",
      description: "Secondary gradient",
    },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Professional Color System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {colorGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {group.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.colors.map((color, colorIndex) => (
                  <div key={colorIndex} className="space-y-2">
                    <div
                      className={`h-16 rounded-lg flex items-center justify-center ${color.class}`}
                    >
                      <span className="font-medium">{color.name}</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-foreground">
                        {color.name}
                      </p>
                      <p className="text-muted-foreground">
                        {color.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Professional Utilities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {utilityClasses.map((utility, index) => (
              <div key={index} className="space-y-2">
                <Button className={`w-full ${utility.class}`} variant="outline">
                  {utility.name}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {utility.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ColourTuning className="h-5 w-5" />
            Color Accessibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Light Mode</h4>
              <div className="space-y-2">
                <div className="bg-background text-foreground p-3 rounded border">
                  <p className="font-medium">Background & Foreground</p>
                  <p className="text-sm text-muted-foreground">
                    High contrast for readability
                  </p>
                </div>
                <div className="bg-card text-card-foreground p-3 rounded border">
                  <p className="font-medium">Card Background</p>
                  <p className="text-sm text-muted-foreground">
                    Clean card styling
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Dark Mode</h4>
              <div className="space-y-2">
                <div className="bg-background text-foreground p-3 rounded border">
                  <p className="font-medium">Background & Foreground</p>
                  <p className="text-sm text-muted-foreground">
                    Optimized for dark environments
                  </p>
                </div>
                <div className="bg-card text-card-foreground p-3 rounded border">
                  <p className="font-medium">Card Background</p>
                  <p className="text-sm text-muted-foreground">
                    Professional dark styling
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




