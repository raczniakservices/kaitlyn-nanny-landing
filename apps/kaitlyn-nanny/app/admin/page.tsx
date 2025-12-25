import Link from "next/link";

export default function AdminHomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 px-4 py-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="text-xs font-extrabold tracking-widest text-slate-500">ADMIN</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">Care with Kaitlyn – Admin</h1>
        <p className="mt-2 text-sm font-semibold text-slate-700">
          View care requests submitted from the landing page.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/admin/kaitlyn-intakes"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white shadow-sm"
          >
            Open requests inbox →
          </Link>
        </div>

        <div className="mt-4 text-xs font-semibold text-slate-500">
          Tip: set <code className="font-bold">ADMIN_BASIC_USER</code> and <code className="font-bold">ADMIN_BASIC_PASS</code> on Render to
          password-protect this area.
        </div>
      </div>
    </main>
  );
}



