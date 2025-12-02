// app/layout.tsx
import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

// 1. นำเข้า NextTopLoader
import NextTopLoader from 'nextjs-toploader';

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
    <html lang="th">
      <body className={prompt.className}>
        
        {/* 2. วางตัวสร้างเส้นโหลดไว้ตรงนี้ (บนสุดของ Body) */}
        <NextTopLoader 
          color="#2563eb"   // สีน้ำเงิน (ให้เข้ากับธีมเว็บ)
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}        // ความหนาของเส้น
          crawl={true}
          showSpinner={false} // ปิดวงกลมหมุนๆ (เอาแค่เส้นพอดูแพงกว่า)
          easing="ease"
          speed={200}
          shadow="0 0 10px #2563eb,0 0 5px #2563eb" // ใส่เงาให้เส้นดูเรืองแสงนิดๆ
        />

        <Navbar />
        <div className="pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}