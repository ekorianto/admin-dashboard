import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllOutputPacking } from "@/lib/stockfg/data";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getAllOutputPacking();
    return NextResponse.json(data);
  } catch (err) {
    const message = (err as Error).message;
    if (message.includes("googleapis") || message.includes("Cannot find module")) {
      return NextResponse.json({ error: message, setup: true }, { status: 500 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
