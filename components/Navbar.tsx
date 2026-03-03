// components/Navbar.tsx
import Link from 'next/link';
// 1. นำเข้า Components จาก Clerk
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* ส่วนโลโก้ด้านซ้าย */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                IP
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-blue-700 transition-colors">
                Intelli<span className="text-blue-600">Port</span>
              </span>
            </Link>
          </div>
          
          {/* เมนูตรงกลาง */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors relative group">
              หน้าแรก
              <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
            </Link>
            
            {/* แสดงเมนูเหล่านี้เฉพาะเมื่อล็อกอินแล้วเท่านั้น (ตัวเลือกเสริมเพื่อความปลอดภัย) */}
            <SignedIn>
              <Link href="/plan" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors relative group">
                วางแผนลงทุน
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors relative group">
                แดชบอร์ด
              </Link>
            </SignedIn>
          </div>

          {/* ส่วนของปุ่มด้านขวาที่ปรับปรุงใหม่ */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center text-sm font-medium text-slate-500">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              System Online
            </div>

            {/* 2. ถ้ายังไม่ล็อกอิน: แสดงปุ่มเข้าสู่ระบบ */}
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-md">
                  เข้าสู่ระบบ
                </button>
              </SignInButton>
            </SignedOut>

            {/* 3. ถ้าล็อกอินแล้ว: แสดงปุ่มจัดการโปรไฟล์ผู้ใช้ */}
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 border border-slate-200 shadow-sm"
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