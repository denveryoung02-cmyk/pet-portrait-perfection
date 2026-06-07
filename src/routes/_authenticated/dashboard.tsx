import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  return <Outlet />;
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    processing: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    failed: "bg-red-500/15 text-red-700 dark:text-red-300",
    rejected: "bg-red-500/15 text-red-700 dark:text-red-300",
  };
  return <span className={`inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${map[status] ?? "bg-secondary"}`}>{status}</span>;
}
