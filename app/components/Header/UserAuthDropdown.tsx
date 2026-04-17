"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

interface UserAuthDropdownProps {
  session: any;
}

export default function UserAuthDropdown({ session }: UserAuthDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDropdownClick = () => {
    // If we have a session, we can still show a dropdown (e.g. for Logout/Profile)
    // Or just let it navigate to dashboard. Let's make it so clicking the whole thing 
    // opens the menu regardless.
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.dropdownWrapper} ref={dropdownRef}>
      <div 
        className={styles.actionItem} 
        style={{ textDecoration: 'none' }}
        onClick={handleDropdownClick}
      >
        <span className={styles.actionLabel}>
          {session ? `Hello ${session.user?.name?.split(' ')[0]}, ` : "Hello, Sign in"}
        </span>
        <span className={styles.actionBold}>
          {session ? "Dashboard" : "Account & Lists"}
        </span>
      </div>

      {isOpen && (
        <div className={styles.dropdownMenu} onClick={() => setIsOpen(false)}>
          {session ? (
            <>
              <Link href="/seller" className={styles.dropdownItem}>
                Sell Item
              </Link>
              <Link href="/rent" className={styles.dropdownItem}>
                Rent Item
              </Link>
              <Link href="/api/auth/signout" className={styles.dropdownItem}>
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.dropdownItem}>
                Login
              </Link>
              <Link href="/register" className={styles.dropdownItem}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
