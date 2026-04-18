import React from 'react';
import EcoLayout from '../components/EcoLayout/EcoLayout';
import PrivacyClient from './PrivacyClient';

export default function PrivacyPage() {
  return (
    <EcoLayout 
      heroTitle="Privacy Policy" 
      heroTagline="Your trust is our priority. Learn how we handle your data with care."
    >
      <PrivacyClient />
    </EcoLayout>
  );
}
