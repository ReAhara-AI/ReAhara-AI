
"use client";

import { useEffect, useState } from "react";

type FoodItem = {
  id: number;
  name: string;
  quantity: string;
  source: string;
  status: "Pending" | "Approved" | "Rejected";
};

const STORAGE_KEY = "reahara-food-records";

const modules = [
  { title: "Overview", icon: "◫", description: "Monitor food operations and impact" },
  { title: "Demand & Production", icon: "⌁", description: "Forecast meals and plan production" },
  { title: "Inventory", icon: "▤", description: "Track ingredients and stock" },
  { title: "Food Verification", icon: "✓", description: "Review surplus food quality" },
  { title: "IoT & Waste Monitoring", icon: "⌘", description: "Monitor storage and waste" },
  { title: "Redistribution", icon: "⇄", description: "Match recipients and plan delivery" },
  { title: "Routes & Deliveries", icon: "↗", description: "Track delivery progress" },
  { title: "Impact & ESG", icon: "◎", description: "Measure environmental impact" },
];

const stats = [
  { title: "Predicted Meals", value: "1,250", note: "Illustrative daily forecast", icon: "🍽️" },
  { title: "NGO Partners", value: "12", note: "Demo recipient organizations", icon: "🤝" },
  { title: "CO₂e Avoided", value: "42 kg", note: "Illustrative impact estimate", icon: "🌱" },
];

const initialItems: FoodItem[] = [
  { id: 1, name: "Cooked rice", quantity: "25 kg", source: "Central Kitchen", status: "Pending" },
  { id: 2, name: "Vegetable curry", quantity: "18 kg", source: "North Campus", status: "Pending" },
  { id: 3, name: "Fresh bread", quantity: "12 kg", source: "Cafeteria B", status: "Pending" },
];

export default function Home() {
  const [surplus, setSurplus] = useState<FoodItem[]>(initialItems);

  useEffect(() => {
    function loadRecords() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        setSurplus(saved ? JSON.parse(saved) as FoodItem[] : initialItems);
      } catch {
        setSurplus(initialItems);
      }
    }

    loadRecords();
    window.addEventListener("focus", loadRecords);
    window.addEventListener("storage", loadRecords);

    return () => {
      window.removeEventListener("focus", loadRecords);
      window.removeEventListener("storage", loadRecords);
    };
  }, []);

  const approved = surplus.filter((item) => item.status === "Approved").length;
  const pending = surplus.filter((item) => item.status === "Pending").length;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 md:flex">
      <aside className="bg-emerald-950 p-6 text-white md:min-h-screen md:w-72">
        <div className="mb-8">
          <p className="text-2xl font-bold">ReAhara AI</p>
          <p className="mt-1 text-sm text-emerald-200">Food Intelligence Platform</p>
        </div>

        <nav aria-label="Main navigation" className="space-y-2">
          {modules.map((module, index) => (
            <a
              key={module.title}
              href={
  module.title === "Overview" ? "/" :
  module.title === "Demand & Production" ? "/demand" :
  module.title === "Inventory" ? "/inventory" :
  module.title === "Food Verification" ? "/verification" :
  module.title === "IoT & Waste Monitoring" ? "/iot" :
  module.title === "Redistribution" ? "/redistribution" :
  module.title === "Routes & Deliveries" ? "/routes" :
  module.title === "Impact & ESG" ? "/impact" :
  "/"
}
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

        <p className="mt-10 text-xs text-emerald-300">Predict · Prevent · Recover · Learn</p>
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
          <span className="rounded-full border bg-white px-4 py-2 text-sm">Demo environment</span>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.slice(0, 1).map((stat) => (
            <article key={stat.title} className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-600">{stat.title}</p>
              <p className="mt-4 text-3xl font-bold">{stat.value}</p>
              <p className="mt-2 text-xs text-slate-500">{stat.note}</p>
            </article>
          ))}

          <article className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Surplus Food Records</p>
            <p className="mt-4 text-3xl font-bold">{surplus.length}</p>
            <p className="mt-2 text-xs text-slate-500">Stored in this browser</p>
          </article>

          <article className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Pending Review</p>
            <p className="mt-4 text-3xl font-bold">{pending}</p>
            <p className="mt-2 text-xs text-slate-500">Awaiting verification</p>
          </article>

          <article className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Approved Food Records</p>
            <p className="mt-4 text-3xl font-bold">{approved}</p>
            <p className="mt-2 text-xs text-slate-500">Approved in verification</p>
          </article>
        </div>

        <section className="mt-6 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-bold">ReAhara closed-loop workflow</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
            {["Predict", "Prevent", "Detect", "Verify", "Match", "Route", "Measure", "Learn"].map((step, index) => (
              <div key={step} className="rounded-lg bg-emerald-50 p-3 text-center">
                <span className="text-xs text-emerald-700">{index + 1}</span>
                <p className="mt-1 text-sm font-semibold text-emerald-950">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-xl border bg-white p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">Surplus Food Inventory</h2>
            <a href="/verification" className="text-sm font-semibold text-emerald-800 hover:underline">
              Review food →
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">Food</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Kitchen</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {surplus.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3">{item.quantity}</td>
                    <td className="p-3">{item.source}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-1 text-xs ${
                        item.status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                        item.status === "Rejected" ? "bg-red-100 text-red-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Demo data saved in browser storage, not a shared database.
          </p>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          {modules.slice(1).filter((module) => !["Inventory"].includes(module.title)).map((module) => (
            <article key={module.title} className="rounded-xl border bg-white p-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{module.icon}</span>
                <h2 className="font-semibold">{module.title}</h2>
              </div>
              <p className="mt-2 text-sm text-slate-600">{module.description}</p>
              {module.title === "Food Verification" ? (
                <a href="/verification" className="mt-4 inline-block text-sm font-semibold text-emerald-800 hover:underline">
                  Open verification page →
                </a>
              ) : (
                <p className="mt-4 text-xs text-slate-400">Feature screen pending integration.</p>
              )}
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
