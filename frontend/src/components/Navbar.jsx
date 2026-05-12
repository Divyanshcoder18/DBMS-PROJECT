import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Settings, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'var(--bg-nav)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border)',
      padding: '1rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.25rem', color: 'white' }}>
        <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.5rem' }}>🏠</div>
        HostelFlow
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <User size={18} />
              <span>{user.name}</span>
              <span className={`badge ${user.role === 'admin' ? 'badge-progress' : 'badge-resolved'}`} style={{ marginLeft: '0.5rem' }}>
                {user.role}
              </span>
            </div>
            <button onClick={handleLogout} style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-main)',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}>
              <LogOut size={16} /> Sign Out
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" style={{ color: 'var(--text-main)' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
