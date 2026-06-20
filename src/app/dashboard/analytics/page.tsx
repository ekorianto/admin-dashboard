import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { BarChart3 } from "lucide-react";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
        <BarChart3 className="w-8 h-8 text-purple-600" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900">Analytics Lanjutan</h2>
      <p className="text-slate-500 mt-1">Halaman ini sedang dalam pengembangan</p>
    </div>
  );
}
