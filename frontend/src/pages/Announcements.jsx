import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Bell, Plus, Trash2 } from 'lucide-react';
import styles from './Page.module.css';

export default function Announcements() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [msg, setMsg] = useState('');

  const load = () => api.get('/api/announcements').then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/api/announcements', form);
    setShowForm(false);
    setForm({ title: '', content: '' });
    setMsg('Announcement posted!');
    load();
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    await api.delete(`/api/announcements/${id}`);
    load();
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1><Bell size={22} /> Bulletin Board</h1>
          <p>University news, announcements and updates for alumni</p>
        </div>
        {user?.role === 'admin' && (
          <button className={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Post Announcement
          </button>
        )}
      </div>

      {msg && <div className={styles.success}>{msg}</div>}

      {showForm && (
        <div className={styles.formCard}>
          <h3>New Announcement</h3>
          <form onSubmit={handleCreate} className={styles.form}>
            <label>Title * <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></label>
            <label>Content * <textarea rows={5} value={form.content} onChange={e => setForm({...form, content: e.target.value})} required /></label>
            <div className={styles.formActions}>
              <button type="button" className={styles.btnSecondary} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className={styles.btnPrimary}>Post</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(a => (
          <div key={a.id} className={styles.annCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className={styles.annTitle}>{a.title}</div>
              {user?.role === 'admin' && (
                <button className={styles.btnDanger} onClick={() => handleDelete(a.id)} style={{ flexShrink: 0 }}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className={styles.annContent}>{a.content}</p>
            <div className={styles.annDate}>{new Date(a.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className={styles.empty}>
          <Bell size={40} opacity={0.3} />
          <p>No announcements yet</p>
        </div>
      )}
    </div>
  );
}
