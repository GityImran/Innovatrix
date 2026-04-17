import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import { auth } from '@/lib/auth';

export default async function Header() {
  const session = await auth();

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
          <Link href={session ? "/dashboard" : "/login"} className={styles.actionItem} style={{ textDecoration: 'none' }}>
            <span className={styles.actionLabel}>
              {session ? `Hello, ${session.user?.name?.split(' ')[0]}` : "Hello, Sign in"}
            </span>
            <span className={styles.actionBold}>
              {session ? "Dashboard" : "Account & Lists"}
            </span>
          </Link>
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
