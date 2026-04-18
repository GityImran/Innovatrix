"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  MapPin, 
  Send, 
  Handshake, 
  AlertCircle, 
  Lightbulb, 
  Leaf 
} from 'lucide-react';

export default function ContactClient() {
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [subject, setSubject] = useState('General Inquiry');
  const formRef = React.useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    setTimeout(() => setFormStatus('sent'), 1500);
  };

  const scrollToForm = (newSubject: string) => {
    setSubject(newSubject);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
      
      {/* Contact Info & Info Details */}
      <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
        <div className="glassCard">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            💬 Reach Out
          </h2>
          <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '2rem' }}>
            Whether it’s about sustainability, platform issues, or collaboration ideas—reach out anytime. 
            We typically respond within 24–48 hours.
          </p>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <ContactInfoItem 
              icon={<Mail size={20} color="#22c55e" />} 
              label="Email" 
              value="upasanamajumder994@gmail" 
            />
            <ContactInfoItem 
              icon={<Handshake size={20} color="#22c55e" />} 
              label="For Partnerships" 
              value="partners@circularcampus.com" 
            />
            <ContactInfoItem 
              icon={<MapPin size={20} color="#22c55e" />} 
              label="Location" 
              value="Campus-based initiative (your college name here)" 
            />
          </div>
        </div>

        <motion.div 
          className="glassCard" 
          style={{ borderLeft: '4px solid #3b82f6', marginTop: '2rem' }}
          whileHover={{ scale: 1.02 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Leaf color="#22c55e" size={24} />
            <h3 style={{ margin: 0 }}>Sustainability Note</h3>
          </div>
          <p style={{ fontSize: '0.95rem', color: '#e2e8f0', margin: 0 }}>
            Every suggestion helps us improve and build a more sustainable campus ecosystem. 
            Thank you for being part of the solution.
          </p>
        </motion.div>
      </motion.div>

      {/* Contact Form */}
      <motion.div 
        ref={formRef}
        initial="hidden" 
        animate="visible" 
        variants={fadeInUp} 
        transition={{ delay: 0.2 }}
      >
        <div className="glassCard">
          {formStatus === 'sent' ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{ background: 'rgba(34, 197, 94, 0.2)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Send color="#22c55e" size={32} />
              </div>
              <h2>Message Sent!</h2>
              <p style={{ color: '#94a3b8' }}>We'll get back to you shortly.</p>
              <button 
                onClick={() => setFormStatus('idle')}
                style={{ marginTop: '2rem', background: 'transparent', border: '1px solid #22c55e', color: '#22c55e', padding: '0.5rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Name</label>
                <input required type="text" style={inputStyle} placeholder="Your Name" />
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Email</label>
                <input required type="email" style={inputStyle} placeholder="your@email.com" />
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Subject</label>
                <select 
                  style={inputStyle} 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option style={{ color: 'black' }}>General Inquiry</option>
                  <option style={{ color: 'black' }}>Platform Support</option>
                  <option style={{ color: 'black' }}>Partnership</option>
                  <option style={{ color: 'black' }}>Feature Suggestion</option>
                  <option style={{ color: 'black' }}>Other</option>
                </select>
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Message</label>
                <textarea required rows={5} style={{ ...inputStyle, resize: 'none' }} placeholder="How can we help?"></textarea>
              </div>
              <button 
                type="submit" 
                disabled={formStatus === 'sending'}
                style={{ 
                  background: '#22c55e', 
                  color: '#052e16', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  fontWeight: 'bold', 
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'opacity 0.2s'
                }}
              >
                {formStatus === 'sending' ? 'Sending...' : <><Send size={18} /> Send Message</>}
              </button>
            </form>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
          <button 
            style={actionButtonStyle}
            onClick={() => scrollToForm('Platform Support')}
          >
            <AlertCircle size={18} /> Report an Issue
          </button>
          <button 
            style={actionButtonStyle}
            onClick={() => scrollToForm('Feature Suggestion')}
          >
            <Lightbulb size={18} /> Suggest a Feature
          </button>
        </div>
      </motion.div>

    </div>
  );
}

function ContactInfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <div style={{ marginTop: '0.25rem' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{label}</div>
        <div style={{ fontSize: '1rem', color: '#f8fafc', wordBreak: 'break-all' }}>{value}</div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '0.75rem 1rem',
  color: '#f8fafc',
  fontSize: '1rem',
  outline: 'none',
};

const actionButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '1rem',
  borderRadius: '16px',
  background: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#94a3b8',
  cursor: 'pointer',
  fontSize: '0.9rem',
  transition: 'all 0.2s',
};
