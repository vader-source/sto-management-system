import { useState, useEffect } from "react";
import { autoAPI } from "../index";
import AddAutoModal from "../components/AddAutoModal";

export default function AutoPage() {
  const [autos,   setAutos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search,  setSearch]  = useState("");

  const load = async () => {
    setLoading(true);
    try { setAutos(await autoAPI.getAll()); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = autos.filter(a =>
    a.mark?.toLowerCase().includes(search.toLowerCase()) ||
    a.VIN_code?.toLowerCase().includes(search.toLowerCase()) ||
    a.user?.pibVod?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Автомобілі</h1>
        <p>Реєстр транспортних засобів в системі СТО</p>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "center" }}>
        <input
          style={{ flex: 1, background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "0.55rem 0.8rem", borderRadius: "var(--radius)", outline: "none" }}
          placeholder="Пошук за маркою, VIN або власником..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn btn--primary" onClick={() => setShowAdd(true)}>+ Нове авто</button>
      </div>

      {loading ? <p className="loading">Завантаження</p> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Марка</th>
                <th>VIN-код</th>
                <th>Колір</th>
                <th>СТО</th>
                <th>Власник</th>
                <th>Телефон</th>
                <th>Ремонтів</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={8} className="empty-msg">Нічого не знайдено</td></tr>
                : filtered.map(a => (
                  <tr key={a.number_avto}>
                    <td><span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>#{a.number_avto}</span></td>
                    <td className="primary">{a.mark}</td>
                    <td><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{a.VIN_code}</span></td>
                    <td>{a.color?.code_color || "—"}</td>
                    <td>{a.sto?.namesto || "—"}</td>
                    <td>{a.user?.pibVod || "—"}</td>
                    <td>{a.user?.phoneNumber || "—"}</td>
                    <td><span className="badge badge--pending">{a.remont?.length ?? 0}</span></td>
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
