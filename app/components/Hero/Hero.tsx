'use client';

import React from 'react';
import Link from 'next/link';
import { slowScrollToId } from '@/lib/scroll';
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
            <Link 
              href="#shop" 
              onClick={(e) => slowScrollToId(e, 'shop')}
              className={styles.shopBtn}
            >
              Explore Marketplace
            </Link>
          </div>
          <div className={styles.gradientOverlay}></div>
        </div>
      </div>
    </div>
  );
}
