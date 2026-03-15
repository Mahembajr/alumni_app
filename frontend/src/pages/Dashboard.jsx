import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Briefcase, Calendar, Users2, Bell, TrendingUp, ArrowRight } from 'lucide-react';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [adminStats, setAdminStats] = useState(null);

  useEffect(() => {
    api.get('/api/jobs').then(r => setJobs(r.data.slice(0, 3)));
    api.get('/api/events').then(r => setEvents(r.data.slice(0, 3)));
    api.get('/api/announcements').then(r => setAnnouncements(r.data.slice(0, 3)));
    api.get('/api/clubs').then(r => setClubs(r.data));
    if (user?.role === 'admin') {
      api.get('/api/admin/stats').then(r => setAdminStats(r.data));
    }
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div>
          <h1>{greeting()}, {user?.full_name?.split(' ')[0]} 👋</h1>
          <p>Welcome to the SUZA Alumni Community Portal</p>
        </div>
      </div>

      {adminStats && (
        <div className={styles.statsGrid}>
          {[
            { label: 'Total Alumni', value: adminStats.total_alumni, icon: '👩‍🎓', color: '#1a5c38' },
            { label: 'Active Jobs', value: adminStats.total_jobs, icon: '💼', color: '#3182ce' },
            { label: 'Events', value: adminStats.total_events, icon: '📅', color: '#d09a1a' },
            { label: 'Clubs', value: adminStats.total_clubs, icon: '🏛', color: '#805ad5' },
            { label: 'Pending Certs', value: adminStats.pending_certificates, icon: '📄', color: '#e53e3e' },
          ].map(s => (
            <div key={s.label} className={styles.statCard} style={{ borderTopColor: s.color }}>
              <span className={styles.statIcon}>{s.icon}</span>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.grid}>
        {/* Jobs */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Briefcase size={18} />
            <h2>Latest Jobs</h2>
            <Link to="/jobs" className={styles.viewAll}>View all <ArrowRight size={14} /></Link>
          </div>
          {jobs.length === 0 && <p className={styles.empty}>No jobs available</p>}
          {jobs.map(j => (
            <div key={j.id} className={styles.card}>
              <div className={styles.cardTitle}>{j.title}</div>
              <div className={styles.cardSub}>{j.company} · {j.location}</div>
              <span className={styles.badge}>{j.job_type}</span>
            </div>
          ))}
        </section>

        {/* Events */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Calendar size={18} />
            <h2>Upcoming Events</h2>
            <Link to="/events" className={styles.viewAll}>View all <ArrowRight size={14} /></Link>
          </div>
          {events.length === 0 && <p className={styles.empty}>No upcoming events</p>}
          {events.map(e => (
            <div key={e.id} className={styles.card}>
              <div className={styles.cardTitle}>{e.title}</div>
              <div className={styles.cardSub}>{new Date(e.event_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
              <div className={styles.cardSub}>{e.location}</div>
            </div>
          ))}
        </section>

        {/* Announcements */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Bell size={18} />
            <h2>Announcements</h2>
            <Link to="/announcements" className={styles.viewAll}>View all <ArrowRight size={14} /></Link>
          </div>
          {announcements.length === 0 && <p className={styles.empty}>No announcements</p>}
          {announcements.map(a => (
            <div key={a.id} className={styles.card}>
              <div className={styles.cardTitle}>{a.title}</div>
              <div className={styles.cardBody}>{a.content.substring(0, 100)}{a.content.length > 100 ? '…' : ''}</div>
              <div className={styles.cardSub}>{new Date(a.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </section>

        {/* Clubs */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Users2 size={18} />
            <h2>Alumni Clubs</h2>
            <Link to="/clubs" className={styles.viewAll}>View all <ArrowRight size={14} /></Link>
          </div>
          {clubs.slice(0, 4).map(c => (
            <div key={c.id} className={styles.card}>
              <div className={styles.cardTitle}>{c.name}</div>
              <div className={styles.cardSub}>{c.member_count} members · {c.category}</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
