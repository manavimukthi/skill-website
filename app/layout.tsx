import type { Metadata } from "next";
import { Archivo_Black, DM_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { readDB } from "@/lib/db";
import "./globals.css";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-share-tech-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkillForge — Free Claude AI Skills Library",
  description: "Discover, download, and build free Claude AI skills. Join 2,400+ builders.",
};

const MAINTENANCE_BYPASS = ["/maintenance", "/admin", "/api/"];

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const headersList = headers();
  const pathname = headersList.get("x-pathname") ?? "";

  if (!MAINTENANCE_BYPASS.some((p) => pathname.startsWith(p))) {
    const settings = readDB("settings.json", { maintenanceMode: false }) as { maintenanceMode: boolean };
    if (settings.maintenanceMode) {
      redirect("/maintenance");
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico?v=20260508" sizes="any" />
        <link rel="icon" href="/favicon.svg?v=20260508" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.ico?v=20260508" />
        <link rel="apple-touch-icon" href="/favicon.ico?v=20260508" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('sf_theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${archivoBlack.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-dm antialiased bg-bg text-text`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
