import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, ClipboardList, Star, Calendar, Activity } from 'lucide-react';

const StudentDashboard = () => {
  const { user, API_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('my_complaints');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [complaintForm, setComplaintForm] = useState({ title: '', description: '', category: 'Mess' });
  const [feedbackForm, setFeedbackForm] = useState({ mealType: 'Breakfast', rating: 5, comments: '' });
  
  const [msg, setMsg] = useState(null);

  const config = {
    headers: { Authorization: `Bearer ${user.token}` }
  };

  const fetchComplaints = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/complaints/my`, config);
      setComplaints(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const submitComplaint = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/complaints`, complaintForm, config);
      setMsg({ type: 'success', text: 'Complaint registered successfully!' });
      setComplaintForm({ title: '', description: '', category: 'Mess' });
      fetchComplaints();
      setActiveTab('my_complaints');
    } catch (err) {
      setMsg({ type: 'error', text: 'Error submitting complaint.' });
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/feedback`, feedbackForm, config);
      setMsg({ type: 'success', text: 'Thank you for your feedback!' });
      setFeedbackForm({ mealType: 'Breakfast', rating: 5, comments: '' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Error submitting feedback.' });
    }
  };

  const getStatusBadge = (status) => {
    if(status === 'Pending') return 'badge-pending';
    if(status === 'In Progress') return 'badge-progress';
    return 'badge-resolved';
  };

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <p style={{ color: 'var(--text-muted)' }}>Student Dashboard</p>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Welcome, {user.name.split(' ')[0]} 👋</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Hostel / Room</span>
          <p style={{ fontWeight: 600 }}>{user.hostelName || 'N/A'} - {user.roomNumber || 'N/A'}</p>
        </div>
      </header>

      {msg && (
        <div style={{ 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          marginBottom: '2rem',
          background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
          color: msg.type === 'success' ? 'var(--secondary)' : 'var(--accent)',
          border: `1px solid ${msg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`
        }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto' }}>
        <TabButton active={activeTab === 'my_complaints'} onClick={() => setActiveTab('my_complaints')} icon={<ClipboardList size={18}/>} label="My Complaints" />
        <TabButton active={activeTab === 'lodge_complaint'} onClick={() => setActiveTab('lodge_complaint')} icon={<PlusCircle size={18}/>} label="File Complaint" />
        <TabButton active={activeTab === 'mess_feedback'} onClick={() => setActiveTab('mess_feedback')} icon={<Star size={18}/>} label="Mess Feedback" />
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'my_complaints' && (
            <motion.div key="my" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Recent Concerns</h2>
              {loading ? <div>Fetching history...</div> : complaints.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No complaints submitted yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {complaints.map(item => (
                    <div key={item._id} style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.title}</h4>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            <span className="glass" style={{ padding: '0.1rem 0.5rem', borderRadius: '4px' }}>{item.category}</span>
                            <span>• {new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className={`badge ${getStatusBadge(item.status)}`}>{item.status}</span>
                      </div>
                      <p style={{ fontSize: '0.95rem', color: '#cbd5e1', marginBottom: item.adminComment ? '1rem' : '0' }}>{item.description}</p>
                      {item.adminComment && (
                        <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '0.75rem', borderRadius: '0.5rem', borderLeft: '3px solid var(--primary)', fontSize: '0.875rem' }}>
                          <span style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Admin Response:</span>
                          {item.adminComment}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'lodge_complaint' && (
            <motion.div key="lodge" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 style={{ marginBottom: '1.5rem' }}>File A New Complaint</h2>
              <form onSubmit={submitComplaint} style={{ maxWidth: '600px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Title</label>
                    <input required value={complaintForm.title} onChange={e => setComplaintForm({...complaintForm, title: e.target.value})} placeholder="Brief summary of issue" />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={complaintForm.category} onChange={e => setComplaintForm({...complaintForm, category: e.target.value})}>
                      <option value="Mess">Mess</option>
                      <option value="Cleanliness">Cleanliness</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Security">Security</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Detailed Description</label>
                  <textarea required rows={5} value={complaintForm.description} onChange={e => setComplaintForm({...complaintForm, description: e.target.value})} placeholder="Please provide specific details here..."></textarea>
                </div>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </form>
            </motion.div>
          )}

          {activeTab === 'mess_feedback' && (
            <motion.div key="feedback" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Submit Daily Mess Feedback</h2>
              <form onSubmit={submitFeedback} style={{ maxWidth: '600px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Meal Type</label>
                    <select value={feedbackForm.mealType} onChange={e => setFeedbackForm({...feedbackForm, mealType: e.target.value})}>
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Dinner">Dinner</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Rating (1 to 5 Stars)</label>
                    <select value={feedbackForm.rating} onChange={e => setFeedbackForm({...feedbackForm, rating: Number(e.target.value)})}>
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Very Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Very Bad</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Comments / Suggestions</label>
                  <textarea rows={3} value={feedbackForm.comments} onChange={e => setFeedbackForm({...feedbackForm, comments: e.target.value})} placeholder="How was the quality, taste, and hygiene?"></textarea>
                </div>
                <button type="submit" className="btn" style={{ background: 'var(--secondary)', color: '#fff' }}>Submit Feedback</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap',
      background: active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
      color: active ? 'white' : 'var(--text-muted)',
      boxShadow: active ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
    }}
  >
    {icon} {label}
  </button>
);

export default StudentDashboard;
