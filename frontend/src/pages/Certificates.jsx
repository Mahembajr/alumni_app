import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus } from 'lucide-react';
import styles from './Page.module.css';

export default function Certificates() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ request_type: 'reissuance', reason: '' });
  const [msg, setMsg] = useState('');

  const load = () => api.get('/api/certificates').then(r => setRequests(r.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/api/certificates', form);
    setShowForm(false);
    setForm({ request_type: 'reissuance', reason: '' });
    setMsg('Request submitted successfully!');
    load();
    setTimeout(() => setMsg(''), 3000);
  };

  const handleStatusUpdate = async (id, status) => {
    await api.put(`/api/certificates/${id}?status=${status}`);
    load();
  };

  const statusClass = (s) => s === 'pending' ? styles.pending : s === 'approved' ? styles.approved : styles.rejected;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1><FileText size={22} /> Certificate Services</h1>
          <p>Request certificate reissuance or verification</p>
        </div>
        {user?.role === 'alumni' && (
          <button className={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> New Request
          </button>
        )}
      </div>

      {msg && <div className={styles.success}>{msg}</div>}

      {showForm && (
        <div className={styles.formCard}>
          <h3>Submit Certificate Request</h3>
          <form onSubmit={handleCreate} className={styles.form}>
            <label>Request Type
              <select value={form.request_type} onChange={e => setForm({...form, request_type: e.target.value})}>
                <option value="reissuance">Lost Certificate Reissuance</option>
                <option value="verification">Certificate Verification</option>
              </select>
            </label>
            <label>Reason / Details *
              <textarea rows={4} value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} required placeholder="Please provide details about your request..." />
            </label>
            <div className={styles.formActions}>
              <button type="button" className={styles.btnSecondary} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className={styles.btnPrimary}>Submit Request</button>
            </div>
          </form>
        </div>
      )}

      {user?.role === 'admin' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 12, fontSize: 13, color: 'var(--text-muted)' }}>
          Showing all certificate requests. Use the approve/reject buttons to manage them.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {requests.map(r => (
          <div key={r.id} className={styles.certCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, textTransform: 'capitalize' }}>
                  {r.request_type === 'reissuance' ? '📄 Lost Certificate Reissuance' : '✅ Certificate Verification'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Submitted {new Date(r.created_at).toLocaleDateString()}
                </div>
              </div>
              <span className={`${styles.certStatus} ${statusClass(r.status)}`}>
                {r.status}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r.reason}</p>
            {r.admin_note && (
              <div style={{ background: 'var(--bg)', padding: 10, borderRadius: 6, fontSize: 13 }}>
                <strong>Admin note:</strong> {r.admin_note}
              </div>
            )}
            {user?.role === 'admin' && r.status === 'pending' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className={styles.btnPrimary} onClick={() => handleStatusUpdate(r.id, 'approved')} style={{ fontSize: 13, padding: '6px 14px' }}>
                  ✅ Approve
                </button>
                <button className={styles.btnDanger} onClick={() => handleStatusUpdate(r.id, 'rejected')}>
                  ❌ Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {requests.length === 0 && (
        <div className={styles.empty}>
          <FileText size={40} opacity={0.3} />
          <p>No certificate requests</p>
        </div>
      )}
    </div>
  );
}
