import { useState, useEffect } from "react";
import { autoAPI, refAPI } from "../api";

const EMPTY = { color_id: "", id_STO: "", mark: "", VIN_code: "", photo: "", id_vod: "" };

export default function AddAutoModal({ onClose, onSuccess }) {
  const [form, setForm]     = useState(EMPTY);
  const [refs, setRefs]     = useState({ colors: [], stos: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  useEffect(() => {
    Promise.all([refAPI.getColors(), refAPI.getSTO(), refAPI.getUsers()]).then(
      ([colors, stos, users]) => setRefs({ colors, stos, users })
    );
  }, []);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    setError("");
    if (!form.mark || !form.VIN_code || !form.color_id || !form.id_STO || !form.id_vod) {
      setError("Заповніть всі обов'язкові поля");
      return;
    }
    setLoading(true);
    try {
      await autoAPI.create(form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Помилка сервера");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <div className="modal__header">
          <h2>Додати автомобіль</h2>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="modal__body">
          {error && <p className="error-msg" style={{marginBottom:"1rem"}}>{error}</p>}
          <div className="form">
            <div className="form__row">
              <div className="form__group">
                <label>Марка *</label>
                <input name="mark" value={form.mark} onChange={handle} placeholder="Toyota Camry" />
              </div>
              <div className="form__group">
                <label>VIN-код *</label>
                <input name="VIN_code" value={form.VIN_code} onChange={handle} placeholder="JT2BF22K1W0123456" maxLength={17} />
              </div>
            </div>
            <div className="form__row">
              <div className="form__group">
                <label>Колір *</label>
                <select name="color_id" value={form.color_id} onChange={handle}>
                  <option value="">— оберіть —</option>
                  {refs.colors.map(c => <option key={c.id_color} value={c.id_color}>{c.code_color}</option>)}
                </select>
              </div>
              <div className="form__group">
                <label>СТО *</label>
                <select name="id_STO" value={form.id_STO} onChange={handle}>
                  <option value="">— оберіть —</option>
                  {refs.stos.map(s => <option key={s.number_sto} value={s.number_sto}>{s.namesto}</option>)}
                </select>
              </div>
            </div>
            <div className="form__group">
              <label>Власник *</label>
              <select name="id_vod" value={form.id_vod} onChange={handle}>
                <option value="">— оберіть —</option>
                {refs.users.map(u => <option key={u.number_user} value={u.number_user}>{u.pibVod}</option>)}
              </select>
            </div>
            <div className="form__group">
              <label>Фото (URL)</label>
              <input name="photo" value={form.photo} onChange={handle} placeholder="https://..." />
            </div>
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn--outline" onClick={onClose}>Скасувати</button>
          <button className="btn btn--primary" onClick={submit} disabled={loading}>
            {loading ? "Збереження..." : "Додати авто"}
          </button>
        </div>
      </div>
    </div>
  );
}
