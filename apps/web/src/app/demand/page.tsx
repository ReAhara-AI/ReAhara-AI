
"use client";

import { useEffect, useState } from "react";

type InventoryItem = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  minimum: number;
  location: string;
};

export default function DemandPage() {
  const [students, setStudents] = useState("500");
  const [attendance, setAttendance] = useState("85");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const expected = Math.ceil(
    Math.max(0, Number(students) || 0) *
      (Math.min(100, Math.max(0, Number(attendance) || 0)) / 100)
  );

  const riceRequired = (expected * 100) / 1000;
  const vegetablesRequired = (expected * 80) / 1000;

  useEffect(() => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    fetch(`${apiUrl}/api/v1/inventory`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Inventory API unavailable");
        return response.json();
      })
      .then((data: InventoryItem[]) => {
        setInventory(data);
        setApiError("");
      })
      .catch(() => {
        setApiError("Could not load live inventory. Check that the backend is running.");
      })
      .finally(() => setLoading(false));
  }, []);

  const available = (keyword: string) =>
    inventory
      .filter((item) => item.name.toLowerCase().includes(keyword))
      .reduce((total, item) => total + item.quantity, 0);

  const riceAvailable = available("rice");
  const vegetablesAvailable = available("vegetable");

  function StockCard({
    title,
    required,
    stock,
  }: {
    title: string;
    required: number;
    stock: number;
  }) {
    const enough = stock >= required;

    return (
      <div className="rounded-xl bg-slate-900 p-4">
        <p className="text-sm text-slate-400">{title}</p>
        <p className="mt-2 text-2xl font-bold">{required.toLocaleString()} kg</p>
        <p className="mt-2 text-sm text-slate-300">
          Available: {loading ? "Loading..." : `${stock.toLocaleString()} kg`}
        </p>
        {!loading && !apiError && (
          <p className={`mt-2 text-sm font-semibold ${enough ? "text-emerald-400" : "text-amber-400"}`}>
            {enough ? "Stock sufficient" : `Short by ${Math.max(0, required - stock).toLocaleString()} kg`}
          </p>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
          ReAhara AI
        </p>
        <h1 className="mt-2 text-3xl font-bold">Demand & Production</h1>
        <p className="mt-2 text-slate-400">
          Estimate meal requirements and compare them with inventory.
        </p>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Planning inputs</h2>

            <label className="mt-6 block text-sm text-slate-300">
              Total registered students
            </label>
            <input
              type="number"
              min="0"
              value={students}
              onChange={(e) => setStudents(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white"
            />

            <label className="mt-5 block text-sm text-slate-300">
              Expected attendance (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={attendance}
              onChange={(e) => setAttendance(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white"
            />

            <p className="mt-4 text-sm text-slate-400">
              Change either value to recalculate demand instantly.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-800 bg-emerald-950/40 p-6">
            <h2 className="text-xl font-semibold">Estimated demand</h2>
            <p className="mt-6 text-sm text-emerald-300">Expected students</p>
            <p className="mt-1 text-4xl font-bold">
              {expected.toLocaleString()}
            </p>

            <div className="mt-6 grid gap-4">
              <StockCard title="Rice required" required={riceRequired} stock={riceAvailable} />
              <StockCard title="Vegetables required" required={vegetablesRequired} stock={vegetablesAvailable} />
            </div>
          </div>
        </section>

        {apiError && (
          <p className="mt-6 rounded-xl border border-amber-800 bg-amber-950/30 p-4 text-sm text-amber-200">
            {apiError}
          </p>
        )}

        <p className="mt-6 rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-400">
          Demo estimate: 100 g rice and 80 g vegetables per student. Inventory is read from the backend; estimates are not ML predictions. Stock matching uses item names and assumes quantities are in kilograms.
        </p>
      </div>
    </main>
  );
}
