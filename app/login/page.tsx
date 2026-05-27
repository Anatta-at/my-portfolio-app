'use client';

import React from 'react';
import { SignIn } from "@clerk/nextjs";
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAF8] dark:bg-[#111110] font-sans">

      <div className="w-full max-w-sm mx-4">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-stone-900 dark:bg-stone-100 flex items-center justify-center text-white dark:text-stone-900 font-bold text-lg mb-4">
            IP
          </div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">เข้าสู่ระบบ</h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">IntelliPort — Smart Portfolio System</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#1A1A19] p-6 rounded-lg border border-stone-200 dark:border-stone-800 shadow-sm">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: "bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg",
                card: "shadow-none bg-transparent border-none p-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                footer: "hidden"
              }
            }}
            routing="hash"
            signUpUrl="/register" 
          />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-[11px] text-stone-400 uppercase tracking-widest font-medium">
            Project CS-01
          </p>
          <Link href="/admin" className="text-[11px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
            สำหรับผู้ดูแลระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}