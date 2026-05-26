"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import styles from './Header.module.css';

interface UserAuthDropdownProps {
  session: any;
}

export default function UserAuthDropdown({ session }: UserAuthDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    setIsOpen(!isOpen);
  };

  const handleSellItemClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);

    if (!session) {
      router.push("/login");
      return;
    }

    // Check seller status first
    try {
      const res = await fetch("/api/seller/register");
      const data = await res.json();

      if (data.status === "approved") {
        router.push("/seller");
      } else {
        router.push("/seller/register");
      }
    } catch (error) {
      router.push("/seller/register");
    }
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
              <button onClick={handleSellItemClick} className={styles.dropdownItem} style={{ width: '100%', textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 'inherit', font: 'inherit' }}>
                Sell Item
              </button>

              <button 
                onClick={() => signOut({ callbackUrl: "/" })} 
                className={styles.dropdownItem}
                style={{ width: '100%', textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 'inherit', font: 'inherit' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.dropdownItem} style={{ textAlign: 'center' }}>
                Login
              </Link>
              <Link href="/register" className={styles.dropdownItem} style={{ textAlign: 'center' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
