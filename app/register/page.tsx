'use client';

import React from 'react';
import { SignUp } from "@clerk/nextjs";
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAF8] dark:bg-[#111110] font-sans">

      <div className="w-full max-w-sm mx-4">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-stone-900 dark:bg-stone-100 flex items-center justify-center text-white dark:text-stone-900 font-bold text-lg mb-4">
            IP
          </div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">สร้างบัญชีใหม่</h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">เข้าถึงระบบจัดการพอร์ตอัจฉริยะ</p>
        </div>

        {/* Card */}
        <div className="flex justify-center w-full">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: "bg-amber-600 hover:bg-amber-700 text-white font-bold",
                card: "shadow-sm border border-stone-200 dark:border-stone-800 rounded-lg dark:bg-[#1A1A19]",
                headerTitle: "text-stone-900 dark:text-stone-100 font-bold",
                headerSubtitle: "text-stone-500 dark:text-stone-400",
                socialButtonsBlockButton: "border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800",
                dividerLine: "bg-stone-200 dark:bg-stone-700",
                dividerText: "text-stone-500 dark:text-stone-400",
                formFieldLabel: "text-stone-700 dark:text-stone-300 font-semibold",
                formFieldInput: "bg-stone-50 dark:bg-[#111110] border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100",
                footerActionText: "text-stone-500 dark:text-stone-400",
                footerActionLink: "text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400",
              }
            }}
            routing="path"
            path="/register"
            signInUrl="/login"
            forceRedirectUrl="/dashboard"
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