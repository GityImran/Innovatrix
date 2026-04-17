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

  return (
    <nav className={styles.subnav}>
      <div className={`container ${styles.navList}`}>
        {categories.map((cat, idx) => (
          <Link key={idx} href="#" className={`${styles.navItem} ${idx === 0 || idx === categories.length - 1 ? styles.highlight : ''}`}>
            {cat}
          </Link>
        ))}
      </div>
    </nav>
  );
}
