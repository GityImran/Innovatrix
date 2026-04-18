import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import { auth } from '@/lib/auth';
import UserAuthDropdown from './UserAuthDropdown';
import SearchForm from './SearchForm';
import UnreadBadge from './UnreadBadge';

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
          <SearchForm
            selectClassName={styles.searchSelect}
            inputClassName={styles.searchInput}
            buttonClassName={styles.searchButton}
          />
        </div>

        <div className={styles.userActions}>
          <UserAuthDropdown session={session} />
          {session?.user && (
            <Link href="/chat" className={styles.messagesLink}>
              <span className={styles.actionLabel}>💬</span>
              <span className={styles.actionBold}>Messages</span>
              <UnreadBadge />
            </Link>
          )}
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
