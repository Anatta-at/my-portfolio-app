"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthRedirectWatcher() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ถ้าโหลด Clerk เสร็จแล้ว และผู้ใช้ล็อกอินอยู่ แต่อยู่ที่หน้าแรกหรือหน้า Login
    // ให้ดีดไปหน้า Dashboard ทันที
    if (isLoaded && isSignedIn && (pathname === "/" || pathname === "/login" || pathname === "/register")) {
      router.push("/dashboard");
      router.refresh(); // บังคับให้หน้าเว็บดึงข้อมูลใหม่ (เหมือนกด F5)
    }
  }, [isSignedIn, isLoaded, pathname, router]);

  return null; // ส่วนประกอบนี้ไม่ต้องแสดงผลอะไรบนหน้าจอ
}