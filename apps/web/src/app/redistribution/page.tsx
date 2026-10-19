
"use client";

import { useState } from "react";

type Donation = {
  id: number;
  food: string;
  quantity: string;
  location: string;
  ngo: string;
  status: "Available" | "Matched" | "Picked Up";
};

const initialDonations: Donation[] = [
  { id: 1, food: "Cooked rice", quantity: "25 kg", location: "Central Kitchen", ngo: "Helping Hands NGO", status: "Available" },
  { id: 2, food: "Vegetable curry", quantity: "18 kg", location: "North Campus", ngo: "Care Foundation", status: "Available" },
  { id: 3, food: "Fresh bread", quantity: "12 kg", location: "Cafeteria B", ngo: "Helping Hands NGO", status: "Matched" },
];

export default function RedistributionPage() {
  const [donations, setDonations] = useState(initialDonations);

  function updateStatus(id: number, status: Donation["status"]) {
    setDonations((current) =>
      current.map((item) => item.id === id ? { ...item, status } : item)
    );
  }

  const matched = donations.filter((item) => item.status === "Matched").length;
  const available = donations.filter((item) => item.status === "Available").length;
  const pickedUp = donations.filter((item) => item.status === "Picked Up").length;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-emerald-950 p-6 text-white">
        <a href="/" className="text-sm text-emerald-200 hover:underline">
          ← Back to Dashboard
        </a>
        <h1 className="mt-3 text-3xl font-bold">Food Redistribution</h1>
        <p className="mt-2 text-emerald-100">
          Connect available surplus food with recipient organizations.
        </p>
      </header>

      <section className="p-5 md:p-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Available Donations", value: available },
            { label: "Matched with NGOs", value: matched },
            { label: "Picked Up", value: pickedUp },
          ].map((stat) => (
            <article key={stat.label} className="rounded-xl border bg-white p-5">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            </article>
          ))}
        </div>

        <section className="mt-6 rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">Surplus Food Matching</h2>
          <div className="space-y-4">
            {donations.map((item) => (
              <article key={item.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">{item.food}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm text-slate-600">
                      Source: {item.location}
                    </p>
                    <p className="text-sm text-slate-600">
                      Recipient: {item.ngo}
                    </p>
                    <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      item.status === "Picked Up"
                        ? "bg-blue-100 text-blue-800"
                        : item.status === "Matched"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.status === "Available" && (
                      <button
                        onClick={() => updateStatus(item.id, "Matched")}
                        className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
                      >
                        Match NGO
                      </button>
                    )}
                    {item.status === "Matched" && (
                      <button
                        onClick={() => updateStatus(item.id, "Picked Up")}
                        className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                      >
                        Mark Picked Up
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <p className="mt-5 text-xs text-slate-500">
          Demo only. NGO matches are sample assignments, not live recommendations.
          Food must pass appropriate safety checks before redistribution.
        </p>
      </section>
    </main>
  );
}
