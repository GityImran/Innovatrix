import React from 'react';
import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <div className={styles.carouselContainer}>
      <div className={`max-w-container ${styles.bannerWrapper}`}>
        <div className={styles.banner}>
          <div className={styles.bannerContent}>
            <Link href="/sustainability" className={styles.tagLink}>
              <span className={styles.tag}>Sustainability</span>
            </Link>
            <h1 className={styles.title}>Back to Campus Sale</h1>
            <p className={styles.desc}>Save up to 80% on pre-owned textbooks, lab equipments, and electronics.</p>
            <Link href="#shop" className={styles.shopBtn}>
              Shop Now
            </Link>
          </div>
          <div className={styles.gradientOverlay}></div>
        </div>
      </div>
    </div>
  );
}
