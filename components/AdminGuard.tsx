'use client';

/**
 * AdminGuard.tsx
 * 
 * ✅ ตามที่อาจารย์สั่ง: Admin ใช้งานได้เฉพาะหน้า /admin เท่านั้น
 * - ถ้า user ที่ login อยู่เป็น admin → redirect ไป /admin ทันที (ยกเว้นตอนอยู่ที่ /admin แล้ว)
 * - ถ้าเป็น user ธรรมดา → ไม่ทำอะไร แสดงหน้าปกติ
 */

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminGuard() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;

    // หน้าที่ Admin เข้าได้ (ไม่ redirect)
    const adminAllowedPaths = ['/admin'];
    const isOnAdminPage = adminAllowedPaths.some(p => pathname.startsWith(p));

    // ถ้าอยู่บนหน้า admin อยู่แล้ว ไม่ต้องทำอะไร
    if (isOnAdminPage) return;

    const checkAndRedirectAdmin = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/users/${userId}/role`);
        if (!res.ok) return;
        const data = await res.json();

        // ถ้าเป็น admin และไม่อยู่บนหน้า admin → redirect ไป /admin
        if (data.status === 'success' && data.role === 'admin') {
          router.replace('/admin');
        }
      } catch {
        // ไม่ทำอะไรถ้า API error
      }
    };

    checkAndRedirectAdmin();
  }, [isLoaded, isSignedIn, userId, pathname, router]);

  return null; // Component นี้ไม่ render อะไร
}
