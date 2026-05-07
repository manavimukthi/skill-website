import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = readDB("settings.json", { maintenanceMode: false });
  return NextResponse.json(
    { maintenanceMode: (settings as { maintenanceMode: boolean }).maintenanceMode ?? false },
    { headers: { "Cache-Control": "no-store" } }
  );
}
