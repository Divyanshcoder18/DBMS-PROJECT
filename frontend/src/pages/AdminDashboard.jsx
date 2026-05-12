import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, MessageSquare, Star, RefreshCw, PlusCircle, FileText } from 'lucide-react';

const AdminDashboard = () => {
  const { user, API_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('complaints');
  const [complaints, setComplaints] = useState([]);
  const [feedbackData, setFeedbackData] = useState({ feedbacks: [], stats: [] });
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Editing state for complaints
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editComment, setEditComment] = useState('');

  // Form state for new Menu
  const [menuForm, setMenuForm] = useState({
    date: new Date().toISOString().split('T')[0],
    mealType: 'Breakfast',
    items: ''
  });

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, feedRes, menuRes] = await Promise.all([
        axios.get(`${API_URL}/complaints`, config),
        axios.get(`${API_URL}/feedback`, config),
        axios.get(`${API_URL}/menu`, config)
      ]);
      setComplaints(compRes.data);
      setFeedbackData(feedRes.data);
      setMenus(menuRes.data);
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
    } catch (err) { alert('Update failed.'); }
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/menu`, menuForm, config);
      alert('Menu updated successfully.');
      setMenuForm({ ...menuForm, items: '' });
      fetchData();
    } catch (err) { alert('Save menu failed.'); }
  };

  const stats = {
    pending: complaints.filter(c => c.status === 'Pending').length,
    progress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
  };

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h1>Admin Management Portal</h1>
        <button onClick={fetchData} className="glass" style={{ padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--border)', cursor: 'pointer' }}>
          <RefreshCw size={20} color="var(--text-muted)"/>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard icon={<Clock color="#f59e0b"/>} label="Pending" val={stats.pending} />
        <StatCard icon={<CheckCircle color="#10b981"/>} label="Resolved" val={stats.resolved} />
        <StatCard icon={<Star color="#a855f7"/>} label="Feedback Total" val={feedbackData.feedbacks.length} />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <TabButton active={activeTab === 'complaints'} label="Complaints" onClick={() => setActiveTab('complaints')} />
        <TabButton active={activeTab === 'menus'} label="Upload Menus" onClick={() => setActiveTab('menus')} />
        <TabButton active={activeTab === 'feedback'} label="Analytics" onClick={() => setActiveTab('feedback')} />
      </div>

      {loading ? <div>Refreshing dashboard datasets...</div> : (
        <div className="glass-card" style={{ transition: 'all 0.3s ease' }}>
          {activeTab === 'complaints' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Complaint Inbox</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {complaints.map(item => (
                  <div key={item._id} style={{ background: 'rgba(15,23,42,0.3)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700 }}>{item.title}</span>
                          <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: '#1e293b', color: '#94a3b8' }}>{item.category}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>By {item.user?.name} | {item.user?.hostelName || 'Hostel N/A'}</p>
                      </div>
                      <span className={`badge ${item.status === 'Pending' ? 'badge-pending' : item.status === 'In Progress' ? 'badge-progress' : 'badge-resolved'}`}>{item.status}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1rem' }}>{item.description}</p>
                    {editingId === item._id ? (
                      <div style={{ background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                          <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ height: 'fit-content' }}>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                          <input value={editComment} onChange={e => setEditComment(e.target.value)} placeholder="Comments..." />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleUpdateStatus(item._id)} className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>Update</button>
                          <button onClick={() => setEditingId(null)} className="btn" style={{ background: 'transparent', border: '1px solid var(--border)', color: '#fff', padding: '0.4rem 1rem' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                        <small style={{ color: 'var(--text-muted)' }}>{new Date(item.createdAt).toLocaleString()}</small>
                        <button onClick={() => {setEditingId(item._id); setEditStatus(item.status); setEditComment(item.adminComment || '');}} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'rgba(99,102,241,0.1)', border: '1px solid var(--primary)', color: 'var(--primary)' }}>Modify State</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'menus' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Upload Daily Mess Menu</h2>
              <form onSubmit={handleSaveMenu} style={{ background: 'rgba(15,23,42,0.3)', padding: '2rem', borderRadius: '0.75rem', maxWidth: '600px', marginBottom: '2rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Menu Date</label>
                    <input type="date" required value={menuForm.date} onChange={e => setMenuForm({...menuForm, date: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Meal Category</label>
                    <select required value={menuForm.mealType} onChange={e => setMenuForm({...menuForm, mealType: e.target.value})}>
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Dinner">Dinner</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Specific Items (Separate by commas)</label>
                  <textarea required rows={3} value={menuForm.items} onChange={e => setMenuForm({...menuForm, items: e.target.value})} placeholder="e.g., Paratha, Curd, Pickle, Milk"></textarea>
                </div>
                <button type="submit" className="btn btn-primary"><PlusCircle size={16} /> Publish Menu</button>
              </form>

              <h3>Posted Today</h3>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                {menus.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No menu published for selected date yet.</p> : menus.map(m => (
                  <div key={m._id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', flex: 1, border: '1px solid var(--border)' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>{m.mealType}</h4>
                    <p style={{ fontSize: '0.9rem' }}>{m.items}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'feedback' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ marginBottom: '2rem' }}>Meal Analytics</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                {feedbackData.stats.map(stat => (
                  <div key={stat._id} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '0.75rem', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{stat._id} Avg</span>
                    <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#eab308', marginTop: '0.5rem' }}>{stat.averageRating.toFixed(1)}</h3>
                    <small style={{ color: 'var(--text-muted)' }}>From {stat.count} ratings</small>
                  </div>
                ))}
              </div>

              <h3>Granular Feedback Log</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {feedbackData.feedbacks.map(fb => (
                  <div key={fb._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(15,23,42,0.2)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div>
                      <span style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.8rem' }}>[{fb.menu?.mealType || 'Meal'}] </span>
                      <span style={{ fontSize: '0.9rem' }}>{fb.comments || '(No text)'}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{fb.menu?.items} - Rated by {fb.user?.name}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#f59e0b', fontWeight: 'bold' }}>{fb.rating} <Star size={14} fill="#f59e0b" /></div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, val }) => (
  <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem', borderRadius: '0.5rem' }}>{icon}</div>
    <div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</p>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{val}</h3>
    </div>
  </div>
);

const TabButton = ({ active, label, onClick }) => (
  <button onClick={onClick} style={{
    background: 'transparent', border: 'none', paddingBottom: '0.75rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 600,
    color: active ? '#fff' : 'var(--text-muted)',
    borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
    transition: 'all 0.2s'
  }}>{label}</button>
);

export default AdminDashboard;
