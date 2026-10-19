
"use client";

import { useEffect, useState } from "react";
import { getApiHealth } from "@/lib/api";

type FoodItem = {
  id: number;
  name: string;
  quantity: string;
  source: string;
  status: "Pending" | "Approved" | "Rejected";
};

const STORAGE_KEY = "reahara-food-records";

const modules = [
  { title: "Overview", icon: "⌂", description: "Monitor food waste prevention and redistribution" },
  { title: "Demand & Production", icon: "▥", description: "Forecast demand and plan meal production" },
  { title: "Inventory", icon: "▤", description: "Manage food stock and expiry dates" },
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
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    function loadRecords() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        setSurplus(saved ? (JSON.parse(saved) as FoodItem[]) : initialItems);
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

  useEffect(() => {
    let active = true;

    getApiHealth()
      .then(() => {
        if (active) setApiStatus("online");
      })
      .catch(() => {
        if (active) setApiStatus("offline");
      });

    return () => {
      active = false;
    };
  }, []);

  const approved = surplus.filter((item) => item.status === "Approved").length;
  const pending = surplus.filter((item) => item.status === "Pending").length;

  const navigation = [
    { title: "Overview", href: "/" },
    { title: "Demand & Production", href: "/demand" },
    { title: "Inventory", href: "/inventory" },
    { title: "Food Verification", href: "/verification" },
    { title: "IoT & Waste Monitoring", href: "/iot" },
    { title: "Redistribution", href: "/redistribution" },
    { title: "Routes & Deliveries", href: "/routes" },
    { title: "Impact & ESG", href: "/impact" },
  ];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 md:flex">
      <aside className="bg-emerald-950 p-6 text-white md:min-h-screen md:w-72">
        <div className="mb-8">
          <p className="text-2xl font-bold">ReAhara AI</p>
          <p className="mt-1 text-sm text-emerald-200">Food Intelligence Platform</p>

          <p className="mt-3 text-xs">
            Backend:{" "}
            <span
              className={
                apiStatus === "online"
                  ? "text-green-300"
                  : apiStatus === "offline"
                  ? "text-red-300"
                  : "text-amber-300"
              }
            >
              {apiStatus === "checking"
                ? "Checking..."
                : apiStatus === "online"
                ? "Online"
                : "Offline"}
            </span>
          </p>
        </div>

        <nav aria-label="Main navigation" className="space-y-2">
          {modules.map((module, index) => {
            const link = navigation.find((item) => item.title === module.title);

            return (
              <a
                key={module.title}
                href={link?.href ?? "/"}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                  index === 0
                    ? "bg-emerald-800 font-semibold text-white"
                    : "text-emerald-100 hover:bg-emerald-900"
                }`}
              >
                <span aria-hidden="true" className="w-5 text-center">
                  {module.icon}
                </span>
                {module.title}
              </a>
            );
          })}
        </nav>

        <p className="mt-10 text-xs text-emerald-300">
          Predict · Prevent · Recover · Learn
        </p>
      </aside>

      <section className="min-w-0 flex-1 p-5 md:p-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">REAHARA AI / OVERVIEW</p>
            <h1 className="mt-2 text-3xl font-bold">Food Intelligence Dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">
              Prevent food waste. Recover surplus. Feed communities.
            </p>
          </div>

          <span className="rounded-full bg-white px-4 py-2 text-sm shadow-sm">
            System:{" "}
            <span className={apiStatus === "online" ? "font-semibold text-emerald-700" : apiStatus === "offline" ? "font-semibold text-red-600" : "font-semibold text-amber-600"}>
              {apiStatus === "checking" ? "Checking" : apiStatus === "online" ? "Connected" : "Disconnected"}
            </span>
          </span>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <article key={stat.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{stat.title}</p>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="mt-3 text-3xl font-bold">{stat.value}</p>
              <p className="mt-2 text-xs text-slate-500">{stat.note}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Surplus food records</p>
            <p className="mt-2 text-3xl font-bold">{surplus.length}</p>
            <p className="mt-2 text-xs text-slate-500">Records currently in browser storage</p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Awaiting review</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">{pending}</p>
            <p className="mt-2 text-xs text-slate-500">Pending verification</p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Approved records</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">{approved}</p>
            <p className="mt-2 text-xs text-slate-500">Approved for redistribution</p>
          </article>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Surplus Food Overview</h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest surplus records and their verification status
              </p>
            </div>
            <a href="/verification" className="text-sm font-semibold text-emerald-800 hover:underline">
              Manage records →
            </a>
          </div>

          <div className="mt-4 overflow-x-auto">
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
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          item.status === "Approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
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
          {modules
            .slice(1)
            .filter((module) => module.title !== "Inventory")
            .map((module) => {
              const link = navigation.find((item) => item.title === module.title);

              return (
                <article key={module.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{module.icon}</span>
                    <h2 className="font-semibold">{module.title}</h2>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{module.description}</p>
                  <a
                    href={link?.href ?? "/"}
                    className="mt-4 inline-block text-sm font-semibold text-emerald-800 hover:underline"
                  >
                    Open module →
                  </a>
                </article>
              );
            })}
        </section>

        <footer className="mt-8 text-xs text-slate-500">
          ReAhara AI · Food waste prevention and sustainable redistribution
        </footer>
      </section>
    </main>
  );
}

