import { useState, useEffect, useRef } from "react";

// ─── داده‌های اولیه ───────────────────────────────────────────────
const INITIAL_PRODUCTS = [
  { id: 1, name: "سدیم کلرید (NaCl)", category: "مواد شیمیایی", price: 45000, unit: "۵۰۰ گرم", rating: 4.8, reviews: 124, desc: "درجه ACS، خلوص ≥۹۹٪. مناسب برای بافرهای بیولوژیکی.", img: "🧂" },
  { id: 2, name: "اتانول ۹۵٪", category: "مواد شیمیایی", price: 120000, unit: "۱ لیتر", rating: 4.7, reviews: 89, desc: "اتانول دناتوره با خلوص بالا برای ضدعفونی و استخراج.", img: "🧴" },
  { id: 3, name: "اسید کلریدریک ۳۷٪", category: "مواد شیمیایی", price: 98000, unit: "۵۰۰ میلی‌لیتر", rating: 4.6, reviews: 67, desc: "درجه آنالیتیکال. برای تنظیم pH و سنتز.", img: "⚗️" },
  { id: 4, name: "پودر آگار", category: "مواد شیمیایی", price: 75000, unit: "۱۰۰ گرم", rating: 4.9, reviews: 201, desc: "درجه میکروبیولوژیکال برای کشت باکتری.", img: "🔬" },
  { id: 5, name: "ست بشر بروسیلیکات", category: "تجهیزات", price: 190000, unit: "ست ۶ تایی", rating: 4.9, reviews: 312, desc: "۲۵۰ تا ۲۰۰۰ میلی‌لیتر. مقاوم در برابر حرارت.", img: "🫙" },
  { id: 6, name: "میکروپیپت دیجیتال", category: "تجهیزات", price: 650000, unit: "۱ عدد", rating: 4.8, reviews: 145, desc: "تک کانال ۱۰۰–۱۰۰۰ میکرولیتر. قابل اتوکلاو.", img: "💉" },
  { id: 7, name: "عینک ایمنی آزمایشگاه", category: "ایمنی", price: 55000, unit: "۱ جفت", rating: 4.7, reviews: 278, desc: "ضد مه، پلی‌کربنات ضدپاشش. استاندارد ANSI Z87.1.", img: "🥽" },
  { id: 8, name: "دستکش نیتریل", category: "ایمنی", price: 65000, unit: "۱۰۰ عدد", rating: 4.9, reviews: 445, desc: "بدون پودر، فاقد لاتکس. مقاوم در برابر مواد شیمیایی.", img: "🧤" },
  { id: 9, name: "محلول بافر pH", category: "مواد شیمیایی", price: 110000, unit: "۳×۵۰۰ میلی‌لیتر", rating: 4.8, reviews: 173, desc: "استانداردهای کالیبراسیون pH 4، 7 و ۱۰.", img: "🌡️" },
  { id: 10, name: "ارلن مایر ۲۵۰ میلی‌لیتر", category: "تجهیزات", price: 38000, unit: "۱ عدد", rating: 4.7, reviews: 187, desc: "شیشه بروسیلیکات با درجه‌بندی. مناسب اختلاط و حرارت.", img: "⚗️" },
];

const CATEGORIES = ["همه", "مواد شیمیایی", "تجهیزات", "ایمنی"];

