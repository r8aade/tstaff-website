const STYLES: Record<string, { label: string; cls: string }> = {
  OPEN: { label: "In progress", cls: "bg-blue-50 text-blue-700" },
  SUBMITTED: { label: "Waiting for review", cls: "bg-amber-50 text-amber-700" },
  APPROVED: { label: "Approved", cls: "bg-green-50 text-green-700" },
  REJECTED: { label: "Rejected", cls: "bg-red-50 text-red-700" },
  PENDING: { label: "Pending", cls: "bg-amber-50 text-amber-700" },
  DENIED: { label: "Denied", cls: "bg-red-50 text-red-700" },
  CANCELLED: { label: "Cancelled", cls: "bg-ink-900/5 text-ink-700" },
  ACTIVE: { label: "Active", cls: "bg-green-50 text-green-700" },
  INACTIVE: { label: "Inactive", cls: "bg-ink-900/5 text-ink-700" }
};

export default function StatusBadge({ status }: { status: string }) {
  const s = STYLES[status] ?? { label: status, cls: "bg-ink-900/5 text-ink-700" };
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}
