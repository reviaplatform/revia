"use client";

import { useState, useEffect } from "react";
import { User, LockPassword, Eye, EyeClosed, Sun, Moon, Monitor } from "@solar-icons/react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { useTheme } from "@/contexts/theme-context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider } from "@/components/ui/sidebar-provider";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpinnerCustom } from "@/components/ui/spinner-custom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { profileApi } from "@/services/profileService";

import { PageTemplate } from "@/components/page-template";
import { ProfileSkeleton } from "@/components/profile-skeleton";

export default function ProfilePage() {
  const [currentPage] = useState("Profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [originalName, setOriginalName] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { theme: currentTheme, setTheme: updateTheme } = useTheme();

  const ThemeOption = ({ mode, label, icon }: { mode: "light" | "dark" | "system"; label: string; icon: React.ReactNode }) => {
    const isActive = currentTheme === mode;
    
    return (
      <button
        type="button"
        onClick={() => updateTheme(mode)}
        className={`group flex items-center gap-3 p-4 rounded-md border transition-all duration-300 text-left ${
          isActive 
            ? "bg-muted/30 border-primary shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--primary)_10%,transparent)]" 
            : "bg-card border-border hover:border-primary/30 hover:bg-accent/5"
        }`}
      >
        <div className={`p-2.5 rounded-md border transition-all duration-300 ${
          isActive 
            ? "bg-primary border-primary text-primary-foreground shadow-sm" 
            : "bg-muted/50 border-border text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
        }`}>
          {icon}
        </div>
        <div className="flex flex-col space-y-0.5">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
            {label}
          </span>
          <span className="text-[10px] text-muted-foreground/60 font-medium">
            {mode === "system" ? "Match device" : `Focus on ${label.split(' ')[0].toLowerCase()} UI`}
          </span>
        </div>
        {isActive && (
          <div className="ml-auto">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          </div>
        )}
      </button>
    );
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileApi.getMyProfile();
        if (data) {
          setProfileName(data.name || "");
          setOriginalName(data.name || "");
          setProfileEmail(data.email || "");
        }
      } catch (error: any) {
        toast.error("Failed to load profile", { description: error.message });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      await profileApi.updateMyProfile({ name: profileName });
      setOriginalName(profileName);
      toast.success("Profile updated");
      window.dispatchEvent(new CustomEvent("profileUpdated", { detail: { name: profileName } }));
    } catch (error: any) {
      toast.error("Update failed", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = profileName !== originalName;

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 7) {
      toast.error("Security requirement", { description: "Password must be at least 7 characters long." });
      return;
    }

    setIsSaving(true);
    try {
      await profileApi.updateMyPassword({ oldPassword, newPassword, confNewPassword: confirmPassword });
      toast.success("Security updated");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error("Security update failed", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <PageTemplate currentPage={currentPage}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-1 border-l-2 border-primary/20 pl-6">
          <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase">
            Profile Configuration
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-[50ch]">
            Manage your administrative identity, visual preferences, and platform security settings.
          </p>
        </div>

        <Tabs defaultValue="details" className="w-full mt-4">
          <TabsList className="flex items-center gap-1 bg-muted/30 p-1 rounded-md border border-border h-12 w-fit">
            <TabsTrigger
              value="details"
              className="flex items-center justify-center gap-2 px-4 md:px-6 h-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider rounded-sm data-[state=active]:bg-background transition-all"
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Account Identity</span>
              <span className="sm:hidden">Account</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center justify-center gap-2 px-4 md:px-6 h-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider rounded-sm data-[state=active]:bg-background transition-all"
            >
              <LockPassword className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Security Layers</span>
              <span className="sm:hidden">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-8 space-y-8 animate-in fade-in duration-500">
            <div className="bg-card rounded-md border border-border p-4 md:p-8 py-8 md:py-10">
              <FieldGroup className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Field className="space-y-2">
                    <FieldLabel htmlFor="fullName" className="label-micro uppercase tracking-widest text-muted-foreground/70">Name</FieldLabel>
                    <Input
                      id="fullName"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Full name"
                      className="h-10 rounded-md border-border bg-background/50 focus:ring-primary/20 transition-all font-medium text-sm"
                    />
                  </Field>
                  <Field className="space-y-2">
                    <FieldLabel htmlFor="email" className="label-micro uppercase tracking-widest text-muted-foreground/70">Verified Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      value={profileEmail}
                      readOnly
                      className="h-10 rounded-md border-border bg-muted/40 cursor-not-allowed font-medium text-sm opacity-60"
                    />
                  </Field>
                </div>

                <Separator className="opacity-50" />

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base font-bold tracking-tight text-foreground uppercase">Visual System</h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      Optimize the administrative interface for your current environment.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ThemeOption 
                      mode="light" 
                      label="Neutral Light" 
                      icon={<Sun className="h-4 w-4" />}
                    />
                    <ThemeOption 
                      mode="dark" 
                      label="Technical Dark" 
                      icon={<Moon className="h-4 w-4" />}
                    />
                    <ThemeOption 
                      mode="system" 
                      label="Automatic" 
                      icon={<Monitor className="h-4 w-4" />}
                    />
                  </div>
                </div>
              </FieldGroup>
              
              <div className="mt-12 flex justify-end">
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={isSaving || !hasChanges}
                  className="w-full sm:w-auto h-11 px-8 rounded-md font-bold tracking-tight bg-primary hover:bg-primary/90 transition-all"
                >
                  {isSaving && <SpinnerCustom className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-8 animate-in fade-in duration-500">
            <div className="bg-card rounded-md border border-border p-4 md:p-8 py-8 md:py-10">
              <div className="mb-8">
                 <h3 className="text-lg font-bold tracking-tighter uppercase text-foreground">Authentication & Security</h3>
                 <p className="text-sm text-muted-foreground font-medium">Update your access credentials to maintain account security.</p>
              </div>

              <FieldGroup className="max-w-md space-y-6">
                <Field className="space-y-2">
                  <FieldLabel htmlFor="currentPassword" className="label-micro uppercase tracking-widest text-muted-foreground/70">Current Credentials</FieldLabel>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrent ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Current password"
                      className="h-10 pr-10 rounded-md border-border bg-background focus:ring-primary/20 transition-all font-medium text-sm"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-2 flex items-center px-1 text-muted-foreground/40"
                      onClick={() => setShowCurrent(!showCurrent)}
                    >
                      {showCurrent ? <EyeClosed className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>

                <Separator className="opacity-30" />

                <Field className="space-y-2">
                  <FieldLabel htmlFor="newPassword" className="label-micro uppercase tracking-widest text-muted-foreground/70">New Secure Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 7 characters"
                      className="h-10 pr-10 rounded-md border-border bg-background focus:ring-primary/20 transition-all font-medium text-sm"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-2 flex items-center px-1 text-muted-foreground/40"
                      onClick={() => setShowNew(!showNew)}
                    >
                      {showNew ? <EyeClosed className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>
                <Field className="space-y-2">
                  <FieldLabel htmlFor="confirmPassword" className="label-micro uppercase tracking-widest text-muted-foreground/70">Validate New Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="h-10 pr-10 rounded-md border-border bg-background focus:ring-primary/20 transition-all font-medium text-sm"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-2 flex items-center px-1 text-muted-foreground/40"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <EyeClosed className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>
              </FieldGroup>
              
              <div className="mt-12 flex justify-start">
                <Button 
                  onClick={handleChangePassword} 
                  disabled={isSaving}
                  className="w-full sm:w-auto h-11 px-8 rounded-md font-bold tracking-tight bg-primary hover:bg-primary/90 transition-all"
                >
                  {isSaving && <SpinnerCustom className="mr-2 h-4 w-4" />}
                  Update Credentials
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
}
