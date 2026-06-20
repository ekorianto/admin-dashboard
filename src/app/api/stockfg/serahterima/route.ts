import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getAllSerahterimaFG,
  getAllSerahterimaSFG,
  getAllCo1F,
} from "@/lib/stockfg/data";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "fg";

  try {
    let data: unknown[] = [];

    if (type === "fg") {
      data = await getAllSerahterimaFG();
    } else if (type === "sfg") {
      data = await getAllSerahterimaSFG();
    } else if (type === "co1f") {
      data = await getAllCo1F();
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = (err as Error).message;
    if (message.includes("googleapis") || message.includes("Cannot find module")) {
      return NextResponse.json({ error: message, setup: true }, { status: 500 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
