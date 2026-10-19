
"use client";

import { useState } from "react";

const initialSensors = [
  { id: 1, name: "Cold Storage A", temperature: 4, humidity: 65, waste: 8 },
  { id: 2, name: "Kitchen Storage", temperature: 7, humidity: 72, waste: 18 },
  { id: 3, name: "Refrigerator B", temperature: 3, humidity: 60, waste: 5 },
];

export default function IoTPage() {
  const [sensors, setSensors] = useState(initialSensors);

  function simulateReading() {
    setSensors((current) =>
      current.map((sensor) => ({
        ...sensor,
        temperature: Math.max(1, Math.min(12, sensor.temperature + Math.round(Math.random() * 4 - 2))),
        humidity: Math.max(40, Math.min(90, sensor.humidity + Math.round(Math.random() * 10 - 5))),
        waste: Math.max(0, Math.min(100, sensor.waste + Math.round(Math.random() * 6 - 2))),
      }))
    );
  }

  const alerts = sensors.filter(
    (sensor) => sensor.temperature > 5 || sensor.waste > 15
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-emerald-950 p-6 text-white">
        <a href="/" className="text-sm text-emerald-200 hover:underline">
          ← Back to Dashboard
        </a>
        <h1 className="mt-3 text-3xl font-bold">IoT & Waste Monitoring</h1>
        <p className="mt-2 text-emerald-100">
          Monitor storage conditions and identify potential waste risks.
        </p>
      </header>

      <section className="p-5 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Sensor Overview</h2>
            <p className="mt-1 text-sm text-slate-600">
              Sample readings for the prototype.
            </p>
          </div>
          <button
            onClick={simulateReading}
            className="rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white hover:bg-emerald-900"
          >
            Simulate New Readings
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Sensors</p>
            <p className="mt-2 text-3xl font-bold">{sensors.length}</p>
          </article>
          <article className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Active Alerts</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">{alerts}</p>
          </article>
          <article className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Monitoring</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">Demo</p>
          </article>
        </div>

        <section className="mt-6 rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">Storage Sensor Readings</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">Location</th>
                  <th className="p-3">Temperature</th>
                  <th className="p-3">Humidity</th>
                  <th className="p-3">Waste Risk</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {sensors.map((sensor) => {
                  const warning = sensor.temperature > 5 || sensor.waste > 15;
                  return (
                    <tr key={sensor.id} className="border-t">
                      <td className="p-3 font-semibold">{sensor.name}</td>
                      <td className="p-3">{sensor.temperature}°C</td>
                      <td className="p-3">{sensor.humidity}%</td>
                      <td className="p-3">{sensor.waste}%</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          warning
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {warning ? "Check Required" : "Normal"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-bold">Waste Prevention Alerts</h2>
          {sensors.filter((sensor) => sensor.temperature > 5 || sensor.waste > 15).length === 0 ? (
            <p className="mt-3 text-sm text-emerald-700">
              No simulated alerts. Continue monitoring storage conditions.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {sensors
                .filter((sensor) => sensor.temperature > 5 || sensor.waste > 15)
                .map((sensor) => (
                  <li key={sensor.id} className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
                    <strong>{sensor.name}:</strong>{" "}
                    {sensor.temperature > 5 && "Temperature is above the demo threshold. "}
                    {sensor.waste > 15 && "Waste risk is elevated in this demo."}
                  </li>
                ))}
            </ul>
          )}
        </section>

        <p className="mt-6 text-xs text-slate-500">
          Prototype only: readings are simulated, not received from physical IoT sensors.
          Thresholds are illustrative and must be replaced with validated food-safety rules.
        </p>
      </section>
    </main>
  );
}
