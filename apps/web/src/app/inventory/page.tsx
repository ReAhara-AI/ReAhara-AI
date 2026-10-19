
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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [unit, setUnit] = useState("kg");
  const [minimum, setMinimum] = useState("5");
  const [location, setLocation] = useState("Central Kitchen");
  const [saving, setSaving] = useState(false);

  async function loadInventory() {
    try {
      setError("");
      const response = await fetch(`${API_URL}/api/v1/inventory`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Could not load inventory.");
      setItems(await response.json());
    } catch {
      setError("Unable to connect to inventory API. Check the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInventory();
  }, []);

  async function changeQuantity(id: number, change: number) {
    try {
      setError("");
      const response = await fetch(
        `${API_URL}/api/v1/inventory/${id}?change=${change}`,
        { method: "PATCH" }
      );
      if (!response.ok) throw new Error();
      const updated: InventoryItem = await response.json();
      setItems((current) =>
        current.map((item) => (item.id === id ? updated : item))
      );
    } catch {
      setError("Could not update quantity. Please try again.");
    }
  }

  async function addItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/v1/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          quantity: Number(quantity),
          unit,
          minimum: Number(minimum),
          location,
        }),
      });

      if (!response.ok) throw new Error();
      const created: InventoryItem = await response.json();
      setItems((current) => [...current, created]);
      setName("");
      setQuantity("10");
    } catch {
      setError("Could not add item. Check the API and try again.");
    } finally {
      setSaving(false);
    }
  }

  const lowStock = items.filter(
    (item) => item.quantity < item.minimum
  ).length;

  return (
    <main className="space-y-6 p-6">
      <div>
        <p className="text-sm text-gray-500">REAHARA AI / INVENTORY</p>
        <h1 className="mt-2 text-3xl font-bold">Inventory Management</h1>
        <p className="mt-2 text-gray-600">
          Manage food supplies and monitor low stock.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <section className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">Inventory items</p>
          <p className="mt-2 text-3xl font-bold">{items.length}</p>
        </section>
        <section className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">Low-stock items</p>
          <p className="mt-2 text-3xl font-bold">{lowStock}</p>
        </section>
        <section className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">API status</p>
          <p className="mt-2 text-xl font-semibold">
            {loading ? "Loading..." : error ? "Check connection" : "Connected"}
          </p>
        </section>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-300 p-3 text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={addItem} className="grid gap-3 rounded-xl border p-5 sm:grid-cols-2 lg:grid-cols-3">
        <h2 className="text-xl font-semibold sm:col-span-2 lg:col-span-3">
          Add inventory item
        </h2>
        <input
          className="rounded-lg border p-3"
          placeholder="Food item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="rounded-lg border p-3"
          type="number"
          min="0"
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        <select className="rounded-lg border p-3" value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="kg">kg</option>
          <option value="litres">litres</option>
          <option value="packets">packets</option>
          <option value="pieces">pieces</option>
        </select>
        <input
          className="rounded-lg border p-3"
          placeholder="Minimum quantity"
          type="number"
          min="0"
          step="any"
          value={minimum}
          onChange={(e) => setMinimum(e.target.value)}
          required
        />
        <input
          className="rounded-lg border p-3"
          placeholder="Kitchen or location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <button disabled={saving} className="rounded-lg bg-green-700 p-3 font-semibold text-white disabled:opacity-50">
          {saving ? "Adding..." : "Add item"}
        </button>
      </form>

      <section className="overflow-x-auto rounded-xl border">
        <div className="flex items-center justify-between p-5">
          <h2 className="text-xl font-semibold">Food inventory</h2>
          <button onClick={() => { setLoading(true); void loadInventory(); }} className="rounded-lg border px-4 py-2">
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="p-5">Loading inventory...</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3">Food</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Minimum</th>
                <th className="p-3">Location</th>
                <th className="p-3">Stock status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3">{item.quantity} {item.unit}</td>
                  <td className="p-3">{item.minimum} {item.unit}</td>
                  <td className="p-3">{item.location}</td>
                  <td className="p-3">
                    {item.quantity < item.minimum ? (
                      <span className="font-semibold text-red-600">Low stock</span>
                    ) : (
                      <span className="text-green-700">In stock</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button aria-label={`Decrease ${item.name}`} onClick={() => void changeQuantity(item.id, -1)} disabled={item.quantity <= 0} className="rounded border px-3 py-1 disabled:opacity-40">−</button>
                      <button aria-label={`Increase ${item.name}`} onClick={() => void changeQuantity(item.id, 1)} className="rounded border px-3 py-1">+</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length && !loading && (
                <tr><td colSpan={6} className="p-5 text-center">No inventory items found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </section>

      <p className="text-sm text-gray-500">
        Inventory is loaded from the backend API. The current backend uses
        in-memory storage, so changes may reset when the backend restarts.
      </p>
    </main>
  );
}
