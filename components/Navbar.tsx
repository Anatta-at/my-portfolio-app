'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { userId, isSignedIn, isLoaded } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  // ✅ เพิ่มใหม่: state สำหรับ Mobile Menu
  // ก่อน: ไม่มี state นี้เลย เมนูถูก hidden บน mobile โดยไม่มี hamburger
  // หลัง: ควบคุมการเปิด/ปิด mobile menu ได้
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (isSignedIn && userId) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const res = await fetch(`${apiUrl}/api/users/${userId}/role`);
          const data = await res.json();
          if (data.status === 'success' && data.role === 'admin') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    
    if (isLoaded) {
      checkAdmin();
    }
  }, [isSignedIn, userId, isLoaded]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#FAFAF8]/90 dark:bg-[#111110]/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-md bg-stone-900 dark:bg-stone-100 flex items-center justify-center text-white dark:text-stone-900 text-xs font-bold">
                IP
              </div>
              <span className="text-sm font-bold text-stone-800 dark:text-stone-200 tracking-tight">
                IntelliPort
              </span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-[13px] font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors">
              หน้าแรก
            </Link>
            <SignedIn>
              <Link href="/plan" className="text-[13px] font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors">
                วางแผนลงทุน
              </Link>
              <Link href="/dashboard" className="text-[13px] font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors">
                แดชบอร์ด
              </Link>
            </SignedIn>
            {isAdmin && (
              <Link href="/admin" className="text-[13px] font-bold text-red-600 dark:text-red-400 hover:text-red-700 transition-colors">
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <SignedOut>
              <Link href="/login">
                <button className="bg-amber-600 dark:bg-amber-600 text-white dark:text-white px-4 py-1.5 rounded-lg text-[13px] font-bold hover:bg-amber-700 dark:hover:bg-amber-700 transition-colors">
                  เข้าสู่ระบบ
                </button>
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 border border-stone-200 dark:border-stone-700"
                  }
                }}
              />
            </SignedIn>
            {/* ✅ เพิ่มใหม่: Hamburger Button สำหรับ Mobile */}
            {/* ก่อน: บน Mobile เห็นแค่ Logo กับปุ่ม Login ไม่มีทางเข้าหน้าอื่น */}
            {/* หลัง: มี hamburger button ที่ toggle mobile menu ได้ */}
            <button
              className="md:hidden p-1.5 rounded-md text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* ✅ Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 dark:border-stone-800 bg-[#FAFAF8]/95 dark:bg-[#111110]/95 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col space-y-1">
            <Link
              href="/"
              className="px-3 py-2 rounded-md text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              หน้าแรก
            </Link>
            <SignedIn>
              <Link
                href="/plan"
                className="px-3 py-2 rounded-md text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                วางแผนลงทุน
              </Link>
              <Link
                href="/dashboard"
                className="px-3 py-2 rounded-md text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                แดชบอร์ด
              </Link>
            </SignedIn>
            {isAdmin && (
              <Link
                href="/admin"
                className="px-3 py-2 rounded-md text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}