import React from 'react';
import styles from './ProblemStatement.module.css';

export default function ProblemStatement() {
  const problems = [
    {
      title: "Sustainable & Circular",
      desc: "Reduce campus waste while saving money. Give items a second life instead of letting them go to waste. Every transaction contributes to a more sustainable campus ecosystem.",
      icon: "♻️"
    },
    {
      title: "Verified Student Sellers",
      desc: "Buy directly from trusted students. No middlemen, no inflated prices — just genuine deals within your campus community.",
      icon: "🎓"
    },
    {
      title: "Secure On-Campus Exchange",
      desc: "Safe and convenient handovers. Meet at familiar campus locations like hostels or libraries — no shipping delays, no uncertainty.",
      icon: "📦"
    },
    {
      title: "Save More, Spend Smarter",
      desc: "Get what you need for a fraction of the price. From textbooks to electronics, find high-value deals without paying retail prices.",
      icon: "💸"
    }
  ];

  return (
    <section id="problem" className={`${styles.section} border-t border-white/10 mt-10 pt-10`}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Why Students Choose CampusMart</h2>
        </div>
        
        <div className={styles.grid}>
          {problems.map((prob, idx) => (
            <div key={idx} className={`${styles.card} hover:translate-y-[-4px] transition duration-200`}>
              <div className={styles.icon}>{prob.icon}</div>
              <h3 className={styles.cardTitle}>{prob.title}</h3>
              <p className={styles.cardDesc}>{prob.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
