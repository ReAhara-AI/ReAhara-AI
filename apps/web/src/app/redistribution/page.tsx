
"use client";

import { useEffect, useState } from "react";

type FoodRecord = {
  id: number | string;
  name: string;
  quantity: number | string;
  location?: string;
  source?: string;
  status: string;
};

type Match = {
  id: string;
  foodId: number | string;
  foodName: string;
  quantity: number;
  location: string;
  ngo: string;
  status: "Matched" | "Picked Up" | "Delivered";
};

const FOOD_KEY = "reahara-food-records";
const MATCH_KEY = "reahara-redistribution-matches";

const ngos = [
  "Helping Hands NGO",
  "Hope Foundation",
  "Community Care Trust",
];

export default function RedistributionPage() {
  const [foods, setFoods] = useState<FoodRecord[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedNgo, setSelectedNgo] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const savedFoods = localStorage.getItem(FOOD_KEY);
      const savedMatches = localStorage.getItem(MATCH_KEY);

      setFoods(savedFoods ? JSON.parse(savedFoods) : []);
      setMatches(savedMatches ? JSON.parse(savedMatches) : []);
    } catch {
      setMessage("Could not load saved records. Refresh the page.");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(MATCH_KEY, JSON.stringify(matches));
      } catch {
        setMessage("Could not save matches in this browser.");
      }
    }
  }, [matches, ready]);

  const approvedFoods = foods.filter(
    (food) => food.status?.toLowerCase() === "approved"
  );

  function createMatch(food: FoodRecord) {
    const foodKey = String(food.id);
    const ngo = selectedNgo[foodKey];

    if (!ngo) {
      setMessage("Please choose an NGO from the dropdown first.");
      return;
    }

    if (matches.some((match) => String(match.foodId) === foodKey)) {
      setMessage("This food already has a match. Check Delivery tracking.");
      return;
    }

    const quantity = Number.parseFloat(String(food.quantity)) || 0;

    const newMatch: Match = {
      id: `${foodKey}-${Date.now()}`,
      foodId: food.id,
      foodName: food.name,
      quantity,
      location: food.location || food.source || "Not specified",
      ngo,
      status: "Matched",
    };

    setMatches((current) => [newMatch, ...current]);
    setMessage(`Success! ${food.name} is matched with ${ngo}.`);
  }

  function advanceMatch(id: string) {
    setMatches((current) =>
      current.map((match) => {
        if (match.id !== id) return match;

        return {
          ...match,
          status:
            match.status === "Matched" ? "Picked Up" : "Delivered",
        };
      })
    );
    setMessage("Delivery status updated.");
  }

  function removeMatch(id: string) {
    setMatches((current) => current.filter((match) => match.id !== id));
    setMessage("Match removed.");
  }

  const activeMatches = matches.filter(
    (match) => match.status !== "Delivered"
  ).length;

  const totalMatchedKg = matches.reduce(
    (total, match) => total + match.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <a href="/" className="text-sm text-emerald-300 hover:underline">
          ← Back to Dashboard
        </a>

        <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-emerald-400">
          ReAhara AI
        </p>

        <h1 className="mt-2 text-3xl font-bold">Food Redistribution</h1>
        <p className="mt-2 text-slate-400">
          Match approved surplus food with NGOs and track delivery progress.
        </p>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Approved food", value: approvedFoods.length },
            { label: "Active matches", value: activeMatches },
            { label: "Food matched", value: `${totalMatchedKg} kg` },
          ].map((stat) => (
            <article
              key={stat.label}
              className="rounded-xl border border-slate-700 bg-slate-900 p-5"
            >
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            </article>
          ))}
        </section>

        {message && (
          <div
            role="status"
            className="mt-5 rounded-lg border border-emerald-700 bg-slate-900 p-4"
          >
            <p>{message}</p>
            <button
              onClick={() => setMessage("")}
              className="mt-2 text-emerald-300 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold">Approved surplus food</h2>

          {!ready ? (
            <p className="mt-4 text-slate-400">Loading records...</p>
          ) : approvedFoods.length === 0 ? (
            <p className="mt-4 rounded-lg bg-slate-800 p-4 text-slate-300">
              No approved food found. Approve food in Food Verification first.
            </p>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {approvedFoods.map((food) => {
                const foodKey = String(food.id);
                const alreadyMatched = matches.some(
                  (match) => String(match.foodId) === foodKey
                );
                const quantityText = String(food.quantity).replace(/\s*kg$/i, "");

                return (
                  <article
                    key={foodKey}
                    className="rounded-xl border border-slate-700 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold">{food.name}</h3>
                      <span className="text-xs text-emerald-300">Approved</span>
                    </div>

                    <p className="mt-3 text-sm text-slate-300">
                      Quantity: {quantityText} kg
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Location: {food.location || food.source || "Not specified"}
                    </p>

                    <label
                      htmlFor={`ngo-${foodKey}`}
                      className="mt-4 block text-sm text-slate-300"
                    >
                      Select recipient NGO
                    </label>

                    <select
                      id={`ngo-${foodKey}`}
                      value={selectedNgo[foodKey] || ""}
                      onChange={(event) =>
                        setSelectedNgo((current) => ({
                          ...current,
                          [foodKey]: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white"
                    >
                      <option value="">Choose an NGO</option>
                      {ngos.map((ngo) => (
                        <option key={ngo} value={ngo}>
                          {ngo}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={!ready || alreadyMatched}
                      onClick={() => createMatch(food)}
                      className="mt-4 w-full cursor-pointer rounded-lg bg-emerald-700 px-4 py-3 font-semibold hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {alreadyMatched ? "Already matched" : "Create match"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
          <div className="border-b border-slate-700 p-5">
            <h2 className="text-xl font-semibold">Delivery tracking</h2>
          </div>

          {matches.length === 0 ? (
            <p className="p-5 text-slate-400">No matches created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800 text-slate-300">
                  <tr>
                    <th className="p-4">Food</th>
                    <th className="p-4">Quantity</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">NGO</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => (
                    <tr key={match.id} className="border-t border-slate-800">
                      <td className="p-4">{match.foodName}</td>
                      <td className="p-4">{match.quantity} kg</td>
                      <td className="p-4">{match.location}</td>
                      <td className="p-4">{match.ngo}</td>
                      <td className="p-4 text-emerald-300">{match.status}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {match.status !== "Delivered" && (
                            <button
                              type="button"
                              onClick={() => advanceMatch(match.id)}
                              className="rounded-lg bg-emerald-800 px-3 py-2 hover:bg-emerald-700"
                            >
                              {match.status === "Matched"
                                ? "Mark picked up"
                                : "Mark delivered"}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeMatch(match.id)}
                            className="rounded-lg border border-slate-600 px-3 py-2 hover:bg-slate-800"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-5 text-sm text-slate-400">
          Demo mode: matches are stored in this browser only. NGO options are
          examples and do not contact real NGOs or arrange transport.
        </p>
      </div>
    </main>
  );
}
