import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import { ClerkProvider, ClerkLoaded } from '@clerk/nextjs'; // เพิ่ม ClerkLoaded
import "./globals.css";
import Navbar from "@/components/Navbar";
import NextTopLoader from 'nextjs-toploader';
import AuthRedirectWatcher from "@/components/AuthRedirectWatcher"; // เดี๋ยวเราจะสร้างไฟล์นี้

const prompt = Prompt({ 
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "IntelliPortfolio (CS-01)",
  description: "Investment Portfolio Management System using GA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="th">
        <body className={prompt.className}>
          {/* ส่วนประกอบที่ช่วยเฝ้าดูสถานะการล็อกอินและเปลี่ยนหน้าให้อัตโนมัติ */}
          <AuthRedirectWatcher /> 

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
            <ClerkLoaded>
              {children}
            </ClerkLoaded>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}