"use client";

import { GraphUp } from "@solar-icons/react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useState, useMemo } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataPoint {
  month: string;
  revenue: number;
  users: number;
  date: string;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#3b82f6",
    format: (value) => `EGP ${(value as number).toLocaleString()}`,
  },
  users: {
    label: "Users",
    color: "#06b6d4",
  },
} satisfies ChartConfig;

export function RevenueUsersChart({ data }: { data?: DataPoint[] }) {
  const [timeRange, setTimeRange] = useState("12m");

  const filteredData = useMemo(() => {
    const chartData = data || [];
    if (chartData.length === 0) return [];

    const currentDate = new Date(chartData[chartData.length - 1].date);
    let monthsToShow = 12;

    if (timeRange === "3m") {
      monthsToShow = 3;
    } else if (timeRange === "6m") {
      monthsToShow = 6;
    }

    const startDate = new Date(currentDate);
    startDate.setMonth(startDate.getMonth() - monthsToShow + 1);

    return chartData.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate;
    });
  }, [data, timeRange]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Revenue & Users Over Time</CardTitle>
            <CardDescription>
              Monthly revenue and user growth trends
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={filteredData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={80}
              tickFormatter={(value) => `EGP ${value.toLocaleString()}`}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="revenue"
              type="monotone"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="users"
              type="monotone"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Platform traction analysis
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Showing revenue and user growth for the last{" "}
              {timeRange === "3m"
                ? "3 months"
                : timeRange === "6m"
                ? "6 months"
                : "12 months"}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
