
"use client";

import { useState } from "react";

type InventoryItem = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  minimum: number;
  location: string;
};

const initialItems: InventoryItem[] = [
  { id: 1, name: "Rice", quantity: 45, unit: "kg", minimum: 20, location: "Central Kitchen" },
  { id: 2, name: "Cooking Oil", quantity: 8, unit: "litres", minimum: 10, location: "Central Kitchen" },
  { id: 3, name: "Vegetables", quantity: 15, unit: "kg", minimum: 10, location: "North Campus" },
  { id: 4, name: "Wheat Flour", quantity: 30, unit: "kg", minimum: 12, location: "Cafeteria B" },
];

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [minimum, setMinimum] = useState("");
  const [location, setLocation] = useState("Central Kitchen");

  const lowStock = items.filter((item) => item.quantity <= item.minimum).length;
  const totalItems = items.length;

  function addItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || quantity === "" || minimum === "") return;

    const newItem: InventoryItem = {
      id: Date.now(),
      name: name.trim(),
      quantity: Number(quantity),
      unit,
      minimum: Number(minimum),
      location,
    };

    setItems((current) => [...current, newItem]);
    setName("");
    setQuantity("");
    setMinimum("");
  }

  function updateQuantity(id: number, change: number) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      )
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 md:flex">
      <aside className="bg-emerald-950 p-6 text-white md:min-h-screen md:w-64">
        <h1 className="text-2xl font-bold">ReAhara AI</h1>
        <p className="mt-1 text-sm text-emerald-200">Food Intelligence Platform</p>

        <nav className="mt-8 space-y-2">
          <a href="/" className="block rounded-lg px-3 py-3 hover:bg-emerald-900">
            Overview
          </a>
          <a href="/demand" className="block rounded-lg px-3 py-3 hover:bg-emerald-900">
            Demand & Production
          </a>
          <a href="/inventory" className="block rounded-lg bg-emerald-800 px-3 py-3 font-semibold">
            Inventory
          </a>
          <a href="/verification" className="block rounded-lg px-3 py-3 hover:bg-emerald-900">
            Food Verification
          </a>
        </nav>
      </aside>

      <section className="min-w-0 flex-1 p-5 md:p-8">
        <header className="mb-8">
          <p className="text-sm text-slate-500">Food operations / Inventory</p>
          <h2 className="mt-1 text-3xl font-bold">Inventory Management</h2>
          <p className="mt-2 text-slate-600">
            Track ingredients, monitor stock and identify shortages before they cause waste.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Inventory Items</p>
            <p className="mt-2 text-3xl font-bold">{totalItems}</p>
          </article>

          <article className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Low Stock Alerts</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">{lowStock}</p>
          </article>

          <article className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Stock Status</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {totalItems - lowStock} OK
            </p>
          </article>
        </div>

        <section className="mt-6 rounded-xl border bg-white p-6">
          <h3 className="text-lg font-bold">Add Inventory Item</h3>

          <form onSubmit={addItem} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <input
              className="rounded-lg border p-3"
              placeholder="Ingredient name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              className="rounded-lg border p-3"
              type="number"
              min="0"
              step="any"
              placeholder="Current quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />

            <select
              className="rounded-lg border p-3"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="litres">Litres</option>
              <option value="pieces">Pieces</option>
              <option value="packets">Packets</option>
            </select>

            <input
              className="rounded-lg border p-3"
              type="number"
              min="0"
              step="any"
              placeholder="Minimum stock level"
              value={minimum}
              onChange={(e) => setMinimum(e.target.value)}
              required
            />

            <select
              className="rounded-lg border p-3"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option>Central Kitchen</option>
              <option>North Campus</option>
              <option>Cafeteria B</option>
            </select>

            <button
              type="submit"
              className="rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white hover:bg-emerald-900"
            >
              + Add Item
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-xl border bg-white p-6">
          <h3 className="mb-4 text-lg font-bold">Current Stock</h3>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">Ingredient</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Minimum</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Update</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => {
                  const isLow = item.quantity <= item.minimum;

                  return (
                    <tr key={item.id} className="border-t">
                      <td className="p-3 font-semibold">{item.name}</td>
                      <td className="p-3">{item.quantity} {item.unit}</td>
                      <td className="p-3">{item.minimum} {item.unit}</td>
                      <td className="p-3">{item.location}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          isLow
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {isLow ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="rounded border px-3 py-1 hover:bg-slate-100"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            −
                          </button>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="rounded border px-3 py-1 hover:bg-slate-100"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Demo data only. Changes are stored in page state and reset when the page reloads.
            Backend database integration comes later.
          </p>
        </section>

        <footer className="mt-8 text-xs text-slate-500">
          ReAhara AI · Inventory and food waste prevention
        </footer>
      </section>
    </main>
  );
}
