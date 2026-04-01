import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Users, Plus, Trash2 } from 'lucide-react';
import styles from './Page.module.css';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [myRsvps, setMyRsvps] = useState(new Set());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', location: '', event_date: '', end_date: '' });
  const [msg, setMsg] = useState('');

  const load = async () => {
    const r = await api.get('/api/events');
    setEvents(r.data);
  };

  useEffect(() => { load(); }, []);

  const handleRSVP = async (id) => {
    await api.post(`/api/events/${id}/rsvp`);
    setMyRsvps(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
    load();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/api/events', form);
    setShowForm(false);
    setForm({ title: '', description: '', location: '', event_date: '', end_date: '' });
    setMsg('Event created!');
    load();
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    await api.delete(`/api/events/${id}`);
    load();
  };

  const fmt = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1><Calendar size={22} /> Events</h1>
          <p>Stay updated with SUZA alumni events and gatherings</p>
        </div>
        {user?.role === 'admin' && (
          <button className={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Add Event
          </button>
        )}
      </div>

      {msg && <div className={styles.success}>{msg}</div>}

      {showForm && (
        <div className={styles.formCard}>
          <h3>Create New Event</h3>
          <form onSubmit={handleCreate} className={styles.form}>
            <div className={styles.grid2}>
              <label>Event Title * <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></label>
              <label>Location <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></label>
              <label>Start Date & Time * <input type="datetime-local" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} required /></label>
              <label>End Date & Time <input type="datetime-local" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} /></label>
            </div>
            <label>Description <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></label>
            <div className={styles.formActions}>
              <button type="button" className={styles.btnSecondary} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className={styles.btnPrimary}>Create Event</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.cardGrid}>
        {events.map(e => (
          <div key={e.id} className={styles.eventCard}>
            <div className={styles.eventImg}>
              {e.image_url && <img src={e.image_url} alt={e.title} />}
            </div>
            <div className={styles.eventBody}>
              <div className={styles.eventTitle}>{e.title}</div>
              <div className={styles.eventDate}><Calendar size={12} /> {fmt(e.event_date)}</div>
              {e.location && <div className={styles.eventMeta}><MapPin size={12} /> {e.location}</div>}
              <div className={styles.eventMeta}><Users size={12} /> {e.rsvp_count} attending</div>
              {e.description && <p className={styles.eventDesc}>{e.description}</p>}
              <div className={styles.eventFooter}>
                <button
                  className={`${styles.btnOutline} ${myRsvps.has(e.id) ? styles.joined : ''}`}
                  onClick={() => handleRSVP(e.id)}
                >
                  {myRsvps.has(e.id) ? 'Cancel RSVP' : 'RSVP'}
                </button>
                {user?.role === 'admin' && (
                  <button className={styles.btnDanger} onClick={() => handleDelete(e.id)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className={styles.empty}>
          <Calendar size={40} opacity={0.3} />
          <p>No events scheduled</p>
        </div>
      )}
    </div>
  );
}
