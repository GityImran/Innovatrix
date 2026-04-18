import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContent}`}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>♺</span>
            Campus<span className={styles.logoAccent}>Circular</span>
          </div>
          <p className={styles.tagline}>
            Empowering the student community with sustainable resource sharing aligned with Mission LiFE.
          </p>
        </div>
        
        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>Platform</h4>
            <Link href="#">Marketplace</Link>
            <Link href="#">How it Works</Link>
            <Link href="#">Campus Partners</Link>
          </div>
          
          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>Company</h4>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </div>
      <div className={styles.copyright}>
        <p>&copy; {new Date().getFullYear()} Campus Circular. All rights reserved.</p>
      </div>
    </footer>
  );
}
