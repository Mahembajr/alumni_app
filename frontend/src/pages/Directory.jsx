import { useEffect, useState } from 'react';
import api from '../api';
import { Users, Search, MapPin, Briefcase, GraduationCap, MessageCircle } from 'lucide-react';
import styles from './Page.module.css';
import { Link } from 'react-router-dom';

export default function Directory() {
  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState('');
  const [program, setProgram] = useState('');

  const load = () => {
    const params = {};
    if (search) params.search = search;
    if (program) params.program = program;
    api.get('/api/users', { params }).then(r => setAlumni(r.data));
  };

  useEffect(() => { load(); }, [search, program]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1><Users size={22} /> Alumni Directory</h1>
          <p>Connect with SUZA graduates from all over the world</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div className={styles.searchBar} style={{ flex: 1, minWidth: 200 }}>
          <Search size={16} />
          <input placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <input
          className={styles.searchBar}
          style={{ minWidth: 200, flex: '0 0 220px' }}
          placeholder="Filter by program..."
          value={program}
          onChange={e => setProgram(e.target.value)}
        />
      </div>

      <div className={styles.count}>{alumni.length} alumni found</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {alumni.map(a => (
          <div key={a.id} className={styles.memberCard}>
            <div className={styles.memberAvatar}>{a.full_name.charAt(0).toUpperCase()}</div>
            <div className={styles.memberName}>{a.full_name}</div>
            {a.current_position && (
              <div className={styles.memberMeta}><Briefcase size={11} style={{verticalAlign:'middle'}} /> {a.current_position}</div>
            )}
            {a.current_company && (
              <div className={styles.memberMeta}>{a.current_company}</div>
            )}
            {a.program && (
              <div className={styles.memberMeta}><GraduationCap size={11} style={{verticalAlign:'middle'}} /> {a.program}{a.graduation_year ? ` '${String(a.graduation_year).slice(-2)}` : ''}</div>
            )}
            {a.location && (
              <div className={styles.memberMeta}><MapPin size={11} style={{verticalAlign:'middle'}} /> {a.location}</div>
            )}
            <Link to="/messages" className={styles.btnOutline} style={{ marginTop: 6, fontSize: 12, padding: '5px 12px' }}>
              <MessageCircle size={13} /> Message
            </Link>
          </div>
        ))}
      </div>

      {alumni.length === 0 && (
        <div className={styles.empty}>
          <Users size={40} opacity={0.3} />
          <p>No alumni found</p>
        </div>
      )}
    </div>
  );
}
