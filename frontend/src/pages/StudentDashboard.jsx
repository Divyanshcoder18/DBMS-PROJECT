import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, ClipboardList, Star, Ticket, QrCode, MapPin, Calendar } from 'lucide-react';

const StudentDashboard = () => {
  const { user, API_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('my_complaints');
  
  const [complaints, setComplaints] = useState([]);
  const [todaysMenu, setTodaysMenu] = useState([]);
  const [outpasses, setOutpasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [complaintForm, setComplaintForm] = useState({ title: '', description: '', category: 'Electricity' });
  const [feedbackForm, setFeedbackForm] = useState({ menuId: '', rating: 5, comments: '' });
  const [outpassForm, setOutpassForm] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    destination: '',
    reason: ''
  });
  
  const [msg, setMsg] = useState(null);

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchMyData = async () => {
    try {
      const [compRes, menuRes, outpassRes] = await Promise.all([
        axios.get(`${API_URL}/complaints/my`, config),
        axios.get(`${API_URL}/menu`, config),
        axios.get(`${API_URL}/outpass/my`, config)
      ]);
      setComplaints(compRes.data);
      setTodaysMenu(menuRes.data);
      setOutpasses(outpassRes.data);
      
      // Auto-select first available menu if feedback form isn't preset
      if (menuRes.data.length > 0) {
        setFeedbackForm(f => ({ ...f, menuId: menuRes.data[0]._id }));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMyData();
  }, []);

  const submitComplaint = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/complaints`, complaintForm, config);
      setMsg({ type: 'success', text: 'Logged successfully.' });
      setComplaintForm({ title: '', description: '', category: 'Electricity' });
      fetchMyData();
      setActiveTab('my_complaints');
    } catch (err) { setMsg({ type: 'error', text: 'Submit error.' }); }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackForm.menuId) {
       setMsg({ type: 'error', text: 'No menu item available to rate right now.' });
       return;
    }
    try {
      await axios.post(`${API_URL}/feedback`, feedbackForm, config);
      setMsg({ type: 'success', text: 'Feedback captured. Thank you!' });
      setFeedbackForm({ ...feedbackForm, comments: '' });
    } catch (err) { setMsg({ type: 'error', text: 'Failed to capture ratings.' }); }
  };

  const submitOutpass = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/outpass`, outpassForm, config);
      setMsg({ type: 'success', text: 'Outpass requested! Awaiting Admin approval.' });
      setOutpassForm({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        destination: '',
        reason: ''
      });
      fetchMyData();
    } catch (err) { setMsg({ type: 'error', text: 'Failed to submit outpass request.' }); }
  };

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
        <div>
          <p style={{ color: 'var(--text-muted)' }}>Welcome Back,</p>
          <h1 style={{ fontSize: '2rem' }}>{user.name}</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location</span>
          <p style={{ fontWeight: 600 }}>{user.hostelName || 'Unset'} / {user.roomNumber || 'N/A'}</p>
        </div>
      </header>

      {msg && (
        <div style={{ 
          padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem',
          background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
          color: msg.type === 'success' ? 'var(--secondary)' : 'var(--accent)',
          border: `1px solid ${msg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`
        }}>{msg.text}</div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <TabBtn active={activeTab === 'my_complaints'} onClick={() => setActiveTab('my_complaints')} ico={<ClipboardList size={18}/>} txt="History" />
        <TabBtn active={activeTab === 'lodge'} onClick={() => setActiveTab('lodge')} ico={<PlusCircle size={18}/>} txt="Lodge Issue" />
        <TabBtn active={activeTab === 'mess'} onClick={() => setActiveTab('mess')} ico={<Star size={18}/>} txt="Mess Rating" />
        <TabBtn active={activeTab === 'outpass'} onClick={() => setActiveTab('outpass')} ico={<Ticket size={18}/>} txt="Leave & QR Outpass" />
      </div>

      <div className="glass-card">
        <AnimatePresence mode="wait">
          {activeTab === 'my_complaints' && (
            <motion.div key="1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2>Your Tracked Issues</h2>
              {loading ? <p>Syncing...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                  {complaints.length === 0 ? <p style={{color:'var(--text-muted)'}}>No records found.</p> : complaints.map(c => (
                    <div key={c._id} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h4 style={{ fontWeight: 600 }}>{c.title}</h4>
                        <span className={`badge ${c.status === 'Pending' ? 'badge-pending' : c.status === 'In Progress' ? 'badge-progress' : 'badge-resolved'}`}>{c.status}</span>
                      </div>
                      <small style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Cat: {c.category} • Sent: {new Date(c.createdAt).toLocaleDateString()}</small>
                      <p style={{ fontSize: '0.95rem', color: '#cbd5e1' }}>{c.description}</p>
                      {c.adminComment && <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(99,102,241,0.05)', borderLeft: '2px solid var(--primary)', fontSize: '0.85rem' }}>Admin Note: {c.adminComment}</div>}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'lodge' && (
            <motion.div key="2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2>Log New Grievance</h2>
              <form onSubmit={submitComplaint} style={{ maxWidth: '500px', marginTop: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Main Title</label>
                    <input required value={complaintForm.title} onChange={e => setComplaintForm({...complaintForm, title: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Specific Category</label>
                    <select value={complaintForm.category} onChange={e => setComplaintForm({...complaintForm, category: e.target.value})}>
                      <option value="Electricity">Electricity</option>
                      <option value="Water">Water</option>
                      <option value="WiFi">WiFi</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Mess">Mess</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Breakdown Details</label>
                  <textarea rows={4} required value={complaintForm.description} onChange={e => setComplaintForm({...complaintForm, description: e.target.value})}></textarea>
                </div>
                <button className="btn btn-primary" type="submit">Lodge Official Request</button>
              </form>
            </motion.div>
          )}

          {activeTab === 'mess' && (
            <motion.div key="3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2>Rate Today's Food</h2>
              <div style={{ marginTop: '1.5rem' }}>
                {todaysMenu.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.1)', borderRadius: '0.5rem' }}>
                    No menu has been uploaded by management for today yet. Feedback window is closed.
                  </div>
                ) : (
                  <form onSubmit={submitFeedback} style={{ maxWidth: '500px' }}>
                    <div className="form-group">
                      <label>Select Menu to Rate</label>
                      <select value={feedbackForm.menuId} onChange={e => setFeedbackForm({...feedbackForm, menuId: e.target.value})}>
                        {todaysMenu.map(m => (
                          <option key={m._id} value={m._id}>{m.mealType}: {m.items.substring(0, 30)}...</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Numerical Score (1 to 5)</label>
                      <select value={feedbackForm.rating} onChange={e => setFeedbackForm({...feedbackForm, rating: Number(e.target.value)})}>
                        <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                        <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                        <option value="3">⭐⭐⭐ 3 Stars</option>
                        <option value="2">⭐⭐ 2 Stars</option>
                        <option value="1">⭐ 1 Star</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Taste / Hygiene Observation</label>
                      <textarea rows={3} value={feedbackForm.comments} onChange={e => setFeedbackForm({...feedbackForm, comments: e.target.value})} placeholder="Optional..."></textarea>
                    </div>
                    <button type="submit" className="btn" style={{ background: 'var(--secondary)', color: '#fff' }}>Fire Rating</button>
                  </form>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'outpass' && (
            <motion.div key="4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h2 style={{ marginBottom: '1.5rem' }}>Request Gate Outpass / Leave</h2>
                  <form onSubmit={submitOutpass} style={{ background: 'rgba(15,23,42,0.3)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Out Date</label>
                        <input type="date" required value={outpassForm.startDate} onChange={e => setOutpassForm({...outpassForm, startDate: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Return Date</label>
                        <input type="date" required value={outpassForm.endDate} onChange={e => setOutpassForm({...outpassForm, endDate: e.target.value})} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Destination</label>
                      <input required value={outpassForm.destination} onChange={e => setOutpassForm({...outpassForm, destination: e.target.value})} placeholder="e.g., Parents Home, Market" />
                    </div>
                    <div className="form-group">
                      <label>Reason</label>
                      <textarea rows={2} required value={outpassForm.reason} onChange={e => setOutpassForm({...outpassForm, reason: e.target.value})} placeholder="Detailed reason for leave..."></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                      <Ticket size={16} /> Submit Leave Request
                    </button>
                  </form>
                </div>

                <div>
                  <h2 style={{ marginBottom: '1.5rem' }}>Active Passes</h2>
                  {loading ? <p>Loading passes...</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '450px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {outpasses.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No active or pending leaves requested.</p>
                      ) : outpasses.map(op => (
                        <div key={op._id} style={{
                          background: op.status === 'Approved' ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(0,0,0,0.3))' : 'rgba(255,255,255,0.03)',
                          border: op.status === 'Approved' ? '1px solid var(--primary)' : '1px solid var(--border)',
                          borderRadius: '0.75rem', padding: '1.25rem', position: 'relative', overflow: 'hidden'
                        }}>
                          {op.status === 'Approved' && <div style={{ position: 'absolute', right: '-20px', top: '10px', background: '#10b981', padding: '0.2rem 1.5rem', transform: 'rotate(45deg)', fontSize: '0.65rem', fontWeight: 800, color: '#fff' }}>VALID</div>}
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{op.passCode}</span>
                            <span className={`badge ${op.status === 'Pending' ? 'badge-pending' : op.status === 'Approved' ? 'badge-resolved' : 'badge-progress'}`} style={{ background: op.status === 'Rejected' ? '#ef4444' : undefined }}>{op.status}</span>
                          </div>

                          {op.status === 'Approved' ? (
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', alignItems: 'center' }}>
                              <div style={{ background: '#fff', padding: '6px', borderRadius: '6px', flexShrink: 0 }}>
                                <img 
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&color=0f172a&data=${encodeURIComponent(`PASS:${op.passCode}|STUDENT:${user.name}`)}`} 
                                  alt="QR Code" 
                                  style={{ display: 'block', width: '90px', height: '90px' }} 
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', color: '#fff' }}>Digital Gate Pass</h4>
                                <p style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', margin: '0.2rem 0' }}><Calendar size={13}/> {new Date(op.startDate).toLocaleDateString()} to {new Date(op.endDate).toLocaleDateString()}</p>
                                <p style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', margin: 0 }}><MapPin size={13}/> {op.destination}</p>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <h4 style={{ fontSize: '0.95rem', margin: '0.25rem 0' }}>Destination: {op.destination}</h4>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{new Date(op.startDate).toLocaleDateString()} - {new Date(op.endDate).toLocaleDateString()}</p>
                              <small style={{ fontStyle: 'italic', display: 'block' }}>"{op.reason}"</small>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const TabBtn = ({ active, ico, txt, onClick }) => (
  <button onClick={onClick} style={{
    padding: '0.75rem 1.25rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s',
    background: active ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: active ? '#fff' : 'var(--text-muted)'
  }}>{ico}{txt}</button>
);

export default StudentDashboard;

