import { useState, useEffect } from "react";
import { remontAPI, autoAPI } from "../api";
import AddAutoModal from "../components/AddAutoModal";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("uk-UA");
}

export default function Dashboard() {
  const [repairs, setRepairs] = useState([]);
  const [stats,   setStats]   = useState({ total: 0, active: 0, autos: 0 });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [active, all, autos] = await Promise.all([
        remontAPI.getAll(true),
        remontAPI.getAll(false),
        autoAPI.getAll(),
      ]);
      setRepairs(active);
      setStats({ total: all.length, active: active.length, autos: autos.length });
    } catch {
      setError("Не вдалося завантажити дані. Перевірте підключення до сервера.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Дашборд</h1>
        <p>Система управління СТО — активні ремонти та стан автопарку</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__value">{stats.active}</div>
          <div className="stat-card__label">Активних ремонтів</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{stats.total}</div>
          <div className="stat-card__label">Всього ремонтів</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{stats.autos}</div>
          <div className="stat-card__label">Автомобілів в системі</div>
        </div>
      </div>

      {/* Active Repairs Table */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
          ▶ Активні ремонти
        </h2>
        <button className="btn btn--primary" onClick={() => setShowAdd(true)}>
          + Додати авто
        </button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {loading ? (
        <p className="loading">Завантаження даних</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Авто</th>
                <th>VIN</th>
                <th>Власник</th>
                <th>Механік</th>
                <th>Опис</th>
                <th>Дата початку</th>
                <th>Вартість</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {repairs.length === 0 ? (
                <tr><td colSpan={9} className="empty-msg">Активних ремонтів немає</td></tr>
              ) : repairs.map(r => (
                <tr key={r.id_rem}>
                  <td><span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>#{r.id_rem}</span></td>
                  <td className="primary">{r.auto?.mark || "—"}</td>
                  <td><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{r.auto?.VIN_code || "—"}</span></td>
                  <td>{r.auto?.user?.pibVod || "—"}</td>
                  <td>{r.machenist?.pib || "—"}</td>
                  <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.desciption || "—"}
                  </td>
                  <td>{formatDate(r.timestart)}</td>
                  <td className="primary">{r.price ? `${r.price.toLocaleString("uk-UA")} ₴` : "—"}</td>
                  <td><span className="badge badge--active">Активний</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && <AddAutoModal onClose={() => setShowAdd(false)} onSuccess={load} />}
    </div>
  );
}
