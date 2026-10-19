
"use client";

import { useEffect, useState } from "react";

type FoodRecord = {
  id: number;
  name: string;
  quantity: number;
  location: string;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
};

const initialRecords: FoodRecord[] = [
  { id: 1, name: "Cooked rice", quantity: 25, location: "Central Kitchen", status: "Pending", date: "Today" },
  { id: 2, name: "Vegetable curry", quantity: 18, location: "North Campus", status: "Pending", date: "Today" },
  { id: 3, name: "Fresh bread", quantity: 12, location: "Cafeteria B", status: "Pending", date: "Today" },
];

const STORAGE_KEY = "reahara-food-records";

export default function VerificationPage() {
  const [records, setRecords] = useState<FoodRecord[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setRecords(saved ? JSON.parse(saved) as FoodRecord[] : initialRecords);
    } catch {
      setRecords(initialRecords);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }
  }, [records, ready]);

  function updateStatus(id: number, status: "Approved" | "Rejected") {
    setRecords((current) =>
      current.map((record) =>
        record.id === id ? { ...record, status } : record
      )
    );
  }

  const pending = records.filter((r) => r.status === "Pending").length;
  const approved = records.filter((r) => r.status === "Approved").length;
  const rejected = records.filter((r) => r.status === "Rejected").length;

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">ReAhara AI</p>
        <h1 className="mt-2 text-3xl font-bold">Food Verification</h1>
        <p className="mt-2 text-slate-400">Review surplus food before it is offered for redistribution.</p>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Pending", pending],
            ["Approved", approved],
            ["Rejected", rejected],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-700 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-2 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
          <div className="border-b border-slate-700 p-5">
            <h2 className="text-xl font-semibold">Submitted food</h2>
          </div>

          {!ready ? (
            <p className="p-5 text-slate-400">Loading records...</p>
          ) : records.length === 0 ? (
            <p className="p-5 text-slate-400">No food records yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800 text-slate-300">
                  <tr>
                    <th className="p-4">Food</th>
                    <th className="p-4">Quantity</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="border-t border-slate-800">
                      <td className="p-4 font-medium">{record.name}</td>
                      <td className="p-4">{record.quantity} kg</td>
                      <td className="p-4">{record.location}</td>
                      <td className="p-4">
                        <span className={
                          record.status === "Approved"
                            ? "text-emerald-400"
                            : record.status === "Rejected"
                              ? "text-red-400"
                              : "text-amber-400"
                        }>
                          {record.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {record.status === "Pending" ? (
                          <div className="flex gap-2">
                            <button onClick={() => updateStatus(record.id, "Approved")} className="rounded-lg bg-emerald-700 px-3 py-2 hover:bg-emerald-600">
                              Approve
                            </button>
                            <button onClick={() => updateStatus(record.id, "Rejected")} className="rounded-lg bg-red-900 px-3 py-2 hover:bg-red-800">
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => updateStatus(record.id, "Pending")} className="rounded-lg border border-slate-600 px-3 py-2 hover:bg-slate-800">
                            Reset
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-5 text-sm text-slate-400">
          Demo mode: decisions are saved in this browser only, not in the backend database.
        </p>
      </div>
    </main>
  );
}
