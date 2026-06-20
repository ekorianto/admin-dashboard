import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { downloadCsv, USER_HEADERS } from "@/lib/excel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const data = users.map((u) => ({
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    position: u.position || "-",
    department: u.department || "-",
    phone: u.phone || "-",
    joinDate: u.joinDate.toLocaleDateString("id-ID"),
  }));

  return downloadCsv(data, USER_HEADERS, `users_${new Date().toISOString().split("T")[0]}`);
}
