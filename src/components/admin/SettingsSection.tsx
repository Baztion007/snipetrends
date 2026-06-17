"use client";

import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Save,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  ExternalLink,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface SettingsData {
  amazonAssociateTag: string;
  amazonBaseUrl: string;
  siteName: string;
  contactEmail: string;
  disclosureOverride: string;
  socialTwitter: string;
  socialInstagram: string;
  socialYoutube: string;
  socialGithub: string;
}

const DEFAULTS: SettingsData = {
  amazonAssociateTag: "",
  amazonBaseUrl: "https://www.amazon.com",
  siteName: "ShopAffiliate",
  contactEmail: "",
  disclosureOverride: "",
  socialTwitter: "",
  socialInstagram: "",
  socialYoutube: "",
  socialGithub: "",
};

export function SettingsSection() {
  const [settings, setSettings] = useState<SettingsData>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password change state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (!cancelled && data.settings) setSettings({ ...DEFAULTS, ...data.settings });
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (k: keyof SettingsData, v: string) =>
    setSettings((s) => ({ ...s, [k]: v }));

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");
      toast.success("Settings saved", {
        description: "Affiliate configuration updated.",
      });
    } catch (err) {
      toast.error("Save failed", { description: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast.error("Passwords don't match", {
        description: "New password and confirmation must match.",
      });
      return;
    }
    setPwBusy(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Password change failed");
      }
      toast.success("Password changed", {
        description: "Use your new password next time you sign in.",
      });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err) {
      toast.error("Could not change password", {
        description: (err as Error).message,
      });
    } finally {
      setPwBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your Amazon affiliate details and account security
        </p>
      </div>

      {/* Affiliate configuration */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <SettingsIcon className="h-4 w-4 text-amber-500" />
            Affiliate Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveSettings} className="space-y-4">
            {/* Amazon Associate tag — the key field */}
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 size-4 shrink-0 text-amber-500" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">
                    Where do I add my Amazon affiliate links?
                  </p>
                  <p className="mt-1">
                    Enter your <strong>Amazon Associates tracking ID</strong>{" "}
                    below (e.g.{" "}
                    <code className="rounded bg-amber-500/15 px-1 text-amber-700 dark:text-amber-400">
                      yourstore-20
                    </code>
                    ). It will be appended as{" "}
                    <code className="rounded bg-amber-500/15 px-1 text-amber-700 dark:text-amber-400">
                      ?tag=...
                    </code>{" "}
                    to every product's affiliate URL automatically — no need to
                    edit each product. You get this tag from the{" "}
                    <a
                      href="https://affiliate-program.amazon.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 font-medium text-amber-600 underline"
                    >
                      Amazon Associates dashboard
                      <ExternalLink className="size-3" />
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tag">
                  Amazon Associate Tag <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="tag"
                  value={settings.amazonAssociateTag}
                  onChange={(e) => set("amazonAssociateTag", e.target.value)}
                  placeholder="yourstore-20"
                  disabled={loading || saving}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Your tracking ID from Amazon Associates.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseurl">Amazon Base URL</Label>
                <Input
                  id="baseurl"
                  value={settings.amazonBaseUrl}
                  onChange={(e) => set("amazonBaseUrl", e.target.value)}
                  placeholder="https://www.amazon.com"
                  disabled={loading || saving}
                />
                <p className="text-xs text-muted-foreground">
                  Use your local Amazon (e.g. .co.uk, .de, .ca).
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sitename">Site Name</Label>
                <Input
                  id="sitename"
                  value={settings.siteName}
                  onChange={(e) => set("siteName", e.target.value)}
                  disabled={loading || saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => set("contactEmail", e.target.value)}
                  placeholder="hello@example.com"
                  disabled={loading || saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disclosure">Custom Affiliate Disclosure (optional)</Label>
              <Textarea
                id="disclosure"
                rows={2}
                value={settings.disclosureOverride}
                onChange={(e) => set("disclosureOverride", e.target.value)}
                placeholder="Leave blank to use the default Amazon Associates disclosure."
                disabled={loading || saving}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="tw">Twitter URL</Label>
                <Input
                  id="tw"
                  value={settings.socialTwitter}
                  onChange={(e) => set("socialTwitter", e.target.value)}
                  placeholder="https://twitter.com/..."
                  disabled={loading || saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ig">Instagram URL</Label>
                <Input
                  id="ig"
                  value={settings.socialInstagram}
                  onChange={(e) => set("socialInstagram", e.target.value)}
                  placeholder="https://instagram.com/..."
                  disabled={loading || saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yt">YouTube URL</Label>
                <Input
                  id="yt"
                  value={settings.socialYoutube}
                  onChange={(e) => set("socialYoutube", e.target.value)}
                  placeholder="https://youtube.com/@..."
                  disabled={loading || saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gh">GitHub URL</Label>
                <Input
                  id="gh"
                  value={settings.socialGithub}
                  onChange={(e) => set("socialGithub", e.target.value)}
                  placeholder="https://github.com/..."
                  disabled={loading || saving}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving || loading}
                className="bg-amber-500 text-zinc-950 hover:bg-amber-400"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password change */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4 text-amber-500" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="curpw">Current Password</Label>
              <div className="relative">
                <Input
                  id="curpw"
                  type={showPw ? "text" : "password"}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  required
                  disabled={pwBusy}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPw ? "Hide passwords" : "Show passwords"}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newpw">New Password</Label>
                <Input
                  id="newpw"
                  type={showPw ? "text" : "password"}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  required
                  disabled={pwBusy}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmpw">Confirm New Password</Label>
                <Input
                  id="confirmpw"
                  type={showPw ? "text" : "password"}
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  required
                  disabled={pwBusy}
                />
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
              <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
              <p>
                Password must be at least 8 characters and include both letters
                and numbers. Choose a strong, unique password.
              </p>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={pwBusy}
                className="bg-amber-500 text-zinc-950 hover:bg-amber-400"
              >
                {pwBusy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="mr-2 h-4 w-4" />
                )}
                Update password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsSection;
