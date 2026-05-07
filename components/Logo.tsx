"use client";

import { useTheme } from "@/lib/theme";

export default function Logo({ height = 44 }: { height?: number }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={isDark ? "/logo-dark.svg" : "/logo-light.svg"}
      alt="TrySkill"
      height={height}
      style={{ height, width: "auto", display: "block" }}
    />
  );
}
