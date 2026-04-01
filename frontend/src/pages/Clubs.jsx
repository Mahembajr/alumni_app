import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Users2, Plus, Trash2 } from 'lucide-react';
import styles from './Page.module.css';

const ICONS = { academic: '📚', regional: '🌍', interest: '⭐', default: '🏛' };

export default function Clubs() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [myClubs, setMyClubs] = useState(new Set());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: 'academic' });
  const [msg, setMsg] = useState('');

  const load = () => api.get('/api/clubs').then(r => setClubs(r.data));
  useEffect(() => { load(); }, []);

  const handleJoin = async (id) => {
    await api.post(`/api/clubs/${id}/join`);
    setMyClubs(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
    load();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/api/clubs', form);
    setShowForm(false);
    setForm({ name: '', description: '', category: 'academic' });
    setMsg('Club created!');
    load();
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this club?')) return;
    await api.delete(`/api/clubs/${id}`);
    load();
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1><Users2 size={22} /> Alumni Clubs</h1>
          <p>Join communities of like-minded SUZA graduates</p>
        </div>
        {user?.role === 'admin' && (
          <button className={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Create Club
          </button>
        )}
      </div>

      {msg && <div className={styles.success}>{msg}</div>}

      {showForm && (
        <div className={styles.formCard}>
          <h3>Create New Club</h3>
          <form onSubmit={handleCreate} className={styles.form}>
            <div className={styles.grid2}>
              <label>Club Name * <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></label>
              <label>Category
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option value="academic">Academic</option>
                  <option value="regional">Regional</option>
                  <option value="interest">Interest</option>
                </select>
              </label>
            </div>
            <label>Description <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></label>
            <div className={styles.formActions}>
              <button type="button" className={styles.btnSecondary} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className={styles.btnPrimary}>Create Club</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.cardGrid}>
        {clubs.map(c => (
          <div key={c.id} className={styles.clubCard}>
            <div className={styles.clubHeader}>
              <div className={styles.clubIcon}>{ICONS[c.category] || ICONS.default}</div>
              <div>
                <div className={styles.clubName}>{c.name}</div>
                <div className={styles.clubCategory}>{c.category} club</div>
              </div>
            </div>
            {c.description && <p className={styles.clubDesc}>{c.description}</p>}
            <div className={styles.clubFooter}>
              <span className={styles.clubMembers}><Users2 size={13} style={{verticalAlign:'middle'}} /> {c.member_count} members</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={`${styles.btnOutline} ${myClubs.has(c.id) ? styles.joined : ''}`}
                  onClick={() => handleJoin(c.id)}
                >
                  {myClubs.has(c.id) ? 'Leave' : 'Join'}
                </button>
                {user?.role === 'admin' && (
                  <button className={styles.btnDanger} onClick={() => handleDelete(c.id)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {clubs.length === 0 && (
        <div className={styles.empty}>
          <Users2 size={40} opacity={0.3} />
          <p>No clubs yet</p>
        </div>
      )}
    </div>
  );
}
