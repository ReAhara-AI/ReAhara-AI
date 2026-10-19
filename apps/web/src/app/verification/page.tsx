
"use client";

import { useEffect, useState } from "react";

type FoodItem = {
  id: number;
  name: string;
  quantity: string;
  source: string;
  status: "Pending" | "Approved" | "Rejected";
};

const initialItems: FoodItem[] = [
  { id: 1, name: "Cooked rice", quantity: "25 kg", source: "Central Kitchen", status: "Pending" },
  { id: 2, name: "Vegetable curry", quantity: "18 kg", source: "North Campus", status: "Pending" },
  { id: 3, name: "Fresh bread", quantity: "12 kg", source: "Cafeteria B", status: "Pending" },
];

const STORAGE_KEY = "reahara-food-records";

export default function VerificationPage() {
  const [items, setItems] = useState<FoodItem[]>(initialItems);
  const [loaded, setLoaded] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageName, setImageName] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved) as FoodItem[]);
      }
    } catch {
      // Use initial sample records if saved data is unavailable.
    }
    setLoaded(true);
  }, []);

  function updateStatus(id: number, status: "Approved" | "Rejected") {
    setItems((current) => {
      const updated = current.map((item) =>
        item.id === id ? { ...item, status } : item
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  function resetDemoData() {
    setItems(initialItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialItems));
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setImagePreview(URL.createObjectURL(file));
    setImageName(file.name);
  }

  if (!loaded) {
    return <main className="p-8">Loading food records...</main>;
  }

  const pending = items.filter((item) => item.status === "Pending").length;
  const approved = items.filter((item) => item.status === "Approved").length;
  const rejected = items.filter((item) => item.status === "Rejected").length;

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900 md:p-10">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="font-semibold text-emerald-800 hover:underline">
          ← Back to Dashboard
        </a>

        <header className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Food Verification</h1>
            <p className="mt-2 text-slate-600">
              Review surplus food records and upload food images.
            </p>
          </div>

          <button
            onClick={resetDemoData}
            className="rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
          >
            Reset Demo Data
          </button>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total records", value: items.length },
            { label: "Pending review", value: pending },
            { label: "Approved", value: approved },
            { label: "Rejected", value: rejected },
          ].map((stat) => (
            <article key={stat.label} className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Food Image Upload</h2>
          <p className="mt-2 text-sm text-slate-600">
            Upload a food image for visual review. This demo does not automatically detect food quality.
          </p>

          <label className="mt-4 block text-sm font-medium">
            Select food image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-2 block w-full rounded-lg border border-slate-300 p-3"
            />
          </label>

          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Uploaded food preview"
                className="max-h-80 rounded-lg border object-contain"
              />
              <p className="mt-2 text-sm text-slate-600">{imageName}</p>
              <button
                onClick={() => {
                  URL.revokeObjectURL(imagePreview);
                  setImagePreview("");
                  setImageName("");
                }}
                className="mt-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
              >
                Remove image
              </button>
            </div>
          )}
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-xl font-bold">Surplus Food Records</h2>

          {items.map((item) => (
            <article key={item.id} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">{item.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.quantity} · {item.source}
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    Status:{" "}
                    <span
                      className={
                        item.status === "Approved"
                          ? "text-emerald-700"
                          : item.status === "Rejected"
                            ? "text-red-700"
                            : "text-amber-700"
                      }
                    >
                      {item.status}
                    </span>
                  </p>
                </div>

                {item.status === "Pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(item.id, "Approved")}
                      className="rounded-lg bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(item.id, "Rejected")}
                      className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>

        <p className="mt-6 text-xs text-slate-500">
          Demo only: decisions are stored in this browser, not in the project database.
          Image uploads are previewed locally and are not sent to a server.
        </p>
      </div>
    </main>
  );
}
