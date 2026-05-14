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
  metadataBase: new URL("https://www.tryskill.me"),

  title: {
    default: "TRYSKILL — Free Claude AI Skills Library | 940+ Free Skills",
    template: "%s | TRYSKILL",
  },
  description:
    "TRYSKILL is the #1 free Claude AI skills library. Download 940+ community-built Claude skills for writing, coding, marketing, research & automation.",
  keywords: [
    "Claude skills",
    "Claude skill",
    "Claude AI skills",
    "free Claude skills",
    "Claude skills library",
    "Claude AI skill examples",
    "download Claude skills",
    "Claude prompt library",
    "build Claude skill",
    "Claude skill marketplace",
  ],

  alternates: {
    canonical: "https://www.tryskill.me",
  },

  openGraph: {
    type: "website",
    url: "https://www.tryskill.me",
    siteName: "TRYSKILL",
    title: "TRYSKILL — Free Claude AI Skills Library | 940+ Free Skills",
    description:
      "TRYSKILL is the #1 free Claude AI skills library. Download 940+ community-built Claude skills for writing, coding, marketing, research & automation.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TRYSKILL — Free Claude AI Skills Library",
      },
    ],
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "TRYSKILL — Free Claude AI Skills Library | 940+ Free Skills",
    description:
      "TRYSKILL is the #1 free Claude AI skills library. Download 940+ community-built Claude skills for writing, coding, marketing, research & automation.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  verification: {
    google: "shKUN-N3nJj8vLyz2F6rKgXAEbwwX3qdLcXxDsk5Fiw",
  },
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
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('sf_theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "TrySkill",
              alternateName: "TRYSKILL",
              url: "https://www.tryskill.me",
              description:
                "TRYSKILL is the #1 free Claude AI skills library. Download 940+ community-built Claude skills for writing, coding, marketing, research & automation.",
            }),
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
