// app/layout.tsx
import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import { ClerkProvider, ClerkLoaded } from '@clerk/nextjs';
import "./globals.css";
import Navbar from "@/components/Navbar";
import NextTopLoader from 'nextjs-toploader';
import AuthRedirectWatcher from "@/components/AuthRedirectWatcher";

// 1. กำหนดฟอนต์ Prompt สำหรับใช้ในโปรเจค (ตามที่ระบุในแผนงานพัฒนา UI) [cite: 115, 131]
const prompt = Prompt({ 
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-prompt",
});

// 2. กำหนด Metadata ของโครงงาน CS-01 [cite: 13, 14]
export const metadata: Metadata = {
  title: "IntelliPortfolio (CS-01)",
  description: "Investment Portfolio Management System using Genetic Algorithms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInForceRedirectUrl="/dashboard" 
      signUpForceRedirectUrl="/dashboard"
    >
      {/* 🌟 เพิ่ม suppressHydrationWarning ที่ html เพื่อป้องกัน Error จากระดับบนสุด */}
      <html lang="th" suppressHydrationWarning>
        {/* 🌟 เพิ่ม suppressHydrationWarning ที่ body เพื่อแก้ปัญหา attributes (เช่น inject_vt_svd) 
            ที่ถูกฉีดเข้ามาจาก Browser Extension โดยเฉพาะ ตามที่พบใน Error log */}
        <body className={prompt.className} suppressHydrationWarning>
          
          {/* ส่วนประกอบสำหรับจัดการการเปลี่ยนหน้าอัตโนมัติหลัง Log-in [cite: 86, 107] */}
          <AuthRedirectWatcher /> 

          {/* แถบโหลดด้านบนเพื่อความสวยงามและ User Experience ที่ดี [cite: 26] */}
          <NextTopLoader 
            color="#2563eb"   
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}       
            crawl={true}
            showSpinner={false} 
            easing="ease"
            speed={200}
            shadow="0 0 10px #2563eb,0 0 5px #2563eb" 
          />

          <Navbar />
          
          <div className="pt-16">
            {/* ตรวจสอบว่าระบบ Authentication พร้อมใช้งานก่อนแสดงเนื้อหา  */}
            <ClerkLoaded>
              {children}
            </ClerkLoaded>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}