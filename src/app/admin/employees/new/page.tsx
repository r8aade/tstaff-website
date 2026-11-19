import Link from "next/link";
import { NewEmployeeForm } from "@/components/admin/forms";

export default function NewEmployeePage() {
  return (
    <div>
      <Link href="/admin/employees" className="text-sm text-brand-600">&larr; Back to employees</Link>
      <h1 className="mt-2 text-2xl font-bold text-ink-900">New Employee</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-700">
        They sign in at talntstaffing.com/login with this email and password, then add the app to their phone&apos;s
        home screen. After creating them, assign them to a client so they can clock in.
      </p>
      <div className="mt-6 max-w-3xl rounded-lg border border-ink-900/10 bg-white p-6">
        <NewEmployeeForm />
      </div>
    </div>
  );
}
