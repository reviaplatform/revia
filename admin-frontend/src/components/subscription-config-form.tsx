"use client";

import { useState, useEffect } from "react";
import { subscriptionService, SubscriptionConfig } from "@/services/subscriptionService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { SpinnerCustom } from "@/components/ui/spinner-custom";
import { Settings, Wallet, Calendar } from "@solar-icons/react";

export function SubscriptionConfigForm() {
  const [config, setConfig] = useState<SubscriptionConfig>({
    priceEGP: 0,
    durationDays: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const response = await subscriptionService.getConfig();
      if (response.data) {
        setConfig(response.data);
      }
    } catch (error: any) {
      toast.error("Failed to load configuration", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await subscriptionService.updateConfig(config);
      toast.success("Configuration updated successfully");
    } catch (error: any) {
      toast.error("Failed to update configuration", {
        description: error.message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <SpinnerCustom />
      </div>
    );
  }

  return (
    <Card className="w-full border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Settings className="h-5 w-5" />
          </div>
          <CardTitle>Global Subscription Settings</CardTitle>
        </div>
        <CardDescription>
          Configure the default price and duration for new brand subscriptions. 
          Changes will only apply to future subscription requests.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleUpdate}>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Price (EGP)
              </Label>
              <div className="relative group">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="price"
                  type="number"
                  value={config.priceEGP}
                  onChange={(e) => setConfig({ ...config, priceEGP: Number(e.target.value) })}
                  className="pl-10 h-11 bg-background border-border/50 focus:border-primary/50 focus:ring-primary/10"
                  required
                  min={0}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Total amount the brand will pay per subscription period.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Duration (Days)
              </Label>
              <div className="relative group">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="duration"
                  type="number"
                  value={config.durationDays}
                  onChange={(e) => setConfig({ ...config, durationDays: Number(e.target.value) })}
                  className="pl-10 h-11 bg-background border-border/50 focus:border-primary/50 focus:ring-primary/10"
                  required
                  min={1}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Number of days the subscription remains active after payment.</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
            <h4 className="text-xs font-bold text-primary uppercase tracking-tight">Important Note</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When a brand requests a subscription, the system "snaps" these values. 
              Existing active or pending subscriptions will not be affected by changes made here.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-2">
          <Button 
            type="submit" 
            disabled={isUpdating}
            className="rounded-md px-8 h-11 font-semibold transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            {isUpdating ? <SpinnerCustom className="h-4 w-4 mr-2" /> : null}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
