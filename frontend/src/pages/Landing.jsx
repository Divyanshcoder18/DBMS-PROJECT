import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, MessageSquare, Star, Clock } from 'lucide-react';

const Landing = () => {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: '4rem' }}>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Smart Hostel Management
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          The modern hub for submitting complaints, tracking their resolution, and sharing valuable feedback on your mess experience.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
            Get Started
          </Link>
          <Link to="/login" className="glass" style={{ display: 'flex', alignItems: 'center', padding: '1rem 2rem', borderRadius: '0.5rem', fontWeight: 600 }}>
            Login Now
          </Link>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', width: '100%', marginTop: '6rem' }}>
        <FeatureCard 
          icon={<MessageSquare size={32} color="var(--primary)" />}
          title="Quick Complaints"
          desc="File issues instantly and classify by category for direct attention."
        />
        <FeatureCard 
          icon={<Clock size={32} color="#f59e0b" />}
          title="Live Tracking"
          desc="Stay informed on the state of your concerns in real-time."
        />
        <FeatureCard 
          icon={<Star size={32} color="#10b981" />}
          title="Mess Feedback"
          desc="Rate meals dynamically to contribute to higher dining standards."
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <motion.div 
    className="glass-card" 
    whileHover={{ y: -10 }}
    style={{ textAlign: 'left' }}
  >
    <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', width: 'fit-content', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
      {icon}
    </div>
    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{title}</h3>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{desc}</p>
  </motion.div>
);

export default Landing;
