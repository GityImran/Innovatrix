import React from 'react';
import EcoLayout from '../components/EcoLayout/EcoLayout';
import AboutClient from './AboutClient';
import { calculateStats } from '../../lib/sustainability';
import { getProducts } from '../../lib/productStore';

export default async function AboutPage() {
  // Fetch stats on the server
  const products = getProducts();
  const stats = calculateStats(products);

  return (
    <EcoLayout 
      heroTitle="Circular Campus Exchange" 
      heroTagline="Redefining campus sustainability through reuse, data, and responsible action."
    >
      <AboutClient stats={stats} />
    </EcoLayout>
  );
}
