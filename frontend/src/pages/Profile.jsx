import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { User, Award, Briefcase, Save, Plus, Trash2 } from 'lucide-react';
import styles from './Page.module.css';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [activeTab, setActiveTab] = useState('info');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [achForm, setAchForm] = useState({ title: '', description: '', year: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/api/auth/me').then(r => { setProfile(r.data); setForm(r.data); });
    api.get('/api/achievements').then(r => setAchievements(r.data));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const r = await api.put('/api/users/me', {
      full_name: form.full_name,
      phone: form.phone,
      bio: form.bio,
      current_company: form.current_company,
      current_position: form.current_position,
      location: form.location,
      linkedin: form.linkedin,
      program: form.program,
      graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
    });
    setProfile(r.data);
    setEditing(false);
    setMsg('Profile updated!');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleAddAch = async (e) => {
    e.preventDefault();
    const r = await api.post('/api/achievements', { ...achForm, year: achForm.year ? parseInt(achForm.year) : null });
    setAchievements([...achievements, r.data]);
    setAchForm({ title: '', description: '', year: '' });
  };

  const handleDeleteAch = async (id) => {
    await api.delete(`/api/achievements/${id}`);
    setAchievements(achievements.filter(a => a.id !== id));
  };

  if (!profile) return <div className={styles.empty}>Loading profile...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div><h1><User size={22} /> My Profile</h1><p>Manage your alumni profile and achievements</p></div>
      </div>
      {msg && <div className={styles.success}>{msg}</div>}

      <div className={styles.profileGrid}>
        {/* Sidebar */}
        <div className={styles.profileCard}>
          <div className={styles.profileAvatar}>{profile.full_name?.charAt(0).toUpperCase()}</div>
          <div className={styles.profileName}>{profile.full_name}</div>
          <span className={styles.profileRole}>{profile.role}</span>
          {profile.current_position && <div className={styles.profileDetail}>{profile.current_position}</div>}
          {profile.current_company && <div className={styles.profileDetail}>{profile.current_company}</div>}
          {profile.location && <div className={styles.profileDetail}>📍 {profile.location}</div>}
          {profile.program && <div className={styles.profileDetail}>🎓 {profile.program}{profile.graduation_year ? ` · ${profile.graduation_year}` : ''}</div>}
          {profile.bio && <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>{profile.bio}</p>}
          <div className={styles.profileActions}>
            <button className={styles.btnPrimary} onClick={() => { setEditing(!editing); setActiveTab('info'); }}>
              {editing ? 'Cancel Edit' : '✏️ Edit Profile'}
            </button>
          </div>
        </div>

        {/* Main */}
        <div>
          <div className={styles.tabs}>
            {[['info', '📋 Info'], ['achievements', '🏆 Achievements']].map(([id, label]) => (
              <button key={id} className={`${styles.tab} ${activeTab === id ? styles.activeTab : ''}`} onClick={() => setActiveTab(id)}>{label}</button>
            ))}
          </div>

          {activeTab === 'info' && (
            editing ? (
              <form onSubmit={handleSave} className={styles.form}>
                <div className={styles.grid2}>
                  <label>Full Name <input value={form.full_name || ''} onChange={e => setForm({...form, full_name: e.target.value})} /></label>
                  <label>Phone <input value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} /></label>
                  <label>Current Position <input value={form.current_position || ''} onChange={e => setForm({...form, current_position: e.target.value})} /></label>
                  <label>Current Company <input value={form.current_company || ''} onChange={e => setForm({...form, current_company: e.target.value})} /></label>
                  <label>Location <input value={form.location || ''} onChange={e => setForm({...form, location: e.target.value})} /></label>
                  <label>LinkedIn URL <input value={form.linkedin || ''} onChange={e => setForm({...form, linkedin: e.target.value})} /></label>
                  <label>Program <input value={form.program || ''} onChange={e => setForm({...form, program: e.target.value})} /></label>
                  <label>Graduation Year <input type="number" value={form.graduation_year || ''} onChange={e => setForm({...form, graduation_year: e.target.value})} /></label>
                </div>
                <label>Bio <textarea rows={3} value={form.bio || ''} onChange={e => setForm({...form, bio: e.target.value})} /></label>
                <div className={styles.formActions}>
                  <button type="submit" className={styles.btnPrimary}><Save size={15} /> Save Changes</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className={styles.grid2}>
                  {[
                    ['Email', profile.email],
                    ['Phone', profile.phone],
                    ['Position', profile.current_position],
                    ['Company', profile.current_company],
                    ['Location', profile.location],
                    ['Program', profile.program],
                    ['Graduation Year', profile.graduation_year],
                    ['LinkedIn', profile.linkedin],
                  ].map(([label, value]) => value ? (
                    <div key={label} className={styles.detailRow}>
                      <span className={styles.detailLabel}>{label}</span>
                      <span className={styles.detailValue}>{value}</span>
                    </div>
                  ) : null)}
                </div>
                {profile.bio && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Bio</span>
                    <span className={styles.detailValue}>{profile.bio}</span>
                  </div>
                )}
              </div>
            )
          )}

          {activeTab === 'achievements' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <form onSubmit={handleAddAch} className={styles.form} style={{ background: 'var(--bg)', padding: 14, borderRadius: 8 }}>
                <div className={styles.grid3}>
                  <label>Achievement Title * <input value={achForm.title} onChange={e => setAchForm({...achForm, title: e.target.value})} required /></label>
                  <label>Year <input type="number" value={achForm.year} onChange={e => setAchForm({...achForm, year: e.target.value})} placeholder="2024" /></label>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button type="submit" className={styles.btnPrimary} style={{ width: '100%' }}><Plus size={15} /> Add</button>
                  </div>
                </div>
                <label>Description <textarea rows={2} value={achForm.description} onChange={e => setAchForm({...achForm, description: e.target.value})} /></label>
              </form>

              {achievements.map(a => (
                <div key={a.id} className={styles.achievementItem}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}><Award size={14} style={{verticalAlign:'middle', marginRight:4}} />{a.title}</div>
                    {a.year && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.year}</div>}
                    {a.description && <div style={{ fontSize: 13, marginTop: 4 }}>{a.description}</div>}
                  </div>
                  <button className={styles.btnDanger} onClick={() => handleDeleteAch(a.id)}><Trash2 size={14} /></button>
                </div>
              ))}
              {achievements.length === 0 && <div className={styles.empty}><Award size={32} opacity={0.3} /><p>No achievements yet</p></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
