import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, MessageSquare, Star, RefreshCw, PlusCircle, FileText, Map, LayoutDashboard, CalendarDays, Trash2, UserCheck, CheckSquare, XSquare } from 'lucide-react';

const AdminDashboard = () => {
  const { user, API_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [complaints, setComplaints] = useState([]);
  const [feedbackData, setFeedbackData] = useState({ feedbacks: [], stats: [] });
  const [menus, setMenus] = useState([]);
  
  // Expanded Data States
  const [outpasses, setOutpasses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
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
      const [compRes, feedRes, menuRes, outpassRes, analyticsRes] = await Promise.all([
        axios.get(`${API_URL}/complaints`, config),
        axios.get(`${API_URL}/feedback`, config),
        axios.get(`${API_URL}/menu`, config),
        axios.get(`${API_URL}/outpass`, config),
        axios.get(`${API_URL}/analytics/dashboard`, config)
      ]);
      setComplaints(compRes.data);
      setFeedbackData(feedRes.data);
      setMenus(menuRes.data);
      setOutpasses(outpassRes.data);
      setAnalytics(analyticsRes.data);
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

  const updateOutpass = async (id, status) => {
    try {
      await axios.put(`${API_URL}/outpass/${id}`, { status }, config);
      fetchData();
    } catch (err) { alert('Outpass update failed.'); }
  };

  const stats = {
    pending: complaints.filter(c => c.status === 'Pending').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    outpassPending: outpasses.filter(o => o.status === 'Pending').length,
  };

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Smart Command Center</h1>
          <p style={{ color: 'var(--text-muted)' }}>Live data-driven hostel monitoring platform</p>
        </div>
        <button onClick={fetchData} className="glass" style={{ padding: '0.6rem', borderRadius: '50%', border: '1px solid var(--border)', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}>
          <RefreshCw size={20} color="#fff"/>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard icon={<Clock color="#f59e0b"/>} label="Open Grievances" val={stats.pending} />
        <StatCard icon={<UserCheck color="#10b981"/>} label="Diners Forecast" val={analytics?.messForecast?.predictedHeadcount || 0} />
        <StatCard icon={<CalendarDays color="#6366f1"/>} label="Pending Leaves" val={stats.outpassPending} />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <TabButton active={activeTab === 'dashboard'} label="Real-time Insights" onClick={() => setActiveTab('dashboard')} />
        <TabButton active={activeTab === 'complaints'} label="Complaints" onClick={() => setActiveTab('complaints')} />
        <TabButton active={activeTab === 'outpass_approvals'} label="Gate Clearances" onClick={() => setActiveTab('outpass_approvals')} />
        <TabButton active={activeTab === 'menus'} label="Mess Uploads" onClick={() => setActiveTab('menus')} />
        <TabButton active={activeTab === 'feedback'} label="Food Analytics" onClick={() => setActiveTab('feedback')} />
      </div>

      {loading ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Syncing global database nodes...</div> : (
        <div className="glass-card" style={{ transition: 'all 0.3s ease' }}>
          
          {/* 📊 UNIFIED INSIGHTS DASHBOARD */}
          {activeTab === 'dashboard' && analytics && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ marginBottom: '1.5rem' }}>System Health & Occupancy</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                
                {/* 🏠 HEATMAP VIEW */}
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <Map size={20} color="var(--primary)" />
                    <h3 style={{ margin: 0 }}>Live Block Occupancy Heatmap</h3>
                  </div>
                  
                  {Object.keys(analytics.occupancy).length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', color: 'var(--text-muted)' }}>No resident allocations detected.</div>
                  ) : (
                    Object.entries(analytics.occupancy).map(([hostelName, rooms]) => (
                      <div key={hostelName} style={{ background: 'rgba(15,23,42,0.2)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
                        <h4 style={{ marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{hostelName} Block</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '0.75rem' }}>
                          {Object.entries(rooms).map(([roomNum, residents]) => (
                            <div key={roomNum} title={`Room ${roomNum}: ${residents.join(', ')}`} style={{
                              aspectRatio: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                              background: residents.length > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.05)',
                              border: `1.5px solid ${residents.length > 0 ? '#10b981' : '#ef4444'}`,
                              borderRadius: '0.5rem', transition: 'transform 0.2s', cursor: 'help'
                            }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{roomNum}</span>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{residents.length} Bed</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 🥗 AI MESS PREDICTION */}
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <Trash2 size={20} color="#fbbf24" />
                    <h3 style={{ margin: 0 }}>Food Waste Reduction</h3>
                  </div>
                  
                  <div style={{ background: 'linear-gradient(145deg, rgba(30,41,59,0.5), rgba(15,23,42,0.8))', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700 }}>Tomorrow's Forecaster</span>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Predicted Diners:</span>
                      <h4 style={{ fontSize: '1.5rem', margin: 0, color: '#fff' }}>{analytics.messForecast.predictedHeadcount} <small style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ {analytics.messForecast.totalCapacity}</small></h4>
                    </div>

                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                      <div style={{ height: '100%', background: 'var(--primary)', width: `${(analytics.messForecast.predictedHeadcount / Math.max(1, analytics.messForecast.totalCapacity)) * 100}%` }}></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                      <div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Estimated Saved</p>
                        <h4 style={{ color: '#10b981', margin: '0.25rem 0' }}>{analytics.messForecast.foodWasteSavedKg} KG</h4>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Efficiency Lift</p>
                        <h4 style={{ color: '#fbbf24', margin: '0.25rem 0' }}>+{analytics.messForecast.efficiencyGain}%</h4>
                      </div>
                    </div>
                  </div>

                  {/* Grievance KPIs */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '1rem', marginTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', margin: '0 0 1rem 0', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><FileText size={16}/> Issue Resolution Metric</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Avg Resolution:</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>~{analytics.complaintMetrics.avgResolutionTimeHours} hrs</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 📁 COMPLAINTS TAB */}
          {activeTab === 'complaints' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Complaint Inbox</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {complaints.length === 0 ? <p style={{color:'var(--text-muted)'}}>No grievances logged.</p> : complaints.map(item => (
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

          {/* 🎫 GATE CLEARANCE / OUTPASSES */}
          {activeTab === 'outpass_approvals' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Gate Clearances & Leaves</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem' }}>Student</th>
                      <th style={{ padding: '0.75rem' }}>Location</th>
                      <th style={{ padding: '0.75rem' }}>Dates</th>
                      <th style={{ padding: '0.75rem' }}>Destination</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                      <th style={{ padding: '0.75rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outpasses.length === 0 ? (
                      <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No leave records found in DB.</td></tr>
                    ) : outpasses.map(op => (
                      <tr key={op._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{op.user?.name || 'N/A'}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.8rem' }}>{op.user?.hostelName || 'N/A'} / R-{op.user?.roomNumber || 'N/A'}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.8rem' }}>{new Date(op.startDate).toLocaleDateString()} to {new Date(op.endDate).toLocaleDateString()}</td>
                        <td style={{ padding: '0.75rem' }}>{op.destination}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className={`badge ${op.status === 'Pending' ? 'badge-pending' : op.status === 'Approved' ? 'badge-resolved' : 'badge-progress'}`} style={{ background: op.status === 'Rejected' ? '#ef4444' : undefined }}>{op.status}</span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {op.status === 'Pending' && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button title="Approve" onClick={() => updateOutpass(op._id, 'Approved')} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}>
                                <CheckSquare size={16} color="#10b981"/>
                              </button>
                              <button title="Reject" onClick={() => updateOutpass(op._id, 'Rejected')} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}>
                                <XSquare size={16} color="#ef4444"/>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* 🥣 UPLOAD MENUS */}
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                {menus.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No menu published for selected date yet.</p> : menus.map(m => (
                  <div key={m._id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', minWidth: '200px', flex: 1, border: '1px solid var(--border)' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>{m.mealType}</h4>
                    <p style={{ fontSize: '0.9rem' }}>{m.items}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ⭐ FEEDBACK ANALYTICS */}
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
    whiteSpace: 'nowrap',
    color: active ? '#fff' : 'var(--text-muted)',
    borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
    transition: 'all 0.2s'
  }}>{label}</button>
);

export default AdminDashboard;

