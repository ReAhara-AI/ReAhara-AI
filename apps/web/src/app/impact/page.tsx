
"use client";

const metrics = [
  { title: "Food Recovered", value: "55 kg", note: "Illustrative demo total" },
  { title: "Meals Supported", value: "120", note: "Illustrative estimate" },
  { title: "Waste Prevented", value: "35 kg", note: "Sample tracking metric" },
  { title: "CO₂e Avoided", value: "42 kg", note: "Illustrative estimate" },
];

const activities = [
  { activity: "Surplus food recovered", value: "55 kg" },
  { activity: "Recipient organizations supported", value: "2" },
  { activity: "Deliveries completed", value: "1" },
  { activity: "Food waste prevention actions", value: "8" },
];

export default function ImpactPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-emerald-950 p-6 text-white">
        <a href="/" className="text-sm text-emerald-200 hover:underline">
          ← Back to Dashboard
        </a>
        <h1 className="mt-3 text-3xl font-bold">Impact & ESG Dashboard</h1>
        <p className="mt-2 text-emerald-100">
          Track food recovery, waste prevention and sustainability indicators.
        </p>
      </header>

      <section className="p-5 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Impact Summary</h2>
            <p className="mt-1 text-sm text-slate-600">
              Sample figures for the ReAhara AI prototype.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-emerald-800 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            Print / Save as PDF
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.title} className="rounded-xl border bg-white p-5">
              <p className="text-sm text-slate-500">{metric.title}</p>
              <p className="mt-3 text-3xl font-bold text-emerald-800">
                {metric.value}
              </p>
              <p className="mt-2 text-xs text-slate-500">{metric.note}</p>
            </article>
          ))}
        </div>

        <section className="mt-6 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-bold">Sustainability Activity Report</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[400px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">Indicator</th>
                  <th className="p-3">Demo Value</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity.activity} className="border-t">
                    <td className="p-3">{activity.activity}</td>
                    <td className="p-3 font-semibold">{activity.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-bold">ESG Reporting</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <article className="rounded-lg bg-emerald-50 p-4">
              <h3 className="font-semibold text-emerald-950">Environmental</h3>
              <p className="mt-2 text-sm text-slate-700">
                Track food waste avoided and estimated emissions impact.
              </p>
            </article>
            <article className="rounded-lg bg-blue-50 p-4">
              <h3 className="font-semibold text-blue-950">Social</h3>
              <p className="mt-2 text-sm text-slate-700">
                Track food redistribution and recipient organizations supported.
              </p>
            </article>
            <article className="rounded-lg bg-amber-50 p-4">
              <h3 className="font-semibold text-amber-950">Governance</h3>
              <p className="mt-2 text-sm text-slate-700">
                Maintain records of approvals, deliveries and impact calculations.
              </p>
            </article>
          </div>
        </section>

        <p className="mt-5 text-xs text-slate-500">
          Prototype only. All metrics are illustrative, not measured project results.
          Print / Save as PDF uses your browser's print dialog. Connect verified
          backend data and documented calculation methods before reporting actual impact.
        </p>
      </section>
    </main>
  );
}
