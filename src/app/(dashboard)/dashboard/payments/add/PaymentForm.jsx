"use client";
import { useState, useEffect } from "react";

export default function PaymentForm() {
  const [form, setForm] = useState({
    tenantId: "",
    amount: "",
    date: new Date().toISOString().substring(0, 10),
    notes: "",
  });

  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);
  const fetchTenants = async () => {
    const res = await fetch("/api/tenants");
    const data = await res.json();
    setTenants(data || []);
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "tenantId") {
      const tenant = tenants.find((t) => t.id === parseInt(value));
      setSelectedTenant(tenant || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: form.tenantId,
        amount_paid: parseFloat(form.amount),
        date_paid: form.date,
        notes: form.notes,
      }),
    });

    const result = await res.json();
    if (res.ok) {
      alert("Payment recorded successfully");
      setForm({
        tenantId: "",
        amount: "",
        date: new Date().toISOString().substring(0, 10),
        notes: "",
      });
      setSelectedTenant(null);
    } else {
      alert(result.error || "Failed to record payment");
    }
  };

  const paid = parseFloat(form.amount || 0);
  const rent = selectedTenant?.rent_amount_kes || 0;
  const difference = paid - rent;

  let statusMessage = "";
  let badgeClass = "";

  if (paid > 0 && selectedTenant) {
    if (difference === 0) {
      statusMessage = `Paid exact rent (Ksh ${rent.toLocaleString()})`;
      badgeClass = "bg-success";
    } else if (difference < 0) {
      statusMessage = `Underpayment by Ksh ${Math.abs(
        difference
      ).toLocaleString()}`;
      badgeClass = "bg-warning";
    } else {
      statusMessage = `Overpayment by Ksh ${difference.toLocaleString()}`;
      badgeClass = "bg-danger";
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card card-primary p-4 shadow rounded"
    >
      <h4 className="mb-3">Record Tenant Payment</h4>

      <div className="form-group mb-3">
        <label>Tenant</label>
        <select
          name="tenantId"
          className="form-control"
          value={form.tenantId}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Tenant --</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.full_name}
            </option>
          ))}
        </select>
      </div>

      {selectedTenant && (
        <div className="mb-2">
          <p>
            <strong>Assigned Unit:</strong> {selectedTenant.unit_name || "N/A"}{" "}
            <br />
            <strong>Expected Rent:</strong> Ksh {rent.toLocaleString()}
          </p>
        </div>
      )}

      <div className="form-group mb-3">
        <label>Amount Paid</label>
        <input
          type="number"
          name="amount"
          className="form-control"
          value={form.amount}
          onChange={handleChange}
          required
        />
      </div>

      {statusMessage && (
        <div className="mb-3">
          <span className={`badge ${badgeClass} p-2`}>{statusMessage}</span>
        </div>
      )}

      <div className="form-group mb-3">
        <label>Date Paid</label>
        <input
          type="date"
          name="date"
          className="form-control"
          value={form.date}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group mb-4">
        <label>Notes (optional)</label>
        <input
          type="text"
          name="notes"
          className="form-control"
          value={form.notes}
          onChange={handleChange}
        />
      </div>

      <button className="btn btn-primary" disabled={loading}>
        Submit Payment
      </button>
    </form>
  );
}
