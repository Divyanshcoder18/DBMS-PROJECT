import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, MessageSquare, Star, ChevronDown, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
  const { user, API_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('complaints');
  const [complaints, setComplaints] = useState([]);
  const [feedbackData, setFeedbackData] = useState({ feedbacks: [], stats: [] });
  const [loading, setLoading] = useState(true);
  
  // Selected complaint for modal / inline edit
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editComment, setEditComment] = useState('');

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, feedRes] = await Promise.all([
        axios.get(`${API_URL}/complaints`, config),
        axios.get(`${API_URL}/feedback`, config)
      ]);
      setComplaints(compRes.data);
      setFeedbackData(feedRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id) => {
    try {
      await axios.put(`${API_URL}/complaints/${id}`, {
        status: editStatus,
        adminComment: editComment
      }, config);
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert('Update failed.');
    }
  };

  const stats = {
    pending: complaints.filter(c => c.status === 'Pending').length,
    progress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
  };

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h1>Admin Command Center</h1>
        <button onClick={fetchData} className="glass" style={{ padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--border)', cursor: 'pointer' }}>
          <RefreshCw size={20} color="var(--text-muted)"/>
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard icon={<Clock color="#f59e0b"/>} label="Pending Cases" val={stats.pending} />
        <StatCard icon={<MessageSquare color="#3b82f6"/>} label="In Progress" val={stats.progress} />
        <StatCard icon={<CheckCircle color="#10b981"/>} label="Total Resolved" val={stats.resolved} />
        <StatCard icon={<Star color="#a855f7"/>} label="Total Feedback" val={feedbackData.feedbacks.length} />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => setActiveTab('complaints')} style={{ ...tabStyle, ...(activeTab === 'complaints' ? activeTabStyle : {}) }}>
          Manage Complaints
        </button>
        <button onClick={() => setActiveTab('feedback')} style={{ ...tabStyle, ...(activeTab === 'feedback' ? activeTabStyle : {}) }}>
          Feedback Analytics
        </button>
      </div>

      {loading ? <div>Loading admin datasets...</div> : (
        <div className="glass-card">
          {activeTab === 'complaints' ? (
            <div>
              <h2 style={{ marginBottom: '1.5rem' }}>Recent Student Submissions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {complaints.map(item => (
                  <div key={item._id} style={{ background: 'rgba(15,23,42,0.3)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700 }}>{item.title}</span>
                          <span style={{ fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px', background: '#1e293b', color: '#94a3b8' }}>{item.category}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          By: {item.user?.name} ({item.user?.hostelName || 'N/A'} - Room {item.user?.roomNumber || 'N/A'})
                        </p>
                      </div>
                      <div>
                        <span className={`badge ${item.status === 'Pending' ? 'badge-pending' : item.status === 'In Progress' ? 'badge-progress' : 'badge-resolved'}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1rem' }}>{item.description}</p>
                    
                    {editingId === item._id ? (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.75rem' }}>Update Status</label>
                            <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ padding: '0.5rem' }}>
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                          </div>
                          <div style={{ flex: 3 }}>
                            <label style={{ fontSize: '0.75rem' }}>Action Comments</label>
                            <input value={editComment} onChange={e => setEditComment(e.target.value)} style={{ padding: '0.5rem' }} placeholder="E.g. Maintenance team dispatched." />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => handleUpdateStatus(item._id)}>Save Changes</button>
                          <button onClick={() => setEditingId(null)} className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', background: 'transparent', border: '1px solid var(--border)', color: '#fff' }}>Cancel</button>
                        </div>
                      </motion.div>
                    ) : (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(item.createdAt).toLocaleString()}</span>
                        <button 
                          onClick={() => { setEditingId(item._id); setEditStatus(item.status); setEditComment(item.adminComment || ''); }}
                          className="btn" 
                          style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '0.4rem 0.8rem', fontSize: '0.85rem', border: '1px solid rgba(99,102,241,0.2)' }}
                        >
                          Act on Task
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {complaints.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No complaints queued.</p>}
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{ marginBottom: '1.5rem' }}>Meal Quality Aggregations</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {feedbackData.stats.map(stat => (
                  <div key={stat._id} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '0.75rem', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{stat._id}</h4>
                    <span style={{ fontSize: '1.75rem', fontWeight: 700, color: stat.averageRating >= 4 ? 'var(--secondary)' : stat.averageRating < 2.5 ? 'var(--accent)' : '#eab308' }}>
                      {stat.averageRating.toFixed(1)}
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{stat.count} reviews</p>
                  </div>
                ))}
              </div>

              <h3 style={{ marginBottom: '1rem' }}>Detailed Feedback Logs</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {feedbackData.feedbacks.map(fb => (
                  <div key={fb._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(15,23,42,0.2)', borderRadius: '0.5rem', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--primary)', marginRight: '0.5rem' }}>[{fb.mealType}]</span>
                      <span>{fb.comments || '(No written comments)'}</span>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>By {fb.user?.name || 'Unknown'}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontWeight: 700 }}>
                      {fb.rating} <Star size={14} fill="#f59e0b" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, val }) => (
  <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '0.5rem' }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</p>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{val}</h3>
    </div>
  </div>
);

const tabStyle = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-muted)',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  paddingBottom: '0.5rem',
  borderBottom: '2px solid transparent',
  transition: 'all 0.2s'
};

const activeTabStyle = {
  color: 'white',
  borderBottomColor: 'var(--primary)'
};

export default AdminDashboard;
