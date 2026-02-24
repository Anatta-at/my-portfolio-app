
import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

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
          {children}
        </div>
      </body>
    </html>
  );
}