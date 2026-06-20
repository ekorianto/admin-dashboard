import { DashboardSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-4 lg:p-0">
      <DashboardSkeleton />
    </div>
  );
}
