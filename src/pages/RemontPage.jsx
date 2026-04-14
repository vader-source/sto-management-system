import { useState, useEffect } from "react";
import { remontAPI, autoAPI, refAPI } from "../api";

function formatDate(d) { return d ? new Date(d).toLocaleDateString("uk-UA") : "—"; }

const EMPTY_FORM = { id_Avto: "", Id_mech: "", desciption: "", price: "", timestart: "", id_vod: "" };

export default function RemontPage() {
  const [repairs,  setRepairs]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [refs,     setRefs]     = useState({ autos: [], mechs: [] });
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  const load = async () => {
    setLoading(true);
    try { setRepairs(await remontAPI.getAll()); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    Promise.all([autoAPI.getAll(), refAPI.getMachenist()]).then(([autos, mechs]) => setRefs({ autos, mechs }));
  }, []);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    setError("");
    if (!form.id_Avto || !form.Id_mech) { setError("Авто та механік є обов'язковими"); return; }
    setSaving(true);
    try {
      // auto contains id_vod (owner)
      const auto = refs.autos.find(a => a.number_avto === parseInt(form.id_Avto));
      await remontAPI.create({ ...form, id_vod: auto?.id_vod || form.id_vod });
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Помилка сервера");
    } finally {
      setSaving(false);
    }
  };

  const finish = async (id) => {
    if (!confirm("Позначити ремонт як завершений?")) return;
    await remontAPI.update(id, { dataend: new Date().toISOString() });
    load();
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Ремонти</h1>
        <p>Журнал технічного обслуговування та ремонтів</p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <button className="btn btn--primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? "✕ Закрити форму" : "+ Новий ремонт"}
        </button>
      </div>

      {/* Inline create form */}
      {showForm && (
        <div className="card card--accent fade-in" style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: "1.2rem" }}>
            НОВИЙ ЗАПИС ПРО РЕМОНТ
          </h3>
          {error && <p className="error-msg" style={{ marginBottom: "1rem" }}>{error}</p>}
          <div className="form">
            <div className="form__row">
              <div className="form__group">
                <label>Автомобіль *</label>
                <select name="id_Avto" value={form.id_Avto} onChange={handle}>
                  <option value="">— оберіть —</option>
                  {refs.autos.map(a => <option key={a.number_avto} value={a.number_avto}>{a.mark} — {a.VIN_code}</option>)}
                </select>
              </div>
              <div className="form__group">
                <label>Механік *</label>
                <select name="Id_mech" value={form.Id_mech} onChange={handle}>
                  <option value="">— оберіть —</option>
                  {refs.mechs.map(m => <option key={m.number_mach} value={m.number_mach}>{m.pib}</option>)}
                </select>
              </div>
            </div>
            <div className="form__row">
              <div className="form__group">
                <label>Вартість (₴)</label>
                <input name="price" type="number" value={form.price} onChange={handle} placeholder="0.00" />
              </div>
              <div className="form__group">
                <label>Дата початку</label>
                <input name="timestart" type="date" value={form.timestart} onChange={handle} />
              </div>
            </div>
            <div className="form__group">
              <label>Опис робіт</label>
              <textarea name="desciption" value={form.desciption} onChange={handle} placeholder="Перелік виконуваних робіт..." />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button className="btn btn--outline" onClick={() => setShowForm(false)}>Скасувати</button>
            <button className="btn btn--primary" onClick={submit} disabled={saving}>
              {saving ? "Збереження..." : "Зберегти ремонт"}
            </button>
          </div>
        </div>
      )}

      {loading ? <p className="loading">Завантаження</p> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Авто</th>
                <th>Механік</th>
                <th>Опис</th>
                <th>Початок</th>
                <th>Завершення</th>
                <th>Вартість</th>
                <th>Статус</th>
                <th>Дія</th>
              </tr>
            </thead>
            <tbody>
              {repairs.length === 0
                ? <tr><td colSpan={9} className="empty-msg">Записів немає</td></tr>
                : repairs.map(r => (
                  <tr key={r.id_rem}>
                    <td><span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>#{r.id_rem}</span></td>
                    <td className="primary">{r.auto?.mark || "—"}</td>
                    <td>{r.machenist?.pib || "—"}</td>
                    <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.desciption || "—"}</td>
                    <td>{formatDate(r.timestart)}</td>
                    <td>{formatDate(r.dataend)}</td>
                    <td>{r.price ? `${r.price.toLocaleString("uk-UA")} ₴` : "—"}</td>
                    <td>
                      <span className={`badge badge--${r.dataend ? "done" : "active"}`}>
                        {r.dataend ? "Завершено" : "Активний"}
                      </span>
                    </td>
                    <td>
                      {!r.dataend && (
                        <button className="btn btn--danger" style={{ padding: "0.3rem 0.6rem", fontSize: "0.65rem" }} onClick={() => finish(r.id_rem)}>
                          Завершити
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
