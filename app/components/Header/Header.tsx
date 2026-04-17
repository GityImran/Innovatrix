import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContent}`}>
        <div className={styles.logo}>
          <Link href="/">
            Campus<span className={styles.logoAccent}>Mart</span>
            <span className={styles.logoSub}>.edu</span>
          </Link>
        </div>
        
        <div className={styles.searchBar}>
          <select className={styles.searchSelect}>
            <option>All</option>
            <option>Textbooks</option>
            <option>Electronics</option>
          </select>
          <input type="text" className={styles.searchInput} placeholder="Search for textbooks, calculators, bikes..." />
          <button className={styles.searchButton}>
            🔍
          </button>
        </div>

        <div className={styles.userActions}>
          <div className={styles.actionItem}>
            <span className={styles.actionLabel}>Hello, Student</span>
            <span className={styles.actionBold}>Account & Lists</span>
          </div>
          <div className={styles.actionItem}>
            <span className={styles.actionLabel}>Returns</span>
            <span className={styles.actionBold}>& Orders</span>
          </div>
          <div className={`${styles.actionItem} ${styles.cart}`}>
            <span className={styles.cartIcon}>🛒</span>
            <span className={styles.cartCount}>0</span>
            <span className={styles.actionBold}>Cart</span>
          </div>
        </div>
      </div>
    </header>
  );
}
