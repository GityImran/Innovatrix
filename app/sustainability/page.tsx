"use client";

import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  TrendingUp,
  Wind,
  Recycle,
  Globe as GlobeIcon,
  AlertCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import styles from './Sustainability.module.css';
import { getProducts, Product } from '../../lib/productStore';
import { calculateStats, getSuggestions, SustainabilityStats, getCategoryImpact, CategoryImpact } from '../../lib/sustainability';
import { Trash2, ShoppingBag, Gift, BarChart2 } from 'lucide-react';

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const generateMockHistory = () => {
  const data = [];
  const start = new Date(2026, 2, 21); // Mar 21

  let cumulativeCO2 = 0;
  for (let i = 0; i <= 30; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    cumulativeCO2 += Math.random() * 5 + 1;
    data.push({
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      co2: Math.floor(cumulativeCO2)
    });
  }
  return data;
};

export default function SustainabilityPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<SustainabilityStats | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [categoryImpact, setCategoryImpact] = useState<CategoryImpact[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const allProducts = getProducts();
    setProducts(allProducts);
    setStats(calculateStats(allProducts));
    setSuggestions(getSuggestions(allProducts));
    setCategoryImpact(getCategoryImpact(allProducts));
  }, []);

  if (!isClient) return null;

  const pieData = [
    { name: 'Reused (sold)', value: products.filter(p => p.status === 'sold').length || 15 },
    { name: 'Donated', value: products.filter(p => p.expectedPrice === 0).length || 8 },
    { name: 'Unsold', value: products.filter(p => p.status === 'draft').length || 5 },
  ];

  const reusePercentage = products.length > 0 
    ? Math.round(((products.filter(p => p.status === 'sold').length) / products.length) * 100) 
    : 72;

  const lineData = generateMockHistory();
  const barData = categoryImpact.length > 0 ? categoryImpact : [
    { name: 'Clothes', co2Saved: 450 },
    { name: 'Electronics', co2Saved: 380 },
    { name: 'Books', co2Saved: 120 },
    { name: 'Other', co2Saved: 80 },
  ];

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>

        {/* Row 1: Title Section */}
        <div className={styles.heroText}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 className={styles.heroTitleBig} variants={fadeInUp}>
              Sustainability
            </motion.h1>
            <motion.div className={styles.heroTitleSub} variants={fadeInUp}>
              Dashboard
            </motion.div>
          </motion.div>
        </div>

        {/* Row 2: 3-GRAPH ROW */}
        <motion.div
          className={styles.heroChartsRow}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Chart 1: CATEGORY IMPACT (Bar Chart) */}
          <motion.div className={styles.inlineChart} variants={fadeInUp}>
            <div className={styles.chartLabel}>
              <BarChart2 color="#10b981" size={20} /> Category Impact
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="co2Saved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className={styles.insightText}>
              “Clothing reuse contributes the highest environmental benefit due to high turnover.”
            </div>
          </motion.div>

          {/* Chart 2: ITEM FLOW DISTRIBUTION (Pie Chart) */}
          <motion.div className={styles.inlineChart} variants={fadeInUp}>
            <div className={styles.chartLabel}>
              <Recycle color="#f59e0b" size={20} /> Item Flow Distribution
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f0f0f', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.insightText}>
              “{reusePercentage}% of listed items are successfully reused, reducing landfill dependency.”
            </div>
          </motion.div>

          {/* Chart 3: WASTE DIVERTED (Progress/Bar Graph) */}
          <motion.div className={styles.inlineChart} variants={fadeInUp}>
            <div className={styles.chartLabel}>
              <Trash2 color="#3b82f6" size={20} /> Waste Diverted
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px' }}>
              <div className={styles.wasteValue}>
                {stats?.wasteDiverted || 342}
              </div>
              <div className={styles.wasteLabel}>Items Prevented from Landfill</div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBar} style={{ width: '65%' }}></div>
              </div>
            </div>
            <div className={styles.insightText}>
              “Your campus has diverted {stats?.wasteDiverted || 342} items from potential waste streams.”
            </div>
          </motion.div>
        </motion.div>

        {/* Row 3: MAIN TREND CHART (Now moved below) */}
        <motion.div
           className={styles.heroMainChart}
           initial="hidden"
           animate="visible"
           variants={fadeInUp}
        >
          <div className={styles.chartLabel}>
            <Wind color="#10b981" size={20} /> CO₂ Avoidance Trend (Total Impact)
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Row 3: Stat Column Row (Bottom of Hero) */}
        <motion.div
          className={styles.bottomStatsRow}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div className={styles.statCard} variants={fadeInUp} whileHover={{ scale: 1.02 }}>
            <div className={styles.cardHeader}>
              <div className={styles.cardDot}></div>
              CO₂ Saved / Energy
            </div>
            <div className={styles.cardValue}>
              {(stats?.co2Saved || 2302.76).toFixed(2)}
            </div>
            <div style={{ color: '#22c55e', fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TrendingUp size={14} /> 3.65% <span style={{ color: '#64748b', marginLeft: '6px' }}>24hr change</span>
            </div>
          </motion.div>

          <motion.div className={styles.statCard} variants={fadeInUp} whileHover={{ scale: 1.02 }}>
            <div className={styles.cardHeader}>
              <div className={styles.cardDot}></div>
              Trees Preserved
            </div>
            <div className={styles.cardValue}>
              {stats?.treesSaved ? stats.treesSaved.toFixed(0) : '43k'}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Equivalent impact
            </div>
          </motion.div>

          <motion.div className={styles.statCard} variants={fadeInUp} whileHover={{ scale: 1.02 }}>
            <div className={styles.cardHeader}>
              <div className={styles.cardDot}></div>
              Items Diverted
            </div>
            <div className={styles.cardValue}>
              {stats?.wasteDiverted || '20k'}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Kept out of landfill
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Secondary Suggestions Area */}
      <section className={styles.dashboardContent}>
        <motion.h2 className={styles.sectionTitle} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
          <AlertCircle color="#f59e0b" size={24} /> Recommended Actions
        </motion.h2>

        <motion.div
          className={styles.suggestionsGrid}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
        >
          {suggestions.length > 0 ? suggestions.map((s, idx) => (
            <motion.div key={idx} className={styles.suggestionCard} variants={fadeInUp}>
              <div className={styles.suggestionTitle}>{s.title}</div>
              <div className={styles.suggestionMessage}>{s.message}</div>
              <Link href="/seller">
                <button className={styles.suggestionAction}>
                  {s.action} <ArrowRight size={16} />
                </button>
              </Link>
            </motion.div>
          )) : (
            <>
              <motion.div className={styles.suggestionCard} variants={fadeInUp}>
                <div className={styles.suggestionTitle}>Donate textbooks</div>
                <div className={styles.suggestionMessage}>Your old sem books can help someone in need. Consider donating if they don't sell!</div>
                <Link href="/seller">
                  <button className={styles.suggestionAction}>Donate Now <ArrowRight size={16} /></button>
                </Link>
              </motion.div>
              <motion.div className={styles.suggestionCard} variants={fadeInUp}>
                <div className={styles.suggestionTitle}>Recycle E-Waste</div>
                <div className={styles.suggestionMessage}>Broken headphones or old adaptors? Don't bin them. Recycle at the campus hub.</div>
                <Link href="/seller">
                  <button className={styles.suggestionAction}>Find Hub <ArrowRight size={16} /></button>
                </Link>
              </motion.div>
              <motion.div className={styles.suggestionCard} variants={fadeInUp}>
                <div className={styles.suggestionTitle}>Speed up sales</div>
                <div className={styles.suggestionMessage}>Items with a 10% price drop after 7 days are 3x more likely to be reused.</div>
                <Link href="/seller">
                  <button className={styles.suggestionAction}>Drop Price <ArrowRight size={16} /></button>
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>
      </section>
    </div>
  );
}
