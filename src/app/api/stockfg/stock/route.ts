import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStockFGData, getStockSFGData, getForecastFG, getNoSPKFG } from "@/lib/stockfg/data";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "fg";
  const filter = url.searchParams.get("filter") || "all";

  try {
    let data: unknown[] = [];

    if (type === "fg") {
      const fgData = await getStockFGData();
      if (filter === "low") {
        const thr = parseInt(process.env.LOW_STOCK_THRESHOLD || "10");
        data = fgData.filter((r) => r._qtySertim > 0 && r._qtySertim <= thr);
      } else if (filter === "nospk") {
        data = await getNoSPKFG();
      } else if (filter === "forecast") {
        data = await getForecastFG();
      } else {
        data = fgData;
      }
    } else if (type === "sfg") {
      const sfgData = await getStockSFGData();
      if (filter === "low") {
        const thr = parseInt(process.env.LOW_STOCK_THRESHOLD || "10");
        data = sfgData.filter((r) => Number(r._qtySFG) > 0 && Number(r._qtySFG) <= thr);
      } else {
        data = sfgData;
      }
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = (err as Error).message;
    if (message.includes("googleapis") || message.includes("Cannot find module")) {
      return NextResponse.json(
        { error: message, setup: true },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