// ─── ذخیره‌سازی محلی ──────────────────────────────────────────────
const storage = {
  get: (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ─── کامپوننت‌های کمکی ───────────────────────────────────────────
const toPersianNum = n => String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
const formatPrice = p => toPersianNum(p.toLocaleString()) + " تومان";

function Stars({ rating }) {
  return (
    <span style={{ display: "inline-flex", gap: 2, alignItems: "center" }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? "#f59e0b" : "#e5e7eb"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      <span style={{ fontSize: 11, color: "#9ca3af", marginRight: 4 }}>{toPersianNum(rating)}</span>
    </span>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{label}</label>}
      <input {...props} style={{
        border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 14px",
        fontSize: 14, outline: "none", fontFamily: "inherit", direction: "rtl",
        transition: "border 0.2s", background: "#fafafa",
        ...(props.style || {})
      }}
      onFocus={e => e.target.style.borderColor = "#2563eb"}
      onBlur={e => e.target.style.borderColor = "#e5e7eb"}
      />
    </div>
  );
}

function Btn({ children, variant = "primary", ...props }) {
  const styles = {
    primary: { background: "#2563eb", color: "#fff" },
    danger:  { background: "#ef4444", color: "#fff" },
    ghost:   { background: "#f3f4f6", color: "#374151" },
    success: { background: "#059669", color: "#fff" },
  };
  return (
    <button {...props} style={{
      ...styles[variant], border: "none", borderRadius: 10,
      padding: "10px 20px", fontSize: 13, fontWeight: 700,
      cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s",
      ...(props.style || {})
    }}
    onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >{children}</button>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
      <div style={{ position: "relative", background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", direction: "rtl" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9ca3af" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── فرم ورود / ثبت‌نام خریدار ───────────────────────────────────
function AuthModal({ onClose, onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "" });
  const [err, setErr] = useState("");

  const users = () => storage.get("ls_buyers", []);

  const handleLogin = () => {
    const u = users().find(u => u.username === form.username && u.password === form.password);
    if (!u) return setErr("نام کاربری یا رمز اشتباه است.");
    onLogin({ ...u, role: "buyer" });
    onClose();
  };

  const handleRegister = () => {
    if (!form.username || !form.password) return setErr("لطفاً همه فیلدها را پر کنید.");
    if (form.password !== form.confirmPassword) return setErr("رمزها یکسان نیستند.");
    if (users().find(u => u.username === form.username)) return setErr("این نام کاربری قبلاً ثبت شده.");
    const newUser = { id: Date.now(), username: form.username, password: form.password };
    storage.set("ls_buyers", [...users(), newUser]);
    onLogin({ ...newUser, role: "buyer" });
    onClose();
  };

  const f = k => e => { setForm(p => ({ ...p, [k]: e.target.value })); setErr(""); };

  return (
    <Modal title={tab === "login" ? "ورود خریدار" : "ثبت‌نام خریدار"} onClose={onClose}>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["login","register"].map(t => (
          <button key={t} onClick={() => { setTab(t); setErr(""); }} style={{
            flex: 1, padding: "9px 0", borderRadius: 10, border: "none",
            background: tab === t ? "#2563eb" : "#f3f4f6",
            color: tab === t ? "#fff" : "#374151",
            fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit"
          }}>{t === "login" ? "ورود" : "ثبت‌نام"}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input label="نام کاربری" placeholder="نام کاربری خود را وارد کنید" value={form.username} onChange={f("username")} />
        <Input label="رمز عبور" type="password" placeholder="رمز عبور" value={form.password} onChange={f("password")} />
        {tab === "register" && <Input label="تکرار رمز عبور" type="password" placeholder="رمز را دوباره وارد کنید" value={form.confirmPassword} onChange={f("confirmPassword")} />}
        {err && <p style={{ margin: 0, color: "#ef4444", fontSize: 13, textAlign: "center" }}>{err}</p>}
        <Btn onClick={tab === "login" ? handleLogin : handleRegister} style={{ width: "100%", padding: "12px 0", fontSize: 15, marginTop: 4 }}>
          {tab === "login" ? "ورود به حساب" : "ایجاد حساب"}
        </Btn>
      </div>
    </Modal>
  );
}

// ─── فرم ورود فروشنده ─────────────────────────────────────────────
function SellerAuthModal({ onClose, onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  // اکانت پیش‌فرض فروشنده
  const SELLERS = [{ username: "admin", password: "1234" }];

  const handleLogin = () => {
    const s = SELLERS.find(s => s.username === form.username && s.password === form.password);
    if (!s) return setErr("نام کاربری یا رمز اشتباه است.\n(پیش‌فرض: admin / 1234)");
    onLogin({ username: s.username, role: "seller" });
    onClose();
  };

  return (
    <Modal title="ورود فروشنده 🏪" onClose={onClose}>
      <div style={{ background: "#eff6ff", borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#1d4ed8" }}>
        اکانت پیش‌فرض: <strong>admin</strong> / <strong>1234</strong>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input label="نام کاربری" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
        <Input label="رمز عبور" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
        {err && <p style={{ margin: 0, color: "#ef4444", fontSize: 13, whiteSpace: "pre-line", textAlign: "center" }}>{err}</p>}
        <Btn onClick={handleLogin} style={{ width: "100%", padding: "12px 0", fontSize: 15, marginTop: 4 }}>ورود به پنل فروشنده</Btn>
      </div>
    </Modal>
  );
}

// ─── پنل فروشنده ──────────────────────────────────────────────────
function SellerPanel({ products, setProducts, onLogout }) {
  const [editItem, setEditItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const emptyForm = { name: "", category: "مواد شیمیایی", price: "", unit: "", desc: "", img: "🧪", rating: 4.5, reviews: 0 };
  const [form, setForm] = useState(emptyForm);
  const [filterCat, setFilterCat] = useState("همه");

  const openAdd = () => { setForm(emptyForm); setEditItem(null); setShowForm(true); };
  const openEdit = p => { setForm({ ...p, price: String(p.price) }); setEditItem(p.id); setShowForm(true); };

  const save = () => {
    if (!form.name || !form.price) return;
    const item = { ...form, price: Number(form.price), id: editItem || Date.now() };
    setProducts(prev => editItem ? prev.map(p => p.id === editItem ? item : p) : [...prev, item]);
    setShowForm(false);
  };

  const del = id => { if (window.confirm("حذف شود؟")) setProducts(prev => prev.filter(p => p.id !== id)); };

  const EMOJIS = ["🧪","⚗️","🔬","🧴","🧂","🌡️","💉","🥽","🧤","🫙","🧲","📦","🔭","⚡","🧬"];

  const visible = products.filter(p => filterCat === "همه" || p.category === filterCat);

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", direction: "rtl", fontFamily: "inherit" }}>
      {/* هدر پنل */}
      <div style={{ background: "#1e3a8a", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>🏪</span>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>پنل فروشنده — <span style={{ color: "#93c5fd" }}>لب‌استور</span></span>
        </div>
        <Btn variant="ghost" onClick={onLogout} style={{ fontSize: 12, padding: "7px 16px" }}>خروج</Btn>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* نوار ابزار */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: 20 }}>مدیریت محصولات ({toPersianNum(visible.length)})</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setFilterCat(c)} style={{
                padding: "7px 14px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 700,
                background: filterCat === c ? "#2563eb" : "#e2e8f0",
                color: filterCat === c ? "#fff" : "#475569",
                cursor: "pointer", fontFamily: "inherit"
              }}>{c}</button>
            ))}
            <Btn onClick={openAdd} style={{ padding: "7px 18px", fontSize: 12 }}>+ افزودن محصول</Btn>
          </div>
        </div>

        {/* جدول محصولات */}
        <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["محصول","دسته‌بندی","قیمت","واحد","امتیاز","عملیات"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "right", fontSize: 12, fontWeight: 700, color: "#6b7280", borderBottom: "1px solid #f3f4f6" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f9fafb", background: i % 2 ? "#fafafa" : "#fff" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{p.img}</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: "#eff6ff", color: "#2563eb", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{p.category}</span>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 800, fontSize: 13 }}>{formatPrice(p.price)}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{p.unit}</td>
                  <td style={{ padding: "12px 16px" }}><Stars rating={p.rating} /></td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn variant="ghost" onClick={() => openEdit(p)} style={{ padding: "6px 12px", fontSize: 12 }}>✏️ ویرایش</Btn>
                      <Btn variant="danger" onClick={() => del(p.id)} style={{ padding: "6px 12px", fontSize: 12 }}>🗑 حذف</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
              <div style={{ fontSize: 48 }}>📦</div>
              <div style={{ marginTop: 12 }}>محصولی یافت نشد</div>
            </div>
          )}
        </div>
      </div>

      {/* فرم افزودن/ویرایش */}
      {showForm && (
        <Modal title={editItem ? "ویرایش محصول" : "افزودن محصول جدید"} onClose={() => setShowForm(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: "70vh", overflowY: "auto" }}>
            <Input label="نام محصول *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="مثال: اتانول ۹۶٪" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>دسته‌بندی</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", fontSize: 14, fontFamily: "inherit", direction: "rtl", background: "#fafafa" }}>
                {CATEGORIES.filter(c => c !== "همه").map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <Input label="قیمت (تومان) *" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="مثال: 85000" />
            <Input label="واحد" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} placeholder="مثال: ۵۰۰ گرم" />
            <Input label="توضیحات" value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} placeholder="توضیح کوتاه محصول..." />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>آیکون محصول</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setForm(p => ({ ...p, img: e }))} style={{
                    width: 38, height: 38, borderRadius: 8, border: form.img === e ? "2px solid #2563eb" : "2px solid #e5e7eb",
                    background: form.img === e ? "#eff6ff" : "#fff", fontSize: 20, cursor: "pointer"
                  }}>{e}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
              <Btn onClick={save} style={{ flex: 1, padding: "12px 0" }}>{editItem ? "ذخیره تغییرات" : "افزودن محصول"}</Btn>
              <Btn variant="ghost" onClick={() => setShowForm(false)} style={{ flex: 1, padding: "12px 0" }}>انصراف</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── سبد خرید ────────────────────────────────────────────────────
function CartDrawer({ cart, onClose, onRemove, onCheckout }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", justifyContent: "flex-start" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
      <div style={{ position: "relative", background: "#fff", width: 380, maxWidth: "100vw", height: "100%", display: "flex", flexDirection: "column", boxShadow: "8px 0 32px rgba(0,0,0,0.15)", direction: "rtl", fontFamily: "inherit" }}>
        <div style={{ padding: "24px 24px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 800, fontSize: 18 }}>🛒 سبد خرید ({toPersianNum(cart.reduce((s, i) => s + i.qty, 0))})</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#6b7280" }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", color: "#9ca3af", marginTop: 60 }}>
              <div style={{ fontSize: 48 }}>🧪</div>
              <p>سبد خرید خالی است</p>
            </div>
          ) : cart.map(item => (
            <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: 12, background: "#f9fafb", borderRadius: 12 }}>
              <span style={{ fontSize: 26 }}>{item.img}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{item.unit} × {toPersianNum(item.qty)}</div>
                <div style={{ fontWeight: 800, color: "#2563eb", fontSize: 13, marginTop: 2 }}>{formatPrice(item.price * item.qty)}</div>
              </div>
              <button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18 }}>🗑</button>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div style={{ padding: 20, borderTop: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontWeight: 700 }}>
              <span>جمع کل:</span>
              <span style={{ fontSize: 16, color: "#1d4ed8" }}>{formatPrice(total)}</span>
            </div>
            <Btn onClick={onCheckout} style={{ width: "100%", padding: "13px 0", fontSize: 15 }}>ثبت سفارش ←</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── دستیار هوش مصنوعی ────────────────────────────────────────────
function AIAssistant({ products, onClose }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "سلام! من دستیار هوشمند لب‌استور هستم 🤖\n\nمی‌تونم در انتخاب محصولات، مقایسه مواد شیمیایی، یا توضیح پروتکل‌های آزمایشگاهی کمکت کنم. بپرس!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `تو دستیار هوشمند فروشگاه لوازم آزمایشگاهی «لب‌استور» هستی. به فارسی پاسخ بده.
محصولات موجود:
${products.map(p => `- ${p.name} (${p.category}): ${p.price.toLocaleString()} تومان / ${p.unit} — ${p.desc}`).join("\n")}
پاسخ‌های کوتاه، مفید و دوستانه بده. حداکثر ۱۵۰ کلمه.`,
          messages: messages.slice(1).map(m => ({ role: m.role, content: m.text })).concat([{ role: "user", content: q }])
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", text: data.content?.[0]?.text || "خطا در دریافت پاسخ." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "خطای اتصال. دوباره تلاش کن." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", bottom: 24, left: 24, zIndex: 1001, width: 360, height: 500, background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "inherit", direction: "rtl" }}>
      <div style={{ background: "linear-gradient(135deg,#1e3a8a,#2563eb)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>🤖</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>دستیار هوشمند</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>پشتیبانی شده توسط Claude</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-start" : "flex-end" }}>
            <div style={{ maxWidth: "85%", padding: "10px 14px", borderRadius: m.role === "user" ? "18px 18px 18px 4px" : "18px 18px 4px 18px", background: m.role === "user" ? "#2563eb" : "#f3f4f6", color: m.role === "user" ? "#fff" : "#111827", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 5, padding: "10px 14px", background: "#f3f4f6", borderRadius: "18px 18px 4px 18px", width: "fit-content", alignSelf: "flex-end" }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#9ca3af", animation: `bounce 1s ${i*0.2}s infinite` }} />)}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: "12px 14px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="سوال بپرس..." style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", fontFamily: "inherit", direction: "rtl" }} />
        <button onClick={send} disabled={!input.trim() || loading} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", cursor: "pointer", fontSize: 16, opacity: (!input.trim() || loading) ? 0.5 : 1 }}>↑</button>
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

// ─── کارت محصول ───────────────────────────────────────────────────
function ProductCard({ product, onAdd, user, onLoginRequired }) {
  const [added, setAdded] = useState(false);
  const handleAdd = () => {
    if (!user) return onLoginRequired();
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 20, display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "box-shadow 0.2s,transform 0.2s", direction: "rtl" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ fontSize: 44, textAlign: "center", padding: "8px 0" }}>{product.img}</div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{product.category}</div>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#111827", lineHeight: 1.4 }}>{product.name}</div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{product.unit}</div>
      </div>
      <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{product.desc}</div>
      <Stars rating={product.rating} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 6 }}>
        <span style={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>{formatPrice(product.price)}</span>
        <Btn onClick={handleAdd} variant={added ? "success" : "primary"} style={{ padding: "8px 14px", fontSize: 12 }}>
          {added ? "✓ افزوده شد" : "+ سبد خرید"}
        </Btn>
      </div>
    </div>
  );
}

// ─── اپ اصلی ─────────────────────────────────────────────────────
export default function App() {
  const [products, setProductsRaw] = useState(() => storage.get("ls_products", INITIAL_PRODUCTS));
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(() => storage.get("ls_user", null));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("همه");
  const [showCart, setShowCart] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showBuyerAuth, setShowBuyerAuth] = useState(false);
  const [showSellerAuth, setShowSellerAuth] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [aiIds, setAiIds] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const searchTimer = useRef(null);

  const setProducts = p => { setProductsRaw(p); storage.set("ls_products", typeof p === "function" ? p(products) : p); };
  const saveProducts = fn => { const next = fn(products); setProductsRaw(next); storage.set("ls_products", next); };

  const login = u => { setUser(u); storage.set("ls_user", u); };
  const logout = () => { setUser(null); storage.remove?.("ls_user") ?? localStorage.removeItem("ls_user"); };

  // جستجوی هوشمند
  useEffect(() => {
    if (!search.trim()) { setAiIds(null); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setAiLoading(true);
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 200,
            system: `موتور جستجوی محصولات آزمایشگاهی هستی. فقط یک آرایه JSON از IDهای مرتبط برگردون. محصولات: ${products.map(p => `${p.id}:${p.name}(${p.category})`).join(", ")}. فقط آرایه عدد مثل [1,3] برگردون.`,
            messages: [{ role: "user", content: search }]
          })
        });
        const data = await res.json();
        const text = data.content?.[0]?.text || "[]";
        setAiIds(JSON.parse(text.replace(/```json|```/g, "").trim()));
      } catch { setAiIds(null); }
      setAiLoading(false);
    }, 700);
  }, [search]);

  const addToCart = p => setCart(prev => {
    const ex = prev.find(i => i.id === p.id);
    return ex ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }];
  });

  const removeFromCart = id => setCart(prev => prev.filter(i => i.id !== id));

  const checkout = () => {
    setCart([]); setShowCart(false);
    setOrderDone(true); setTimeout(() => setOrderDone(false), 3500);
  };

  const filtered = products.filter(p => {
    if (aiIds) return aiIds.includes(p.id);
    const q = search.toLowerCase();
    return (!q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) &&
           (category === "همه" || p.category === category);
  });

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // اگر فروشنده وارد شده، پنل فروشنده نشان بده
  if (user?.role === "seller") {
    return <SellerPanel
      products={products}
      setProducts={p => { const next = typeof p === "function" ? p(products) : p; setProductsRaw(next); storage.set("ls_products", next); }}
      onLogout={logout}
    />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", direction: "rtl", fontFamily: "'Vazirmatn', Tahoma, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {/* هدر */}
      <header style={{ background: "#1e3a8a", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: 16, height: 64 }}>
          {/* لوگو */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 22 }}>⚗️</span>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 19 }}>لب<span style={{ color: "#60a5fa" }}>استور</span></span>
          </div>

          {/* سرچ */}
          <div style={{ flex: 1, position: "relative" }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="جستجوی هوشمند: مثلاً «ایمنی آزمایشگاه» یا «بافر pH»..."
              style={{ width: "100%", padding: "9px 44px 9px 16px", borderRadius: 10, border: "none", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box", direction: "rtl" }} />
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 14 }}>
              {aiLoading ? "🤖" : "🔍"}
            </div>
          </div>

          {/* دکمه‌های ورود */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {user ? (
              <>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, alignSelf: "center" }}>👤 {user.username}</span>
                <Btn variant="ghost" onClick={logout} style={{ padding: "7px 14px", fontSize: 12 }}>خروج</Btn>
              </>
            ) : (
              <>
                <Btn variant="ghost" onClick={() => setShowBuyerAuth(true)} style={{ padding: "7px 14px", fontSize: 12 }}>ورود خریدار</Btn>
                <Btn onClick={() => setShowSellerAuth(true)} variant="success" style={{ padding: "7px 14px", fontSize: 12 }}>🏪 فروشنده</Btn>
              </>
            )}
            <button onClick={() => setShowCart(true)} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
              🛒 {cartCount > 0 && <span style={{ background: "#ef4444", borderRadius: 20, padding: "1px 7px", fontSize: 12 }}>{toPersianNum(cartCount)}</span>}
              سبد
            </button>
          </div>
        </div>

        {/* دسته‌بندی */}
        <div style={{ background: "#1e40af", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", gap: 4 }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)} style={{
                background: category === c ? "rgba(255,255,255,0.2)" : "transparent",
                color: "#fff", border: "none", padding: "9px 18px", cursor: "pointer",
                fontWeight: category === c ? 700 : 400, fontSize: 13,
                borderBottom: category === c ? "2px solid #60a5fa" : "2px solid transparent",
                fontFamily: "inherit"
              }}>{c}</button>
            ))}
          </div>
        </div>
      </header>

      {/* محتوای اصلی */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
        {orderDone && (
          <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 12, padding: "14px 20px", marginBottom: 20, fontWeight: 700, color: "#065f46" }}>
            ✅ سفارش شما با موفقیت ثبت شد! از خرید از لب‌استور ممنونیم.
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: 20 }}>
              {search ? `نتایج جستجو: «${search}»` : category === "همه" ? "همه محصولات" : category}
            </h2>
            <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 13 }}>
              {toPersianNum(filtered.length)} محصول {aiIds ? "· 🤖 مرتب‌سازی هوشمند" : ""}
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
            <div style={{ fontSize: 60 }}>🔬</div>
            <div style={{ fontSize: 18, fontWeight: 700, margin: "12px 0 8px" }}>محصولی یافت نشد</div>
            <div style={{ fontSize: 14 }}>از دستیار هوشمند کمک بگیر!</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 18 }}>
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} user={user} onLoginRequired={() => setShowBuyerAuth(true)} />
            ))}
          </div>
        )}
      </main>

      {/* دکمه AI */}
      {!showAI && (
        <button onClick={() => setShowAI(true)} title="دستیار هوشمند" style={{ position: "fixed", bottom: 24, left: 24, zIndex: 999, width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#1e3a8a,#2563eb)", border: "none", color: "#fff", fontSize: 26, cursor: "pointer", boxShadow: "0 8px 24px rgba(37,99,235,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>🤖</button>
      )}

      {showCart && <CartDrawer cart={cart} onClose={() => setShowCart(false)} onRemove={removeFromCart} onCheckout={checkout} />}
      {showAI && <AIAssistant products={products} onClose={() => setShowAI(false)} />}
      {showBuyerAuth && <AuthModal onClose={() => setShowBuyerAuth(false)} onLogin={login} />}
      {showSellerAuth && <SellerAuthModal onClose={() => setShowSellerAuth(false)} onLogin={login} />}
    </div>
  );
}
