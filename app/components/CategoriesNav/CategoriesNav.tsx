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
    { name: "Requests", href: "/requests" },
    { name: "Trading", href: "/trading" },
    { name: "Auction", href: "/auction" },
    { name: "Sustainability", href: "/sustainability" }
  ];

  return (
    <>
      <nav className={`${styles.subnav} ${styles.actionNav}`}>
        <div className={`container ${styles.navList} ${styles.spreadList}`}>
          {actions.map((action, idx) => (
            <Link key={idx} href={action.href} className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-yellow-400/40 hover:bg-white/10 transition-all duration-200 rounded-lg px-4 py-2 hover:scale-105 hover:shadow-[0_0_10px_rgba(255,180,0,0.3)] text-[0.95rem] font-semibold text-white text-decoration-none group">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/60 shadow-[0_0_5px_rgba(255,200,0,0.5)] group-hover:bg-yellow-400 group-hover:shadow-[0_0_8px_rgba(255,200,0,0.8)] transition-all duration-300"></span>
              {action.name}
            </Link>
          ))}
        </div>
      </nav>
      <nav className={styles.subnav}>
        <div className={`container ${styles.navList}`}>
          {categories.map((cat, idx) => (
            <Link key={idx} href="#" className={`${styles.navItem} ${idx === 0 || idx === categories.length - 1 ? styles.highlight : ''}`}>
              {cat}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
