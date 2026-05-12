import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    hostelName: '',
    roomNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(formData);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <motion.div 
        className="glass-card" 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ maxWidth: '500px', width: '100%' }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.75rem' }}>Create Account</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>Join the Smart Hostel system</p>
        
        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" type="text" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <select name="role" onChange={handleChange}>
                <option value="student">Student</option>
                <option value="admin">Admin/Staff</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" onChange={handleChange} required />
          </div>

          {formData.role === 'student' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
              <div className="form-group">
                <label>Hostel Name</label>
                <input name="hostelName" type="text" placeholder="e.g. Block A" onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Room Number</label>
                <input name="roomNumber" type="text" placeholder="e.g. 204" onChange={handleChange} />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register Now'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in instead</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
