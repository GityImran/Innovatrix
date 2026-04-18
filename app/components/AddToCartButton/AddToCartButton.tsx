"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
  itemId: string;
  itemModel: "Product" | "RentItem" | "Auction";
  className?: string;
  onSuccess?: () => void;
}

export default function AddToCartButton({ itemId, itemModel, className, onSuccess }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading || added) return;

    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, itemModel }),
      });

      if (res.status === 401) {
        // Redirect to login if unauthorized
        router.push('/login');
        return;
      }

      if (res.ok) {
        setAdded(true);
        if (onSuccess) onSuccess();
        
        // Dispatch custom event to update CartCount in header
        window.dispatchEvent(new Event('cartUpdated'));
        
        // Optionally refresh the page
        router.refresh();
        
        // Reset "added" state after 2 seconds
        setTimeout(() => setAdded(false), 2000);
      } else {
        const error = await res.json();
        console.error('Failed to add to cart:', error);
        alert(error.error || 'Failed to add to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleAddToCart} 
      disabled={loading || added}
      className={className}
    >
      {loading ? 'Adding...' : added ? 'Added ✓' : 'Add to Cart'}
    </button>
  );
}
