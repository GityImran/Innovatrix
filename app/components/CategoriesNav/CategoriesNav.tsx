'use client';

import React from 'react';
import Link from 'next/link';
import { slowScrollToId } from '@/lib/scroll';
import styles from './CategoriesNav.module.css';

export default function CategoriesNav() {
  const categories = [
    "☰ All Categories",
    "Lab Equipment",
    "Electronics",
    "Hostel Supplies",
    "Furniture",
    "Books",
    "Others"
  ];

  return (
    <>
      <nav className={styles.subnav}>
        <div className={`container ${styles.navList}`}>
          {categories.map((cat, idx) => {
            const isAll = idx === 0;
            const targetId = isAll ? "shop" : `category-${cat.replace(/\s+/g, '-').toLowerCase()}`;
            return (
              <Link
                key={idx}
                href={`/#${targetId}`}
                onClick={(e) => slowScrollToId(e, targetId)}
                className={`${styles.navItem} ${idx === 0 || idx === categories.length - 1 ? styles.highlight : ''}`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

