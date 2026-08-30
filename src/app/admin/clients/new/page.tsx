import Link from "next/link";
import NewClientForm from "@/components/NewClientForm";

export default function NewClientPage() {
  return (
    <div>
      <Link href="/admin" className="text-sm text-brand-600">
        &larr; Back to clients
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-ink-900">New Client</h1>
      <p className="mt-1 text-sm text-ink-700">
        Give them the email and temporary password so they can log in — they can be told to keep it
        or you can rotate it later.
      </p>
      <NewClientForm />
    </div>
  );
}
