
"use client";

import { useState } from "react";

type Delivery = {
  id: number;
  food: string;
  quantity: string;
  pickup: string;
  destination: string;
  driver: string;
  status: "Awaiting Pickup" | "In Transit" | "Delivered";
};

const initialDeliveries: Delivery[] = [
  { id: 1, food: "Cooked rice", quantity: "25 kg", pickup: "Central Kitchen", destination: "Helping Hands NGO", driver: "Driver A", status: "Awaiting Pickup" },
  { id: 2, food: "Vegetable curry", quantity: "18 kg", pickup: "North Campus", destination: "Care Foundation", driver: "Driver B", status: "In Transit" },
  { id: 3, food: "Fresh bread", quantity: "12 kg", pickup: "Cafeteria B", destination: "Helping Hands NGO", driver: "Driver A", status: "Delivered" },
];

export default function RoutesPage() {
  const [deliveries, setDeliveries] = useState(initialDeliveries);

  function updateStatus(id: number, status: Delivery["status"]) {
    setDeliveries((current) =>
      current.map((delivery) =>
        delivery.id === id ? { ...delivery, status } : delivery
      )
    );
  }

  const delivered = deliveries.filter((d) => d.status === "Delivered").length;
  const inTransit = deliveries.filter((d) => d.status === "In Transit").length;
  const awaiting = deliveries.filter((d) => d.status === "Awaiting Pickup").length;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-emerald-950 p-6 text-white">
        <a href="/" className="text-sm text-emerald-200 hover:underline">← Back to Dashboard</a>
        <h1 className="mt-3 text-3xl font-bold">Routes & Deliveries</h1>
        <p className="mt-2 text-emerald-100">Track surplus food pickups and delivery progress.</p>
      </header>

      <section className="p-5 md:p-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Awaiting Pickup", value: awaiting },
            { label: "In Transit", value: inTransit },
            { label: "Delivered", value: delivered },
          ].map((stat) => (
            <article key={stat.label} className="rounded-xl border bg-white p-5">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            </article>
          ))}
        </div>

        <section className="mt-6 rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">Delivery Tracking</h2>
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <article key={delivery.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">{delivery.food} · {delivery.quantity}</h3>
                    <p className="mt-2 text-sm text-slate-600">Pickup: {delivery.pickup}</p>
                    <p className="text-sm text-slate-600">Destination: {delivery.destination}</p>
                    <p className="text-sm text-slate-600">Assigned driver: {delivery.driver}</p>
                    <p className="mt-2 text-sm font-semibold">Status: {delivery.status}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {delivery.status === "Awaiting Pickup" && (
                      <button
                        onClick={() => updateStatus(delivery.id, "In Transit")}
                        className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Start Delivery
                      </button>
                    )}
                    {delivery.status === "In Transit" && (
                      <button
                        onClick={() => updateStatus(delivery.id, "Delivered")}
                        className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {delivery.status === "Delivered" && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <p className="mt-5 text-xs text-slate-500">
          Prototype only. Drivers, routes and delivery statuses are sample data.
          No live GPS tracking or route optimization is connected.
        </p>
      </section>
    </main>
  );
}
