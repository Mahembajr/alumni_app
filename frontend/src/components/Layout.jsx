import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Briefcase, Calendar, Users2,
  Bell, MessageCircle, Award, FileText, Menu, X,
  LogOut, ChevronDown, GraduationCap, Settings
} from 'lucide-react';
import styles from './Layout.module.css';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/directory', icon: Users, label: 'Directory' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/clubs', icon: Users2, label: 'Clubs' },
  { to: '/announcements', icon: Bell, label: 'Bulletin Board' },
  { to: '/messages', icon: MessageCircle, label: 'Messages' },
  { to: '/certificates', icon: FileText, label: 'Certificates' },
];

const adminItems = [
  { to: '/admin', icon: Settings, label: 'Admin Panel' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const items = user?.role === 'admin' ? [...navItems, ...adminItems] : navItems;

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <GraduationCap size={28} />
          <span>SUZA Alumni</span>
        </div>
        <nav className={styles.nav}>
          {items.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`${styles.navItem} ${location.pathname === to ? styles.active : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className={styles.main}>
        <header className={styles.header}>
          <button className={styles.hamburger} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className={styles.headerRight}>
            <div className={styles.profileMenu} onClick={() => setProfileOpen(!profileOpen)}>
              <div className={styles.avatar}>
                {user?.full_name?.charAt(0).toUpperCase()}
              </div>
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>{user?.full_name}</span>
                <span className={styles.profileRole}>{user?.role}</span>
              </div>
              <ChevronDown size={16} />
              {profileOpen && (
                <div className={styles.dropdown}>
                  <Link to="/profile" className={styles.dropdownItem} onClick={() => setProfileOpen(false)}>
                    <Award size={15} /> My Profile
                  </Link>
                  <button className={styles.dropdownItem} onClick={handleLogout}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
