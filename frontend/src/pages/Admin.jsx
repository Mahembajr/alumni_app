import { useEffect, useState } from 'react';
import api from '../api';
import { Settings, Users, Briefcase, Calendar, Users2, Bell, FileText, Trash2 } from 'lucide-react';
import styles from './Page.module.css';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [alumni, setAlumni] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const loadStats = () => api.get('/api/admin/stats').then(r => setStats(r.data));
  const loadAlumni = () => api.get('/api/users').then(r => setAlumni(r.data));
  const loadJobs = () => api.get('/api/jobs').then(r => setJobs(r.data));

  useEffect(() => {
    loadStats();
    loadAlumni();
    loadJobs();
  }, []);

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    await api.delete(`/api/users/${id}`);
    loadAlumni();
    loadStats();
  };

  const handleDeleteJob = async (id) => {
    if (!confirm('Remove this job?')) return;
    await api.delete(`/api/jobs/${id}`);
    loadJobs();
    loadStats();
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div><h1><Settings size={22} /> Admin Panel</h1><p>Manage the SUZA Alumni platform</p></div>
      </div>

      <div className={styles.tabs}>
        {[['overview', '📊 Overview'], ['alumni', '👩‍🎓 Alumni'], ['jobs', '💼 Jobs']].map(([id, label]) => (
          <button key={id} className={`${styles.tab} ${activeTab === id ? styles.activeTab : ''}`} onClick={() => setActiveTab(id)}>{label}</button>
        ))}
      </div>

      {activeTab === 'overview' && stats && (
        <div className={styles.adminGrid}>
          {[
            { icon: <Users size={18} />, label: 'Total Alumni', value: stats.total_alumni, color: 'var(--primary)' },
            { icon: <Briefcase size={18} />, label: 'Active Jobs', value: stats.total_jobs, color: 'var(--info)' },
            { icon: <Calendar size={18} />, label: 'Events', value: stats.total_events, color: 'var(--accent-dark)' },
            { icon: <Users2 size={18} />, label: 'Clubs', value: stats.total_clubs, color: '#805ad5' },
            { icon: <FileText size={18} />, label: 'Pending Certificates', value: stats.pending_certificates, color: 'var(--danger)' },
            { icon: <Bell size={18} />, label: 'Announcements', value: stats.total_announcements, color: 'var(--success)' },
          ].map(s => (
            <div key={s.label} className={styles.adminSection} style={{ borderTop: `3px solid ${s.color}` }}>
              <div className={styles.adminSectionTitle} style={{ color: s.color }}>{s.icon} {s.label}</div>
              <div style={{ fontSize: 40, fontWeight: 700 }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'alumni' && (
        <div>
          <div style={{ marginBottom: 14, fontSize: 13, color: 'var(--text-muted)' }}>{alumni.length} registered alumni</div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Program</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Year</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {alumni.map(a => (
                  <tr key={a.id} style={{ borderTop: '1px solid var(--border)', fontSize: 13 }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{a.full_name}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{a.email}</td>
                    <td style={{ padding: '10px 14px' }}>{a.program || '—'}</td>
                    <td style={{ padding: '10px 14px' }}>{a.graduation_year || '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <button className={styles.btnDanger} onClick={() => handleDeactivate(a.id)}>
                        <Trash2 size={13} /> Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div>
          <div style={{ marginBottom: 14, fontSize: 13, color: 'var(--text-muted)' }}>{jobs.length} active jobs</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {jobs.map(j => (
              <div key={j.id} className={styles.adminSection} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{j.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{j.company} · {j.location} · {j.job_type}</div>
                </div>
                <button className={styles.btnDanger} onClick={() => handleDeleteJob(j.id)}>
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
