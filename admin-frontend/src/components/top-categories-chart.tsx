"use client";

import { GraphUp } from "@solar-icons/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface CategoryData {
  category: string;
  bookings: number;
  revenue: number;
}

const chartConfig = {
  bookings: {
    label: "Bookings",
    color: "#3b82f6",
  },
  revenue: {
    label: "Revenue",
    color: "#06b6d4",
  },
  label: {
    color: "#ffffff",
  },
} satisfies ChartConfig;

export function TopCategoriesChart({ data }: { data?: CategoryData[] }) {
  const currentChartData = data || [];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Categories</CardTitle>
        <CardDescription>
          Categories ranked by bookings and revenue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={currentChartData}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="category"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 8)}
              hide
            />
            <XAxis dataKey="bookings" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="bookings" fill="#3b82f6" radius={4}>
              <LabelList
                dataKey="category"
                position="insideLeft"
                offset={8}
                className="fill-white"
                fontSize={12}
              />
              <LabelList
                dataKey="bookings"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Fashion leading with 305 bookings <GraphUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing top 6 categories by booking volume
        </div>
      </CardFooter>
    </Card>
  );
}
