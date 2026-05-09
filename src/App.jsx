import { useState, useEffect, useMemo } from "react";

const CATEGORIES = [
  { name: "Food", icon: "🍜", color: "#FF6B6B" },
  { name: "Transport", icon: "🚌", color: "#4ECDC4" },
  { name: "Shopping", icon: "🛍️", color: "#FFE66D" },
  { name: "Health", icon: "💊", color: "#A8E6CF" },
  { name: "Entertainment", icon: "🎬", color: "#C778DD" },
  { name: "Bills", icon: "🧾", color: "#FF8B94" },
  { name: "Education", icon: "📚", color: "#85C1E9" },
  { name: "Other", icon: "💡", color: "#F0B27A" },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

const initialExpenses = [
  { id: 1, title: "Grocery run", amount: 850, category: "Food", date: "2026-05-01" },
  { id: 2, title: "Monthly Netflix", amount: 199, category: "Entertainment", date: "2026-05-02" },
  { id: 3, title: "Bus pass", amount: 500, category: "Transport", date: "2026-05-03" },
  { id: 4, title: "Dentist visit", amount: 1200, category: "Health", date: "2026-05-04" },
  { id: 5, title: "New sneakers", amount: 2499, category: "Shopping", date: "2026-05-05" },
];

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [view, setView] = useState("dashboard"); // dashboard | add | history
  const [form, setForm] = useState({ title: "", amount: "", category: "Food", date: new Date().toISOString().split("T")[0] });
  const [filterCat, setFilterCat] = useState("All");
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [budget, setBudget] = useState(10000);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState("10000");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const total = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const thisMonth = useMemo(() => {
    const now = new Date();
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, e) => s + e.amount, 0);
  }, [expenses]);

  const catTotals = useMemo(() => {
    const map = {};
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const filtered = useMemo(() => {
    const list = filterCat === "All" ? expenses : expenses.filter(e => e.category === filterCat);
    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, filterCat]);

  const handleSubmit = () => {
    if (!form.title.trim() || !form.amount || isNaN(parseFloat(form.amount))) {
      showToast("Please fill in all fields correctly.", "error");
      return;
    }
    if (editId !== null) {
      setExpenses(prev => prev.map(e => e.id === editId ? { ...e, ...form, amount: parseFloat(form.amount) } : e));
      showToast("Expense updated!");
      setEditId(null);
    } else {
      setExpenses(prev => [...prev, { id: Date.now(), ...form, amount: parseFloat(form.amount) }]);
      showToast("Expense added!");
    }
    setForm({ title: "", amount: "", category: "Food", date: new Date().toISOString().split("T")[0] });
    setView("dashboard");
  };

  const handleEdit = (exp) => {
    setForm({ title: exp.title, amount: String(exp.amount), category: exp.category, date: exp.date });
    setEditId(exp.id);
    setView("add");
  };

  const handleDelete = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    showToast("Expense removed.", "info");
  };

  const budgetPct = Math.min((thisMonth / budget) * 100, 100);
  const budgetColor = budgetPct > 90 ? "#FF6B6B" : budgetPct > 70 ? "#FFE66D" : "#4ECDC4";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0F0F14",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#F0EDE8",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 0 80px",
      position: "relative",
    }}>
      {/* Header */}
      <div style={{
        width: "100%", maxWidth: 480,
        padding: "28px 24px 0",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#8B8580", textTransform: "uppercase", marginBottom: 4 }}>My Wallet</div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px" }}>Spend</div>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "linear-gradient(135deg, #C778DD, #4ECDC4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, cursor: "pointer",
        }}>👤</div>
      </div>

      {/* Main Balance Card */}
      <div style={{
        width: "calc(100% - 48px)", maxWidth: 432,
        margin: "24px auto 0",
        background: "linear-gradient(135deg, #1A1A24 0%, #22222E 100%)",
        borderRadius: 24,
        padding: "28px 28px 24px",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      }}>
        <div style={{ fontSize: 12, color: "#8B8580", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Total Spent</div>
        <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-1px", marginBottom: 20 }}>{fmt(total)}</div>

        {/* Budget bar */}
        <div style={{ marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#8B8580" }}>This month</span>
          <span style={{ fontSize: 12, color: "#8B8580" }} onClick={() => setEditingBudget(true)} title="Click to edit budget">
            {fmt(thisMonth)} <span style={{ color: "#555" }}>/ </span>
            {editingBudget ? (
              <input
                autoFocus
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                onBlur={() => { setBudget(parseFloat(budgetInput) || 1000); setEditingBudget(false); }}
                onKeyDown={e => { if (e.key === "Enter") { setBudget(parseFloat(budgetInput) || 1000); setEditingBudget(false); } }}
                style={{ width: 70, background: "transparent", border: "none", borderBottom: "1px solid #C778DD", color: "#F0EDE8", fontSize: 12, outline: "none", textAlign: "right" }}
              />
            ) : (
              <span style={{ cursor: "pointer", borderBottom: "1px dashed #555" }}>{fmt(budget)}</span>
            )}
          </span>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${budgetPct}%`,
            background: budgetColor,
            borderRadius: 3,
            transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>

        {/* Mini stats */}
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          {[
            { label: "Expenses", value: expenses.length },
            { label: "Categories", value: catTotals.length },
            { label: "Avg/item", value: fmt(expenses.length ? total / expenses.length : 0) },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 12px",
            }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#8B8580", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* View Switcher */}
      <div style={{
        display: "flex", gap: 8,
        margin: "20px 24px 0",
        width: "calc(100% - 48px)", maxWidth: 432,
      }}>
        {[["dashboard","📊 Overview"], ["history","📋 History"]].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)} style={{
            flex: 1, padding: "10px 0",
            borderRadius: 12,
            border: view === v ? "1px solid rgba(199,120,221,0.5)" : "1px solid rgba(255,255,255,0.06)",
            background: view === v ? "rgba(199,120,221,0.12)" : "rgba(255,255,255,0.03)",
            color: view === v ? "#C778DD" : "#8B8580",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            transition: "all 0.2s",
          }}>{label}</button>
        ))}
      </div>

      {/* DASHBOARD */}
      {view === "dashboard" && (
        <div style={{ width: "calc(100% - 48px)", maxWidth: 432, margin: "20px auto 0" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#8B8580", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>By Category</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {catTotals.map(([cat, amt]) => {
              const c = CATEGORIES.find(c => c.name === cat) || CATEGORIES[7];
              const pct = (amt / total) * 100;
              return (
                <div key={cat} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 16, padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: c.color + "22",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, flexShrink: 0,
                  }}>{c.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{cat}</span>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{fmt(amt)}</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: c.color, borderRadius: 2, transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent */}
          <div style={{ fontSize: 13, fontWeight: 600, color: "#8B8580", margin: "24px 0 14px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Recent</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4).map(e => {
              const c = CATEGORIES.find(c => c.name === e.category) || CATEGORIES[7];
              return (
                <div key={e.id} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 14, padding: "12px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{ fontSize: 20 }}>{c.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{e.title}</div>
                    <div style={{ fontSize: 11, color: "#8B8580", marginTop: 2 }}>{e.date}</div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: c.color }}>-{fmt(e.amount)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* HISTORY */}
      {view === "history" && (
        <div style={{ width: "calc(100% - 48px)", maxWidth: 432, margin: "20px auto 0" }}>
          {/* Filter */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
            {["All", ...CATEGORIES.map(c => c.name)].map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)} style={{
                flexShrink: 0, padding: "7px 14px", borderRadius: 20,
                border: filterCat === cat ? "1px solid rgba(199,120,221,0.5)" : "1px solid rgba(255,255,255,0.07)",
                background: filterCat === cat ? "rgba(199,120,221,0.15)" : "transparent",
                color: filterCat === cat ? "#C778DD" : "#8B8580",
                fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
              }}>{cat}</button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", color: "#555", padding: "40px 0", fontSize: 14 }}>No expenses found.</div>
            )}
            {filtered.map(e => {
              const c = CATEGORIES.find(c => c.name === e.category) || CATEGORIES[7];
              return (
                <div key={e.id} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 16, padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 11,
                    background: c.color + "22",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, flexShrink: 0,
                  }}>{c.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.title}</div>
                    <div style={{ fontSize: 11, color: "#8B8580", marginTop: 2 }}>{e.category} · {e.date}</div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{fmt(e.amount)}</span>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => handleEdit(e)} style={{
                      width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
                      background: "transparent", color: "#8B8580", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>✏️</button>
                    <button onClick={() => handleDelete(e.id)} style={{
                      width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(255,106,107,0.3)",
                      background: "transparent", color: "#FF6B6B", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ADD FORM OVERLAY */}
      {view === "add" && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
        }} onClick={(e) => { if (e.target === e.currentTarget) { setView("dashboard"); setEditId(null); }}}>
          <div style={{
            width: "100%", maxWidth: 480,
            background: "#16161F", borderRadius: "28px 28px 0 0",
            padding: "28px 24px 40px",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{editId ? "Edit Expense" : "Add Expense"}</div>
              <button onClick={() => { setView("dashboard"); setEditId(null); }} style={{
                width: 32, height: 32, borderRadius: "50%", border: "none",
                background: "rgba(255,255,255,0.07)", color: "#8B8580", fontSize: 18, cursor: "pointer",
              }}>×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Title */}
              <div>
                <label style={{ fontSize: 11, color: "#8B8580", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Title</label>
                <input
                  value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Lunch at work"
                  style={{
                    width: "100%", padding: "13px 16px", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12, color: "#F0EDE8", fontSize: 15, outline: "none",
                  }}
                />
              </div>

              {/* Amount */}
              <div>
                <label style={{ fontSize: 11, color: "#8B8580", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Amount (₹)</label>
                <input
                  type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  placeholder="0.00"
                  style={{
                    width: "100%", padding: "13px 16px", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12, color: "#F0EDE8", fontSize: 15, outline: "none",
                  }}
                />
              </div>

              {/* Date */}
              <div>
                <label style={{ fontSize: 11, color: "#8B8580", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Date</label>
                <input
                  type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  style={{
                    width: "100%", padding: "13px 16px", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12, color: "#F0EDE8", fontSize: 15, outline: "none",
                    colorScheme: "dark",
                  }}
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ fontSize: 11, color: "#8B8580", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Category</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {CATEGORIES.map(c => (
                    <button key={c.name} onClick={() => setForm(p => ({ ...p, category: c.name }))} style={{
                      padding: "8px 14px", borderRadius: 20,
                      border: form.category === c.name ? `1px solid ${c.color}88` : "1px solid rgba(255,255,255,0.08)",
                      background: form.category === c.name ? c.color + "22" : "transparent",
                      color: form.category === c.name ? c.color : "#8B8580",
                      fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                      transition: "all 0.15s",
                    }}>{c.icon} {c.name}</button>
                  ))}
                </div>
              </div>

              <button onClick={handleSubmit} style={{
                width: "100%", padding: "16px",
                background: "linear-gradient(135deg, #C778DD,
