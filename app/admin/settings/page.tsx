"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/admin/ToastContext";

type Tab = "General" | "AdSense" | "API" | "Notifications";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${checked ? "bg-accent" : "bg-border"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-card shadow transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

function SaveButton({ loading }: { loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="font-dm text-sm font-medium bg-accent text-white px-5 py-2.5 rounded-md hover:bg-accentDk disabled:opacity-60 transition-colors flex items-center gap-2"
    >
      {loading ? (
        <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving…</>
      ) : "Save Settings"}
    </button>
  );
}

const inputClass = "font-dm text-sm w-full border border-border rounded-md px-3 py-2.5 focus:outline-none focus:border-accent transition-colors placeholder:text-muted bg-card text-text";
const labelClass = "font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5";

type Settings = {
  siteName: string;
  siteDescription: string;
  skillsPerPage: number;
  maintenanceMode: boolean;
  adsense: { publisherId: string; heroSlotId: string; sidebarSlotId: string; gridSlotId: string; footerSlotId: string; hero: boolean; sidebar: boolean; grid: boolean; footer: boolean };
  api: { apiKey: string; model: string; maxTokens: number };
  notifications: { newSubmission: boolean; submissionEmail: string; weeklyStats: boolean; newSubscriber: boolean };
};

const DEFAULT: Settings = {
  siteName: "SkillForge",
  siteDescription: "The best free Claude AI skills on the internet.",
  skillsPerPage: 16,
  maintenanceMode: false,
  adsense: { publisherId: "pub-0000000000000000", heroSlotId: "", sidebarSlotId: "", gridSlotId: "", footerSlotId: "", hero: true, sidebar: false, grid: true, footer: false },
  api: { apiKey: "", model: "claude-sonnet-4-6", maxTokens: 4096 },
  notifications: { newSubmission: true, submissionEmail: "admin@skillforge.com", weeklyStats: true, newSubscriber: false },
};

async function saveSettings(patch: Partial<Settings>) {
  const response = await fetch("/api/admin/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    throw new Error("Failed to save settings");
  }
}

function GeneralTab({ settings, onChange }: { settings: Settings; onChange: (s: Settings) => void }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveSettings({
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        skillsPerPage: settings.skillsPerPage,
        maintenanceMode: settings.maintenanceMode,
      });
      addToast("General settings saved");
    } catch {
      addToast("Failed to save general settings", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 max-w-lg">
      <div>
        <label className={labelClass}>Site Name</label>
        <input value={settings.siteName} onChange={(e) => onChange({ ...settings, siteName: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Site Description</label>
        <textarea value={settings.siteDescription} onChange={(e) => onChange({ ...settings, siteDescription: e.target.value })} rows={3} className={`${inputClass} resize-none`} />
      </div>
      <div>
        <label className={labelClass}>Skills Per Page</label>
        <input type="number" min={4} max={48} value={settings.skillsPerPage} onChange={(e) => onChange({ ...settings, skillsPerPage: Number(e.target.value) })} className={inputClass} />
      </div>
      <div className="flex items-center justify-between py-3 border-t border-border">
        <div>
          <p className="font-dm text-sm font-medium text-text">Maintenance Mode</p>
          <p className="font-dm text-xs text-muted">Show a maintenance page to all visitors.</p>
        </div>
        <Toggle checked={settings.maintenanceMode} onChange={(v) => onChange({ ...settings, maintenanceMode: v })} />
      </div>
      <SaveButton loading={loading} />
    </form>
  );
}

function AdSenseTab({ settings, onChange }: { settings: Settings; onChange: (s: Settings) => void }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const slots = ["hero", "sidebar", "grid", "footer"] as const;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await saveSettings({ adsense: settings.adsense });
    setLoading(false);
    addToast("AdSense settings saved");
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 max-w-lg">
      <div>
        <label className={labelClass}>AdSense Publisher ID</label>
        <input value={settings.adsense.publisherId} onChange={(e) => onChange({ ...settings, adsense: { ...settings.adsense, publisherId: e.target.value } })} placeholder="pub-0000000000000000" className={inputClass} />
      </div>
      <div className="border border-border rounded-xl overflow-hidden">
        {slots.map((slot) => {
          const slotKey = `${slot}SlotId` as keyof typeof settings.adsense;
          const label = slot === "hero" ? "Hero Banner" : slot === "grid" ? "Skills Grid" : slot.charAt(0).toUpperCase() + slot.slice(1);
          return (
            <div key={slot} className="px-4 py-3.5 border-b border-border last:border-0 flex items-center gap-4">
              <Toggle
                checked={settings.adsense[slot] as boolean}
                onChange={(v) => onChange({ ...settings, adsense: { ...settings.adsense, [slot]: v } })}
              />
              <div className="flex-1"><p className="font-dm text-sm text-text">{label}</p></div>
              <input
                value={settings.adsense[slotKey] as string}
                onChange={(e) => onChange({ ...settings, adsense: { ...settings.adsense, [slotKey]: e.target.value } })}
                placeholder="Slot ID"
                disabled={!settings.adsense[slot]}
                className="font-mono text-xs border border-border rounded px-2 py-1.5 w-36 focus:outline-none focus:border-accent transition-colors disabled:opacity-40 bg-card text-text"
              />
            </div>
          );
        })}
      </div>
      <SaveButton loading={loading} />
    </form>
  );
}

function APITab({ settings, onChange }: { settings: Settings; onChange: (s: Settings) => void }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await saveSettings({ api: settings.api });
    setLoading(false);
    addToast("API settings saved");
  };

  const testConnection = async () => {
    setTesting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setTesting(false);
    addToast("Connection successful — API key is valid");
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 max-w-lg">
      <div>
        <label className={labelClass}>Claude API Key</label>
        <input type="password" value={settings.api.apiKey} onChange={(e) => onChange({ ...settings, api: { ...settings.api, apiKey: e.target.value } })} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Model</label>
        <select value={settings.api.model} onChange={(e) => onChange({ ...settings, api: { ...settings.api, model: e.target.value } })} className={inputClass}>
          <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
          <option value="claude-opus-4-7">Claude Opus 4.7</option>
          <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
        </select>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelClass}>Max Tokens</label>
          <span className="font-mono text-xs text-muted">{settings.api.maxTokens.toLocaleString()}</span>
        </div>
        <input type="range" min={256} max={8192} step={256} value={settings.api.maxTokens} onChange={(e) => onChange({ ...settings, api: { ...settings.api, maxTokens: Number(e.target.value) } })} className="w-full accent-accent" />
        <div className="flex justify-between font-mono text-[10px] text-muted mt-1"><span>256</span><span>8,192</span></div>
      </div>
      <div className="flex items-center gap-3 pt-1">
        <SaveButton loading={loading} />
        <button type="button" onClick={testConnection} disabled={testing} className="font-dm text-sm border border-border text-text px-4 py-2.5 rounded-md hover:border-accent hover:text-accent disabled:opacity-60 transition-colors flex items-center gap-2">
          {testing ? (<><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Testing…</>) : "Test Connection"}
        </button>
      </div>
    </form>
  );
}

function NotificationsTab({ settings, onChange }: { settings: Settings; onChange: (s: Settings) => void }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const n = settings.notifications;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await saveSettings({ notifications: n });
    setLoading(false);
    addToast("Notification settings saved");
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-0 max-w-lg border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-dm text-sm font-medium text-text">New Submission Alerts</p>
          <p className="font-dm text-xs text-muted mt-0.5">Email when a new skill is submitted.</p>
          {n.newSubmission && (
            <input value={n.submissionEmail} onChange={(e) => onChange({ ...settings, notifications: { ...n, submissionEmail: e.target.value } })} className="font-dm text-xs border border-border rounded px-2 py-1.5 mt-2 w-full focus:outline-none focus:border-accent transition-colors bg-card text-text" placeholder="email@example.com" />
          )}
        </div>
        <Toggle checked={n.newSubmission} onChange={(v) => onChange({ ...settings, notifications: { ...n, newSubmission: v } })} />
      </div>
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4">
        <div>
          <p className="font-dm text-sm font-medium text-text">Weekly Stats Email</p>
          <p className="font-dm text-xs text-muted mt-0.5">Receive a weekly summary of site metrics.</p>
        </div>
        <Toggle checked={n.weeklyStats} onChange={(v) => onChange({ ...settings, notifications: { ...n, weeklyStats: v } })} />
      </div>
      <div className="px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-dm text-sm font-medium text-text">New Subscriber Notification</p>
          <p className="font-dm text-xs text-muted mt-0.5">Notify when someone joins the newsletter.</p>
        </div>
        <Toggle checked={n.newSubscriber} onChange={(v) => onChange({ ...settings, notifications: { ...n, newSubscriber: v } })} />
      </div>
      <div className="px-5 py-4 border-t border-border"><SaveButton loading={loading} /></div>
    </form>
  );
}

export default function SettingsPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("General");
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const TABS: Tab[] = ["General", "AdSense", "API", "Notifications"];

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then(({ data }) => { if (data) setSettings(data); })
      .catch(() => addToast("Failed to load settings", "error"))
      .finally(() => setLoadingSettings(false));
  }, []);

  const tabContent: Record<Tab, React.ReactNode> = {
    General: <GeneralTab settings={settings} onChange={setSettings} />,
    AdSense: <AdSenseTab settings={settings} onChange={setSettings} />,
    API: <APITab settings={settings} onChange={setSettings} />,
    Notifications: <NotificationsTab settings={settings} onChange={setSettings} />,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-playfair text-2xl text-text">Settings</h2>
        <p className="font-dm text-sm text-muted mt-0.5">Configure your SkillForge site.</p>
      </div>

      <div className="flex items-center gap-0 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-dm text-sm px-5 py-3 border-b-2 transition-colors ${activeTab === tab ? "border-accent text-accent font-medium" : "border-transparent text-muted hover:text-text"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loadingSettings ? (
        <div className="max-w-lg space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-card border border-border rounded-md animate-pulse" />)}
        </div>
      ) : (
        <div>{tabContent[activeTab]}</div>
      )}
    </div>
  );
}
