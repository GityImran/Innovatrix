import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import UserAuthDropdown from './UserAuthDropdown';
import SearchForm from './SearchForm';
import UnreadBadge from './UnreadBadge';
import CartCount from './CartCount';

export default async function Header() {
  const session = await auth();

  let superCoins = 0;
  if (session?.user?.email) {
    try {
      await connectToDatabase();
      const user = await User.findOne({ email: session.user.email }).select('superCoins').lean() as { superCoins?: number } | null;
      if (user && typeof user.superCoins === 'number') {
        superCoins = user.superCoins;
      }
    } catch (err) {
      console.error('Error fetching superCoins:', err);
    }
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContent}`}>
        <div className={styles.logo}>
          <Link href="/">
            Campus<span className={styles.logoAccent}>Mart</span>
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
          <div className={styles.supercoinsChip}>
            <span>🪙</span>
            <span>CampusCoins</span>
            <span className={styles.supercoinsLabel}>{superCoins}</span>
          </div>

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
          <Link href="/cart" className={`${styles.actionItem} ${styles.cart}`}>
            <span className={styles.cartIcon}>🛒</span>
            <CartCount />
            <span className={styles.actionBold}>Cart</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
