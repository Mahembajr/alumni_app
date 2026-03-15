import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Briefcase, MapPin, Clock, DollarSign, Plus, Trash2, Search } from 'lucide-react';
import styles from './Page.module.css';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', company: '', location: '', description: '', requirements: '', salary: '', job_type: 'full-time', deadline: '' });
  const [msg, setMsg] = useState('');

  const load = () => api.get('/api/jobs').then(r => setJobs(r.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/api/jobs', { ...form, deadline: form.deadline || null });
    setShowForm(false);
    setForm({ title: '', company: '', location: '', description: '', requirements: '', salary: '', job_type: 'full-time', deadline: '' });
    setMsg('Job posted successfully!');
    load();
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this job?')) return;
    await api.delete(`/api/jobs/${id}`);
    load();
  };

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase()) ||
    (j.location || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1><Briefcase size={22} /> Job Board</h1>
          <p>Explore career opportunities within the SUZA alumni network</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'alumni') && (
          <button className={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Post a Job
          </button>
        )}
      </div>

      {msg && <div className={styles.success}>{msg}</div>}

      {showForm && (
        <div className={styles.formCard}>
          <h3>Post a New Job</h3>
          <form onSubmit={handleCreate} className={styles.form}>
            <div className={styles.grid2}>
              <label>Job Title * <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></label>
              <label>Company * <input value={form.company} onChange={e => setForm({...form, company: e.target.value})} required /></label>
              <label>Location <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></label>
              <label>Salary <input value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} placeholder="e.g. TZS 2,000,000" /></label>
              <label>Job Type
                <select value={form.job_type} onChange={e => setForm({...form, job_type: e.target.value})}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </label>
              <label>Application Deadline <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} /></label>
            </div>
            <label>Description
              <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </label>
            <label>Requirements
              <textarea rows={3} value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})} />
            </label>
            <div className={styles.formActions}>
              <button type="button" className={styles.btnSecondary} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className={styles.btnPrimary}>Post Job</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.searchBar}>
        <Search size={16} />
        <input placeholder="Search jobs, companies, locations..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className={styles.count}>{filtered.length} job{filtered.length !== 1 ? 's' : ''} found</div>

      <div className={styles.cardGrid}>
        {filtered.map(j => (
          <div key={j.id} className={styles.jobCard}>
            <div className={styles.jobCardHeader}>
              <div>
                <div className={styles.jobTitle}>{j.title}</div>
                <div className={styles.jobCompany}>{j.company}</div>
              </div>
              <span className={`${styles.badge} ${styles[j.job_type?.replace('-', '')]}`}>{j.job_type}</span>
            </div>
            <div className={styles.jobMeta}>
              {j.location && <span><MapPin size={13} /> {j.location}</span>}
              {j.salary && <span><DollarSign size={13} /> {j.salary}</span>}
              {j.deadline && <span><Clock size={13} /> Deadline: {new Date(j.deadline).toLocaleDateString()}</span>}
            </div>
            {j.description && <p className={styles.jobDesc}>{j.description}</p>}
            {j.requirements && (
              <div className={styles.requirements}>
                <strong>Requirements:</strong> {j.requirements}
              </div>
            )}
            <div className={styles.jobFooter}>
              <span className={styles.postedDate}>Posted {new Date(j.created_at).toLocaleDateString()}</span>
              {user?.role === 'admin' && (
                <button className={styles.btnDanger} onClick={() => handleDelete(j.id)}>
                  <Trash2 size={14} /> Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={styles.empty}>
          <Briefcase size={40} opacity={0.3} />
          <p>No jobs found</p>
        </div>
      )}
    </div>
  );
}
