import React from 'react';
import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <div className={styles.carouselContainer}>
      <div className={`max-w-container ${styles.bannerWrapper}`}>
        <div className={styles.banner}>
          <div className={styles.bannerContent}>
            <span className="text-yellow-400 font-semibold uppercase tracking-wider text-sm md:text-base mb-2 block">Campus Marketplace for Students</span>
            <h1 className={styles.title}>Buy, Sell, Trade — Smarter</h1>
            <p className={styles.desc}>Save money, reduce waste, and find everything you need from your own campus community.</p>
            <Link href="#shop" className={`${styles.shopBtn} bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-md hover:shadow-yellow-400/30 transition-all duration-200`}>
              Explore Marketplace
            </Link>
          </div>
          <div className={styles.gradientOverlay}></div>
        </div>
      </div>
    </div>
  );
}
