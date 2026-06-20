import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMasterKaryawan, getMasterProduk, getMasterSPKList } from "@/lib/stockfg/data";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "karyawan";

  try {
    let data: unknown[] = [];

    if (type === "karyawan") {
      data = await getMasterKaryawan();
    } else if (type === "produk") {
      data = await getMasterProduk();
    } else if (type === "spk") {
      data = await getMasterSPKList();
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
