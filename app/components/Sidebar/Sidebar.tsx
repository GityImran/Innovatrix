'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();
  
  // Only show sidebar on the landing page (or others if specified later)
  if (pathname !== '/') {
    return null;
  }

  const actions = [
    { name: "Requests", href: "/requests", icon: "📢", disabled: false },
    { name: "Trading",  href: "/trade",    icon: "🔁", disabled: false },
    { name: "Auction",  href: "/auctions", icon: "⚖️", disabled: false },
    { name: "Sustainability", href: "/sustainability", icon: "🌱", disabled: false }
  ];

  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.sidebarTitle}>Marketplace</h3>
      <div className={styles.navItems}>
        {actions.map((action, idx) => (
          action.disabled ? (
            <div key={idx} className={styles.navLink} style={{ cursor: 'not-allowed', opacity: 0.6 }}>
              <span className={styles.iconWrapper}>{action.icon}</span>
              <span className={styles.label}>{action.name}</span>
              <span className={styles.badge}>Soon</span>
            </div>
          ) : (
            <Link key={idx} href={action.href} className={styles.navLink}>
              <span className={styles.iconWrapper}>{action.icon}</span>
              <span className={styles.label}>{action.name}</span>
            </Link>
          )
        ))}
      </div>
    </aside>
  );
}
