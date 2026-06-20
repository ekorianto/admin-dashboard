import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserTable } from "@/components/users/user-table";
import { Users } from "lucide-react";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { orders: true, createdProducts: true },
      },
    },
  });

  const safeUsers = users.map((u) => ({
    ...u,
    password: undefined,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen User</h1>
          <p className="text-sm text-slate-500">{users.length} user terdaftar</p>
        </div>
      </div>

      <UserTable users={safeUsers as any} />
    </div>
  );
}
