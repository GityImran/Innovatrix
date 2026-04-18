'use client';

import React from 'react';
import Link from 'next/link';
import styles from './CategoriesNav.module.css';

export default function CategoriesNav() {
  const categories = [
    "☰ All Categories",
    "Pre-owned Textbooks",
    "Lab Coats & Kits",
    "Calculators",
    "Hostel Furniture",
    "Bicycles",
    "Computers & Laptops",
    "Today's Deals"
  ];

  const actions = [
    { name: "Requests", href: "/requests", disabled: false },
    { name: "Trading",  href: "#",         disabled: true  },
    { name: "Auction",  href: "/auctions",  disabled: false },
    { name: "Sustainability", href: "/sustainability", disabled: false }
  ];

  return (
    <>
      <nav className={`${styles.subnav} ${styles.actionNav}`}>
        <div className={`container ${styles.navList} ${styles.spreadList}`}>
          {actions.map((action, idx) =>
            action.disabled ? (
              <span key={idx} className={styles.actionChipDisabled}>
                {action.name}
                <span className={styles.comingSoonBadge}>Soon</span>
              </span>
            ) : (
              <Link key={idx} href={action.href} className={styles.actionChip}>
                {action.name}
              </Link>
            )
          )}
        </div>
      </nav>
      <nav className={styles.subnav}>
        <div className={`container ${styles.navList}`}>
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              href="#"
              className={`${styles.navItem} ${idx === 0 || idx === categories.length - 1 ? styles.highlight : ''}`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

