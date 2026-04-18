import React from 'react';
import styles from './EcoLayout.module.css';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

interface EcoLayoutProps {
  children: React.ReactNode;
  heroTitle?: string;
  heroTagline?: string;
}

export default function EcoLayout({ children, heroTitle, heroTagline }: EcoLayoutProps) {
  return (
    <div className={styles.wrapper}>
      <Header />
      
      <main className={styles.main}>
        {/* Animated Background Layers */}
        <div className={styles.bgContainer}>
          <div className={styles.forestBg}></div>
          <div className={styles.overlay}></div>
          <div className={styles.floatingParticles}></div>
        </div>

        {/* Hero Section if text provided */}
        {heroTitle && (
          <div className={styles.heroSection}>
            <h1 className={styles.heroTitle}>{heroTitle}</h1>
            {heroTagline && <p className={styles.heroTagline}>{heroTagline}</p>}
          </div>
        )}

        <div className={styles.content}>
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
