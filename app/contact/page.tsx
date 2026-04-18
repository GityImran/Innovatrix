import React from 'react';
import EcoLayout from '../components/EcoLayout/EcoLayout';
import ContactClient from './ContactClient';

export default function ContactPage() {
  return (
    <EcoLayout 
      heroTitle="Get in Touch" 
      heroTagline="Have questions, feedback, or suggestions? We’d love to hear from you."
    >
      <ContactClient />
    </EcoLayout>
  );
}
