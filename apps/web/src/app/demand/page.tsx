
"use client";

import { useState } from "react";

type Forecast = {
  meal: string;
  demand: number;
  prepared: number;
};

const initialForecast: Forecast[] = [
  { meal: "Breakfast", demand: 300, prepared: 320 },
  { meal: "Lunch", demand: 550, prepared: 600 },
  { meal: "Dinner", demand: 400, prepared: 380 },
];

export default function DemandPage() {
  const [forecast, setForecast] = useState(initialForecast);
  const [attendance, setAttendance] = useState("1250");
  const [message, setMessage] = useState("");

  function calculateForecast() {
    const people = Number(attendance);

    if (!Number.isFinite(people) || people < 0 || people > 100000) {
      setMessage("Enter a valid number between 0 and 100000.");
      return;
    }

    setForecast([
      { meal: "Breakfast", demand: Math.round(people * 0.24), prepared: Math.round(people * 0.256) },
      { meal: "Lunch", demand: Math.round(people * 0.44), prepared: Math.round(people * 0.48) },
      { meal: "Dinner", demand: Math.round(people * 0.32), prepared: Math.round(people * 0.304) },
    ]);
    setMessage("Demo forecast updated. These are estimates, not AI predictions.");
  }

  const totalDemand = forecast.reduce((sum, item) => sum + item.demand, 0);
  const totalPrepared = forecast.reduce((sum, item) => sum + item.prepared, 0);
  const estimatedSurplus = Math.max(0, totalPrepared - totalDemand);

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900 md:p-10">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="font-semibold text-emerald-800 hover:underline">
          ← Back to Dashboard
        </a>

        <h1 className="mt-5 text-3xl font-bold">Demand & Production</h1>
        <p className="mt-2 text-slate-600">
          Estimate meal demand and plan kitchen production to prevent food waste.
        </p>

        <section className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Daily Planning</h2>
          <label className="mt-4 block text-sm font-medium">
            Expected people / meals
            <input
              type="number"
              min="0"
              max="100000"
              value={attendance}
              onChange={(event) => setAttendance(event.target.value)}
              className="mt-2 block w-full rounded-lg border p-3 sm:max-w-sm"
            />
          </label>
          <button
            onClick={calculateForecast}
            className="mt-4 rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
          >
            Calculate Demo Forecast
          </button>
          {message && <p role="status" className="mt-3 text-sm text-slate-600">{message}</p>}
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Estimated demand", value: totalDemand },
            { label: "Planned production", value: totalPrepared },
            { label: "Potential surplus", value: estimatedSurplus },
          ].map((item) => (
            <article key={item.label} className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-3 text-3xl font-bold">{item.value}</p>
              <p className="mt-1 text-xs text-slate-500">Meals per day (demo estimate)</p>
            </article>
          ))}
        </section>

        <section className="mt-6 overflow-x-auto rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Meal Production Plan</h2>
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">Meal</th>
                <th className="p-3">Estimated demand</th>
                <th className="p-3">Planned production</th>
                <th className="p-3">Potential surplus</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((item) => (
                <tr key={item.meal} className="border-t">
                  <td className="p-3 font-medium">{item.meal}</td>
                  <td className="p-3">{item.demand}</td>
                  <td className="p-3">{item.prepared}</td>
                  <td className="p-3">{Math.max(0, item.prepared - item.demand)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="font-bold text-emerald-950">Surplus prevention tip</h2>
          <p className="mt-2 text-sm text-emerald-900">
            Compare actual attendance with planned meals, prepare in batches where practical,
            and update the plan as demand changes.
          </p>
        </section>

        <p className="mt-6 text-xs text-slate-500">
          Prototype only: forecast percentages are illustrative rules, not a trained ML model.
        </p>
      </div>
    </main>
  );
}
