'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const { userId, isSignedIn, isLoaded } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

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
          </div>

        </div>
      </div>
    </nav>
  );
}