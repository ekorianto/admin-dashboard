import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardData, getQuickStats } from "@/lib/stockfg/data";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") || "full";

  try {
    if (mode === "quick") {
      const data = await getQuickStats();
      return NextResponse.json(data);
    }

    const data = await getDashboardData();
    return NextResponse.json(data);
  } catch (err) {
    const message = (err as Error).message || "Gagal memuat data dashboard";

    // Check if googleapis is missing
    if (message.includes("googleapis") || message.includes("Cannot find module")) {
      return NextResponse.json(
        {
          error: message,
          setup: true,
          message: "Package 'googleapis' belum terinstall. Buka CMD dan jalankan: cd admin-dashboard && npm install googleapis",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
