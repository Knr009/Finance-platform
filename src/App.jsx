import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { TrendingUp, TrendingDown, Plus, Trash2, LogOut, Sparkles, Wallet, Target, CreditCard, ChevronRight, X, Send, Bot } from "lucide-react";

/* ─── MOCK DATA ──────────────────────────────────────────── */
const MOCK_USER = { name: "Nithin Reddy", email: "nithin@example.com", password: "demo123" };

const CATEGORIES = ["Food & Dining", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"];
const CATEGORY_COLORS = ["#c9a84c", "#e07b39", "#7c5cbf", "#3b9ae1", "#4caf82", "#e05c6a", "#8a8a8a"];

const INITIAL_EXPENSES = [
  { id: 1, desc: "Whole Foods", category: "Food & Dining", amount: 127.40, date: "2025-03-01" },
  { id: 2, desc: "Spotify Premium", category: "Entertainment", amount: 9.99, date: "2025-03-02" },
  { id: 3, desc: "Uber", category: "Transport", amount: 24.50, date: "2025-03-03" },
  { id: 4, desc: "Amazon", category: "Shopping", amount: 89.00, date: "2025-03-04" },
  { id: 5, desc: "Electric Bill", category: "Bills", amount: 142.00, date: "2025-03-05" },
  { id: 6, desc: "Chipotle", category: "Food & Dining", amount: 18.75, date: "2025-03-06" },
  { id: 7, desc: "Gym Membership", category: "Health", amount: 45.00, date: "2025-03-08" },
  { id: 8, desc: "Netflix", category: "Entertainment", amount: 15.99, date: "2025-03-09" },
  { id: 9, desc: "MARTA Pass", category: "Transport", amount: 95.00, date: "2025-03-10" },
  { id: 10, desc: "Target", category: "Shopping", amount: 63.20, date: "2025-03-11" },
];

const MONTHLY_TREND = [
  { month: "Oct", spent: 2100, budget: 2500 },
  { month: "Nov", spent: 2380, budget: 2500 },
  { month: "Dec", spent: 2900, budget: 2500 },
  { month: "Jan", spent: 1980, budget: 2500 },
  { month: "Feb", spent: 2250, budget: 2500 },
  { month: "Mar", spent: 630, budget: 2500 },
];

const BUDGET_LIMITS = {
  "Food & Dining": 400, "Transport": 200, "Shopping": 300,
  "Bills": 250, "Entertainment": 100, "Health": 100, "Other": 150
};

const AI_RESPONSES = [
  "Based on your spending patterns, you're on track to exceed your **Food & Dining** budget by ~$46 this month. Consider meal prepping 2–3 days a week to cut costs.",
  "Your **Transport** spend jumped 38% vs. last month. If MARTA is a recurring cost, I've already accounted for it — but any rideshare spikes could be trimmed.",
  "You've saved **$270 more** than February's pace. At this rate, you'll hit your $1,200 monthly savings goal 4 days early.",
  "Your biggest discretionary category is **Shopping** ($152 so far). Setting a weekly cap of $35 would keep you comfortably under budget.",
  "Compared to users with similar income profiles, your **Bills** spending is 12% below average — great job negotiating or bundling utilities!",
];

/* ─── STYLES ─────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --card: #16161f;
    --border: #222230;
    --gold: #c9a84c;
    --gold-dim: #a08535;
    --green: #4caf82;
    --red: #e05c6a;
    --blue: #3b9ae1;
    --text: #f0f0f8;
    --muted: #6b6b80;
    --font: 'Syne', sans-serif;
    --mono: 'DM Mono', monospace;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font); }

  /* AUTH */
  .auth-wrap {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: radial-gradient(ellipse 80% 60% at 50% -10%, #1a1505 0%, var(--bg) 60%);
    padding: 24px;
  }
  .auth-card {
    width: 100%; max-width: 420px; background: var(--card);
    border: 1px solid var(--border); border-radius: 20px; padding: 40px;
    box-shadow: 0 40px 80px rgba(0,0,0,0.6);
  }
  .auth-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
  .auth-logo-icon { width: 36px; height: 36px; background: var(--gold); border-radius: 10px; display:grid; place-items:center; }
  .auth-logo-text { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
  .auth-title { font-size: 26px; font-weight: 700; margin-bottom: 6px; }
  .auth-sub { color: var(--muted); font-size: 14px; margin-bottom: 28px; }
  .field { margin-bottom: 16px; }
  .field label { display: block; font-size: 12px; font-weight: 600; color: var(--muted); margin-bottom: 6px; letter-spacing: 1px; text-transform: uppercase; }
  .field input {
    width: 100%; background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 12px 14px; color: var(--text); font-family: var(--mono);
    font-size: 14px; outline: none; transition: border-color 0.2s;
  }
  .field input:focus { border-color: var(--gold); }
  .btn-primary {
    width: 100%; padding: 13px; background: var(--gold); color: #0a0a0f;
    border: none; border-radius: 10px; font-family: var(--font); font-weight: 700;
    font-size: 15px; cursor: pointer; transition: opacity 0.2s; margin-top: 8px;
    letter-spacing: 0.3px;
  }
  .btn-primary:hover { opacity: 0.88; }
  .auth-error { color: var(--red); font-size: 13px; margin-top: 10px; text-align: center; }
  .auth-hint { font-size: 12px; color: var(--muted); text-align: center; margin-top: 20px; }
  .auth-hint span { color: var(--gold); font-weight: 600; }

  /* LAYOUT */
  .app { display: flex; min-height: 100vh; }
  .sidebar {
    width: 230px; flex-shrink: 0; background: var(--surface); border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 28px 16px; position: sticky; top: 0; height: 100vh;
  }
  .sidebar-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 36px; padding: 0 8px; }
  .sidebar-logo-icon { width: 30px; height: 30px; background: var(--gold); border-radius: 8px; display:grid; place-items:center; }
  .sidebar-logo-text { font-size: 17px; font-weight: 800; }
  .nav-label { font-size: 10px; color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; padding: 0 8px; margin-bottom: 6px; }
  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px;
    cursor: pointer; font-size: 14px; font-weight: 500; color: var(--muted);
    transition: all 0.15s; margin-bottom: 2px;
  }
  .nav-item:hover { background: var(--card); color: var(--text); }
  .nav-item.active { background: rgba(201,168,76,0.12); color: var(--gold); }
  .sidebar-bottom { margin-top: auto; }
  .user-chip {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px;
    background: var(--card); border-radius: 10px; cursor: pointer;
  }
  .avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--gold); display:grid; place-items:center; font-weight: 700; font-size: 13px; color: #0a0a0f; flex-shrink:0; }
  .user-info { flex: 1; min-width: 0; }
  .user-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-role { font-size: 11px; color: var(--muted); }

  /* MAIN */
  .main { flex: 1; padding: 32px; overflow-y: auto; max-width: 1100px; }
  .page-header { margin-bottom: 28px; }
  .page-title { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
  .page-sub { color: var(--muted); font-size: 14px; margin-top: 4px; }

  /* KPI CARDS */
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .kpi-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 20px;
    position: relative; overflow: hidden;
  }
  .kpi-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--accent, var(--gold));
  }
  .kpi-label { font-size: 11px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
  .kpi-value { font-size: 28px; font-weight: 800; font-family: var(--mono); letter-spacing: -1px; }
  .kpi-sub { font-size: 12px; color: var(--muted); margin-top: 6px; display: flex; align-items: center; gap: 4px; }
  .kpi-icon { position: absolute; right: 16px; top: 16px; opacity: 0.12; }

  /* CHARTS */
  .chart-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 24px; }
  .chart-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
  .chart-title { font-size: 15px; font-weight: 700; margin-bottom: 20px; }

  /* EXPENSES */
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .section-title { font-size: 16px; font-weight: 700; }
  .btn-add {
    display: flex; align-items: center; gap: 6px; padding: 8px 14px;
    background: var(--gold); color: #0a0a0f; border: none; border-radius: 8px;
    font-family: var(--font); font-weight: 700; font-size: 13px; cursor: pointer;
    transition: opacity 0.2s;
  }
  .btn-add:hover { opacity: 0.85; }
  .expense-list { display: flex; flex-direction: column; gap: 8px; }
  .expense-row {
    background: var(--card); border: 1px solid var(--border); border-radius: 12px;
    padding: 14px 16px; display: flex; align-items: center; gap: 12px;
    transition: border-color 0.15s;
  }
  .expense-row:hover { border-color: var(--gold-dim); }
  .exp-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .exp-info { flex: 1; }
  .exp-desc { font-size: 14px; font-weight: 600; }
  .exp-meta { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .exp-amount { font-family: var(--mono); font-size: 15px; font-weight: 500; }
  .btn-del { background: none; border: none; color: var(--muted); cursor: pointer; padding: 4px; border-radius: 6px; display:grid; place-items:center; transition: color 0.15s; }
  .btn-del:hover { color: var(--red); }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex;
    align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px);
  }
  .modal { background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 32px; width: 400px; }
  .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .modal-title { font-size: 18px; font-weight: 700; }
  .btn-close { background: none; border: none; color: var(--muted); cursor: pointer; }
  .field select {
    width: 100%; background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 12px 14px; color: var(--text); font-family: var(--font);
    font-size: 14px; outline: none;
  }

  /* BUDGET PAGE */
  .budget-grid { display: grid; gap: 12px; }
  .budget-row { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 18px 20px; }
  .budget-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .budget-cat { font-size: 14px; font-weight: 600; }
  .budget-nums { font-family: var(--mono); font-size: 13px; color: var(--muted); }
  .budget-bar-bg { height: 6px; background: var(--border); border-radius: 4px; overflow: hidden; }
  .budget-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }

  /* AI PAGE */
  .ai-wrap { display: grid; grid-template-columns: 1fr 320px; gap: 20px; height: calc(100vh - 180px); }
  .chat-panel { background: var(--card); border: 1px solid var(--border); border-radius: 16px; display: flex; flex-direction: column; }
  .chat-messages { flex: 1; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
  .msg { display: flex; gap: 10px; max-width: 85%; }
  .msg.user { align-self: flex-end; flex-direction: row-reverse; }
  .msg-avatar { width: 30px; height: 30px; border-radius: 50%; display:grid; place-items:center; font-size: 13px; flex-shrink:0; }
  .msg-bot-av { background: rgba(201,168,76,0.15); color: var(--gold); }
  .msg-user-av { background: var(--gold); color: #0a0a0f; font-weight:700; }
  .msg-bubble { padding: 12px 14px; border-radius: 12px; font-size: 14px; line-height: 1.6; }
  .msg.bot .msg-bubble { background: var(--surface); border: 1px solid var(--border); }
  .msg.user .msg-bubble { background: var(--gold); color: #0a0a0f; font-weight: 500; }
  .chat-input-row { display: flex; gap: 10px; padding: 16px; border-top: 1px solid var(--border); }
  .chat-input {
    flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
    padding: 11px 14px; color: var(--text); font-family: var(--font); font-size: 14px; outline: none;
  }
  .chat-input:focus { border-color: var(--gold); }
  .btn-send { padding: 11px 16px; background: var(--gold); color: #0a0a0f; border: none; border-radius: 10px; cursor: pointer; }
  .quick-chip {
    display: inline-flex; align-items: center; padding: 6px 12px; background: var(--surface);
    border: 1px solid var(--border); border-radius: 20px; font-size: 12px; cursor: pointer;
    transition: border-color 0.15s; white-space: nowrap;
  }
  .quick-chip:hover { border-color: var(--gold); color: var(--gold); }
  .ai-sidebar { display: flex; flex-direction: column; gap: 12px; }
  .ai-stat { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 18px; }
  .ai-stat-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .ai-stat-value { font-size: 22px; font-weight: 800; font-family: var(--mono); }
  .tag { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 5px; font-size: 11px; font-weight: 600; }
  .tag-green { background: rgba(76,175,130,0.15); color: var(--green); }
  .tag-red { background: rgba(224,92,106,0.15); color: var(--red); }
  .tag-gold { background: rgba(201,168,76,0.15); color: var(--gold); }

  /* TOOLTIP */
  .custom-tooltip { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; font-size: 13px; }

  /* TYPING */
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  .typing span { display:inline-block; width:5px; height:5px; border-radius:50%; background:var(--muted); margin:0 2px; animation: blink 1.2s infinite; }
  .typing span:nth-child(2){animation-delay:.2s} .typing span:nth-child(3){animation-delay:.4s}

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
`;

/* ─── HELPERS ────────────────────────────────────────────── */
const fmt = (n) => `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const getCatColor = (cat) => CATEGORY_COLORS[CATEGORIES.indexOf(cat)] ?? "#888";
const renderMd = (text) => text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

/* ─── COMPONENTS ─────────────────────────────────────────── */
function AuthPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handle = () => {
    if (email === MOCK_USER.email && password === MOCK_USER.password) {
      const token = btoa(JSON.stringify({ sub: MOCK_USER.email, exp: Date.now() + 3600000 }));
      onLogin(token);
    } else {
      setError("Invalid credentials. Use demo credentials below.");
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Wallet size={18} color="#0a0a0f" /></div>
          <span className="auth-logo-text">FinSight AI</span>
        </div>
        <div className="auth-title">Welcome back</div>
        <div className="auth-sub">Sign in to your financial dashboard</div>
        <div className="field">
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="nithin@example.com" type="email" />
        </div>
        <div className="field">
          <label>Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password"
            onKeyDown={e => e.key === "Enter" && handle()} />
        </div>
        <button className="btn-primary" onClick={handle}>Sign In</button>
        {error && <div className="auth-error">{error}</div>}
        <div className="auth-hint">Demo: <span>nithin@example.com</span> / <span>demo123</span></div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div style={{ color: "var(--muted)", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontFamily: "var(--mono)" }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
}

function Dashboard({ expenses }) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = CATEGORIES.map(c => ({
    name: c, value: expenses.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0)
  })).filter(c => c.value > 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-sub">March 2025 · Atlanta, USA</div>
      </div>

      <div className="kpi-grid">
        {[
          { label: "Total Spent", value: fmt(total), sub: "This month", icon: <CreditCard size={40} />, accent: "var(--gold)" },
          { label: "Remaining", value: fmt(2500 - total), sub: "of $2,500 budget", icon: <Wallet size={40} />, accent: "var(--green)" },
          { label: "Transactions", value: expenses.length, sub: "this month", icon: <ChevronRight size={40} />, accent: "var(--blue)" },
          { label: "Savings Rate", value: "74.8%", sub: "↑ vs Feb", icon: <TrendingUp size={40} />, accent: "var(--green)" },
        ].map((k, i) => (
          <div className="kpi-card" key={i} style={{ "--accent": k.accent }}>
            <div className="kpi-icon">{k.icon}</div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ color: k.accent }}>{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-title">6-Month Spending Trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_TREND}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#c9a84c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: "#6b6b80", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b6b80", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="spent" name="Spent" stroke="#c9a84c" strokeWidth={2} fill="url(#g1)" />
              <Area type="monotone" dataKey="budget" name="Budget" stroke="#3b9ae1" strokeWidth={1} strokeDasharray="4 4" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">By Category</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {byCategory.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[CATEGORIES.indexOf(_.name)]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: 8 }}>
            {byCategory.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--muted)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: getCatColor(c.name) }} />
                {c.name.split(" ")[0]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpensesPage({ expenses, setExpenses }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ desc: "", category: CATEGORIES[0], amount: "", date: new Date().toISOString().split("T")[0] });

  const add = () => {
    if (!form.desc || !form.amount) return;
    setExpenses(prev => [{ id: Date.now(), ...form, amount: parseFloat(form.amount) }, ...prev]);
    setForm({ desc: "", category: CATEGORIES[0], amount: "", date: new Date().toISOString().split("T")[0] });
    setShowModal(false);
  };

  const del = (id) => setExpenses(prev => prev.filter(e => e.id !== id));

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Expenses</div>
        <div className="page-sub">Track every transaction</div>
      </div>
      <div className="section-header">
        <span className="section-title">{expenses.length} transactions</span>
        <button className="btn-add" onClick={() => setShowModal(true)}><Plus size={14} /> Add Expense</button>
      </div>
      <div className="expense-list">
        {expenses.map(e => (
          <div className="expense-row" key={e.id}>
            <div className="exp-dot" style={{ background: getCatColor(e.category) }} />
            <div className="exp-info">
              <div className="exp-desc">{e.desc}</div>
              <div className="exp-meta">{e.category} · {e.date}</div>
            </div>
            <div className="exp-amount" style={{ color: "var(--red)" }}>-{fmt(e.amount)}</div>
            <button className="btn-del" onClick={() => del(e.id)}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Add Expense</span>
              <button className="btn-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="field"><label>Description</label>
              <input value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} placeholder="e.g. Grocery run" />
            </div>
            <div className="field"><label>Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field"><label>Amount ($)</label>
              <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" />
            </div>
            <div className="field"><label>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <button className="btn-primary" onClick={add}>Add Expense</button>
          </div>
        </div>
      )}
    </div>
  );
}

function BudgetPage({ expenses }) {
  const spent = (cat) => expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
  return (
    <div>
      <div className="page-header">
        <div className="page-title">Budget Tracker</div>
        <div className="page-sub">March 2025 limits</div>
      </div>
      <div className="budget-grid">
        {CATEGORIES.map((cat, i) => {
          const s = spent(cat), limit = BUDGET_LIMITS[cat], pct = Math.min((s / limit) * 100, 100);
          const over = s > limit;
          return (
            <div className="budget-row" key={cat}>
              <div className="budget-top">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: CATEGORY_COLORS[i] }} />
                  <span className="budget-cat">{cat}</span>
                  {over && <span className="tag tag-red">Over</span>}
                </div>
                <span className="budget-nums">{fmt(s)} / {fmt(limit)}</span>
              </div>
              <div className="budget-bar-bg">
                <div className="budget-bar-fill" style={{ width: `${pct}%`, background: over ? "var(--red)" : CATEGORY_COLORS[i] }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AIPage({ expenses, user }) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const [messages, setMessages] = useState([
    { role: "bot", text: `Hey ${user.name.split(" ")[0]}! I've analyzed your March spending. You're at **${fmt(total)}** of your $2,500 budget — looking solid. What would you like to explore?` }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = (text) => {
    const q = text || input.trim();
    if (!q) return;
    setInput("");
    setMessages(p => [...p, { role: "user", text: q }]);
    setTyping(true);
    setTimeout(() => {
      const reply = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
      setMessages(p => [...p, { role: "bot", text: reply }]);
      setTyping(false);
    }, 1400);
  };

  const QUICK = ["Am I on track this month?", "Where am I overspending?", "How can I save more?", "Compare to last month"];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">AI Insights</div>
        <div className="page-sub">GPT-powered budget analysis</div>
      </div>
      <div className="ai-wrap">
        <div className="chat-panel">
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(201,168,76,0.15)", display: "grid", placeItems: "center" }}>
              <Bot size={16} color="var(--gold)" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>FinSight AI</div>
              <div style={{ fontSize: 11, color: "var(--green)", display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)" }} /> Online
              </div>
            </div>
          </div>
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div className={`msg ${m.role}`} key={i}>
                <div className={`msg-avatar ${m.role === "bot" ? "msg-bot-av" : "msg-user-av"}`}>
                  {m.role === "bot" ? <Sparkles size={14} /> : user.name[0]}
                </div>
                <div className="msg-bubble" dangerouslySetInnerHTML={{ __html: renderMd(m.text) }} />
              </div>
            ))}
            {typing && (
              <div className="msg bot">
                <div className="msg-avatar msg-bot-av"><Sparkles size={14} /></div>
                <div className="msg-bubble"><div className="typing"><span /><span /><span /></div></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: "8px 16px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {QUICK.map(q => <div key={q} className="quick-chip" onClick={() => send(q)}>{q}</div>)}
          </div>
          <div className="chat-input-row">
            <input className="chat-input" value={input} onChange={e => setInput(e.target.value)}
              placeholder="Ask anything about your finances…" onKeyDown={e => e.key === "Enter" && send()} />
            <button className="btn-send" onClick={() => send()}><Send size={14} /></button>
          </div>
        </div>

        <div className="ai-sidebar">
          <div className="ai-stat">
            <div className="ai-stat-label">Monthly Budget</div>
            <div className="ai-stat-value" style={{ color: "var(--gold)" }}>{fmt(2500 - total)}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>remaining · {((total / 2500) * 100).toFixed(0)}% used</div>
          </div>
          <div className="ai-stat">
            <div className="ai-stat-label">Biggest Category</div>
            <div className="ai-stat-value" style={{ fontSize: 16, marginTop: 4 }}>Bills</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{fmt(142)} this month</div>
          </div>
          <div className="ai-stat">
            <div className="ai-stat-label">Savings Pace</div>
            <div className="ai-stat-value" style={{ color: "var(--green)" }}>↑ 12%</div>
            <div style={{ fontSize: 12, marginTop: 6 }}><span className="tag tag-green">Ahead of target</span></div>
          </div>
          <div className="ai-stat">
            <div className="ai-stat-label">JWT Session</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginTop: 6, wordBreak: "break-all", lineHeight: 1.5 }}>
              <span className="tag tag-gold">Secured</span>
              <div style={{ marginTop: 8 }}>AES-256 · Encrypted storage</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── APP ────────────────────────────────────────────────── */
export default function App() {
  const [token, setToken] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const user = MOCK_USER;

  if (!token) return (
    <>
      <style>{css}</style>
      <AuthPage onLogin={setToken} />
    </>
  );

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: <TrendingUp size={16} /> },
    { id: "expenses", label: "Expenses", icon: <CreditCard size={16} /> },
    { id: "budget", label: "Budget", icon: <Target size={16} /> },
    { id: "ai", label: "AI Insights", icon: <Sparkles size={16} /> },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon"><Wallet size={16} color="#0a0a0f" /></div>
            <span className="sidebar-logo-text">FinSight AI</span>
          </div>
          <div className="nav-label">Menu</div>
          {NAV.map(n => (
            <div key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
              {n.icon} {n.label}
            </div>
          ))}
          <div className="sidebar-bottom">
            <div className="user-chip">
              <div className="avatar">{user.name[0]}</div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-role">Pro Account</div>
              </div>
              <LogOut size={14} color="var(--muted)" style={{ cursor: "pointer" }} onClick={() => setToken(null)} />
            </div>
          </div>
        </div>

        <div className="main">
          {page === "dashboard" && <Dashboard expenses={expenses} />}
          {page === "expenses" && <ExpensesPage expenses={expenses} setExpenses={setExpenses} />}
          {page === "budget" && <BudgetPage expenses={expenses} />}
          {page === "ai" && <AIPage expenses={expenses} user={user} />}
        </div>
      </div>
    </>
  );
}
