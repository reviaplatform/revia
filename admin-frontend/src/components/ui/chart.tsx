"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

// ---------------- Chart Context ----------------
const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

// ---------------- Chart Container ----------------
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

// ---------------- Tooltip ----------------
const ChartTooltip = RechartsPrimitive.Tooltip;

type TooltipPayloadItem = {
  dataKey?: string;
  name?: string;
  value?: unknown;
  color?: string;
  payload?: Record<string, unknown>;
};

interface ChartTooltipContentProps extends React.ComponentProps<"div"> {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
  labelFormatter?: (
    value: unknown,
    payload: TooltipPayloadItem[]
  ) => React.ReactNode;
  formatter?: (
    value: unknown,
    name: unknown,
    props: TooltipPayloadItem,
    index: number,
    payload: TooltipPayloadItem[]
  ) => React.ReactNode;
  color?: string;
  labelClassName?: string;
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) return null;

      const [item] = payload;
      const key = `${labelKey || item.dataKey || item.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
        !labelKey && typeof label === "string"
          ? label
          : itemConfig?.label || key;

      if (labelFormatter) {
        return labelFormatter(value, payload);
      }
      return value;
    }, [label, labelFormatter, payload, hideLabel, labelKey, config]);

    if (!active || !payload?.length) return null;

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!nestLabel && (
          <div className={cn("font-medium", labelClassName)}>
            {tooltipLabel}
          </div>
        )}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color || itemConfig?.color;

            return (
              <div
                key={item.dataKey || index}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, payload)
                ) : (
                  <>
                    {!hideIndicator && (
                      <div
                        className={cn(
                          "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                          {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent":
                              indicator === "dashed",
                          }
                        )}
                        style={
                          {
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel && (
                          <div className={cn("font-medium", labelClassName)}>
                            {tooltipLabel}
                          </div>
                        )}
                        <div className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </div>
                      </div>
                      {item.value !== undefined && (
                        <div className="font-mono font-medium tabular-nums text-foreground">
                          {itemConfig?.format
                            ? (itemConfig.format(
                                item.value,
                                payload
                              ) as React.ReactNode)
                            : (item.value as React.ReactNode)}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

// ---------------- Legend ----------------
const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    payload?: Array<{ dataKey?: string; value?: unknown; color?: string }>;
    verticalAlign?: "top" | "bottom";
    hideIcon?: boolean;
    nameKey?: string;
  }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    ref
  ) => {
    const { config } = useChart();

    if (!payload?.length) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload.map((item, idx) => {
          const key = `${nameKey || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <div
              key={idx}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {!hideIcon && (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: itemConfig?.color || item.color,
                  }}
                />
              )}
              <span className="text-muted-foreground">{itemConfig?.label}</span>
            </div>
          );
        })}
      </div>
    );
  }
);
ChartLegendContent.displayName = "ChartLegendContent";

// ---------------- Config & Helper ----------------
type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    format?: (value: unknown, payload: unknown[]) => React.ReactNode;
    color?: string;
    theme?: Record<string, string | React.CSSProperties["color"]>;
  };
};

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: Record<string, unknown>,
  key: string
) {
  if (!payload || typeof payload !== "object") return undefined;

  const configKey =
    key in config
      ? key
      : (payload.dataKey as string) || (payload.name as string);
  return config[configKey];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  useChart,
  type ChartConfig,
};
