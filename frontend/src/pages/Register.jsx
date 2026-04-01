import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap } from 'lucide-react';
import styles from './Auth.module.css';

const PROGRAMS = [
  'Computer Science', 'Information Technology', 'Business Administration',
  'Education', 'Marine Sciences', 'Environmental Studies', 'Law', 'Tourism',
  'Nursing', 'Medicine', 'Agriculture', 'Economics', 'Engineering', 'Other'
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', phone: '',
    graduation_year: '', program: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        ...form,
        graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${styles.wide}`}>
        <div className={styles.brandBar}>
          <GraduationCap size={36} />
          <h1>SUZA Alumni</h1>
          <p>Create your alumni account</p>
        </div>

        <div className={styles.formSection}>
          <h2>Join the Community</h2>
          <p className={styles.sub}>Register to connect with fellow SUZA graduates</p>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.grid2}>
              <label>
                Full Name *
                <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Amina Hassan" required />
              </label>
              <label>
                Email Address *
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" required />
              </label>
              <label>
                Password *
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" required minLength={6} />
              </label>
              <label>
                Phone Number
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+255 ..." />
              </label>
              <label>
                Program / Faculty
                <select value={form.program} onChange={e => setForm({...form, program: e.target.value})}>
                  <option value="">Select program...</option>
                  {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              <label>
                Graduation Year
                <select value={form.graduation_year} onChange={e => setForm({...form, graduation_year: e.target.value})}>
                  <option value="">Select year...</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </label>
            </div>

            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className={styles.switchText}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
