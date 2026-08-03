'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

export default function UserSync() {
  const { user, isLoaded, isSignedIn } = useUser();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && user && !hasSynced.current) {
      const syncUser = async () => {
        try {
          const email = user.primaryEmailAddress?.emailAddress || '';
          const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || null;
          
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/users/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clerk_id: user.id,
              email: email,
              full_name: fullName,
            }),
          });
          
          hasSynced.current = true;
        } catch (error) {
          console.error("Error syncing user data:", error);
        }
      };

      syncUser();
    }
  }, [isLoaded, isSignedIn, user]);

  return null; // This component doesn't render anything
}
