
const modules = [
  { title: "Overview", description: "Monitor food operations and impact", icon: "◫" },
  { title: "Demand & Production", description: "Forecast demand and plan batches", icon: "⌁" },
  { title: "Inventory", description: "Track ingredients and stock", icon: "▤" },
  { title: "Food Verification", description: "Review surplus and food condition", icon: "✓" },
  { title: "IoT & Waste Monitoring", description: "Monitor storage and equipment", icon: "⌘" },
  { title: "Redistribution", description: "Match recipients and plan delivery", icon: "⇄" },
  { title: "Routes & Deliveries", description: "Track delivery progress", icon: "↗" },
  { title: "Impact & ESG", description: "Measure outcomes and create reports", icon: "◎" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 md:flex">
      <aside className="w-full bg-emerald-950 p-6 text-white md:min-h-screen md:w-72">
        <div className="mb-8">
          <p className="text-2xl font-bold">ReAhara AI</p>
          <p className="mt-1 text-sm text-emerald-200">Food Intelligence Platform</p>
        </div>

        <nav aria-label="Main navigation" className="space-y-2">
          {modules.map((module, index) => (
            <a
              key={module.title}
              href={index === 0 ? "/" : `#${module.title.toLowerCase().replaceAll(" ", "-").replaceAll("&", "and")}`}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                index === 0
                  ? "bg-emerald-800 font-semibold text-white"
                  : "text-emerald-100 hover:bg-emerald-900"
              }`}
            >
              <span aria-hidden="true" className="w-5 text-center">{module.icon}</span>
              {module.title}
            </a>
          ))}
        </nav>

        <p className="mt-10 text-xs text-emerald-300">
          Predict · Prevent · Recover · Learn
        </p>
      </aside>

      <section className="min-w-0 flex-1 p-5 md:p-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Food operations / Overview</p>
            <h1 className="mt-1 text-3xl font-bold">Operations Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Prevent avoidable surplus and intelligently recover eligible food.
            </p>
          </div>
          <span className="rounded-full border bg-white px-4 py-2 text-sm">
            Development environment
          </span>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Demand Forecast", "Awaiting data", "Predicted meal requirements"],
            ["Surplus Food", "No records yet", "Eligible surplus requires review"],
            ["Recipients", "No records yet", "Registered receiving organizations"],
            ["Estimated CO₂e Avoided", "Awaiting data", "Calculated from recorded outcomes"],
          ].map(([title, value, description]) => (
            <article key={title} className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-600">{title}</p>
              <p className="mt-4 text-xl font-bold">{value}</p>
              <p className="mt-2 text-xs text-slate-500">{description}</p>
            </article>
          ))}
        </div>

        <section className="mt-6 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-bold">ReAhara closed-loop workflow</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
            {["Predict", "Prevent", "Detect", "Verify", "Match", "Route", "Measure", "Learn"].map(
              (step, index) => (
                <div key={step} className="rounded-lg bg-emerald-50 p-3 text-center">
                  <span className="text-xs text-emerald-700">{index + 1}</span>
                  <p className="mt-1 text-sm font-semibold text-emerald-950">{step}</p>
                </div>
              ),
            )}
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Actual consumption, waste and delivery outcomes feed back into future planning.
          </p>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          {modules.slice(1).map((module) => (
            <article
              id={module.title.toLowerCase().replaceAll(" ", "-").replaceAll("&", "and")}
              key={module.title}
              className="rounded-xl border bg-white p-5"
            >
              <h2 className="font-semibold">{module.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{module.description}</p>
              <p className="mt-4 text-xs text-slate-400">
                Module setup pending — no live operational data yet.
              </p>
            </article>
          ))}
        </section>

        <footer className="mt-8 text-xs text-slate-500">
          ReAhara AI · Food waste prevention and sustainable redistribution
        </footer>
      </section>
    </main>
  );
}
