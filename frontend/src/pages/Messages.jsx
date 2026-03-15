import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Send, Search } from 'lucide-react';
import styles from './Page.module.css';

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [selected, setSelected] = useState(null);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/messages').then(r => setMessages(r.data));
    api.get('/api/users').then(r => setAlumni(r.data));
  }, []);

  const getConversation = () => {
    if (!selected) return [];
    return messages.filter(m =>
      (m.sender_id === user.id && m.receiver_id === selected.id) ||
      (m.receiver_id === user.id && m.sender_id === selected.id)
    ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    const r = await api.post('/api/messages', { receiver_id: selected.id, content: text });
    setMessages([...messages, r.data]);
    setText('');
  };

  const filteredAlumni = alumni.filter(a =>
    a.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div><h1><MessageCircle size={22} /> Messages</h1><p>Private messaging with alumni</p></div>
      </div>

      <div className={styles.messageContainer}>
        {/* Contact list */}
        <div className={styles.contactList}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
            <div className={styles.searchBar} style={{ boxShadow: 'none', border: '1.5px solid var(--border)' }}>
              <Search size={14} />
              <input placeholder="Search alumni..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          {filteredAlumni.filter(a => a.id !== user?.id).map(a => (
            <div
              key={a.id}
              className={`${styles.contactItem} ${selected?.id === a.id ? styles.selectedContact : ''}`}
              onClick={() => setSelected(a)}
            >
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                {a.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{a.full_name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.program || 'Alumni'}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat area */}
        <div className={styles.chatArea}>
          {selected ? (
            <>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {selected.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{selected.full_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selected.current_position || selected.program || 'Alumni'}</div>
                </div>
              </div>
              <div className={styles.chatMessages}>
                {getConversation().map(m => (
                  <div
                    key={m.id}
                    className={`${styles.chatMessage} ${m.sender_id === user?.id ? styles.chatMessageSent : styles.chatMessageReceived}`}
                  >
                    {m.content}
                    <div style={{ fontSize: 10, opacity: 0.7, marginTop: 3 }}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                {getConversation().length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 40 }}>
                    Start the conversation with {selected.full_name}
                  </div>
                )}
              </div>
              <form onSubmit={sendMessage} className={styles.chatInput}>
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Type a message..."
                />
                <button type="submit" className={styles.btnPrimary} style={{ padding: '8px 16px' }}>
                  <Send size={15} />
                </button>
              </form>
            </>
          ) : (
            <div className={styles.empty}>
              <MessageCircle size={48} opacity={0.2} />
              <p>Select a contact to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
