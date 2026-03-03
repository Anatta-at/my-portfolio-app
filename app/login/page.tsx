'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  
  // State สำหรับเก็บข้อมูล
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State สำหรับ UI
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ป้องกันการกดรัวๆ หรือส่งค่าว่าง
    if (!email || !password) return;

    console.log("1. เริ่มต้นกดปุ่ม Login"); 
    setIsLoading(true);

    try {
      console.log("2. กำลังส่งข้อมูลไปที่ Backend...");
      // หมายเหตุ: ตรวจสอบว่า FastAPI รันที่ Port 8000 และมี @app.post("/login")
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("3. Backend ตอบกลับมาแล้ว Status:", res.status);

      if (res.ok) {
        console.log("4. Login สำเร็จ!", data);
        
        // เก็บข้อมูล User ลง LocalStorage (ระวัง: ข้อมูลสำคัญไม่ควรเก็บแบบ Plain Text ในโปรเจกต์จริง)
        localStorage.setItem('user', JSON.stringify(data.user || { email }));
        
        // แนะนำ: ใช้ Toast หรือ UI แทน Alert เพื่อความสวยงาม แต่ Alert ก็โอเคสำหรับการเริ่มทำครับ
        alert('✅ ยินดีต้อนรับเข้าสู่ระบบ!');
        router.push('/plan'); 
      } else {
        console.log("4. Login ไม่สำเร็จ:", data.detail);
        // แสดง Error จาก FastAPI (detail) ถ้าไม่มีให้ใช้ข้อความมาตรฐาน
        alert('❌ ' + (typeof data.detail === 'string' ? data.detail : 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'));
      }
    } catch (error) {
      console.error("❌ เกิด Error ตอนยิง API:", error);
      alert('⚠️ ไม่สามารถเชื่อมต่อ Server ได้ (กรุณาเช็คว่ารัน FastAPI และปลดบล็อก CORS หรือยัง?)');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white relative overflow-hidden font-sans">
      
      {/* Background Decor - ปรับความละมุนเล็กน้อย */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-pulse delay-700"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-100/50">
        
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-600/20 transform -rotate-3 hover:rotate-0 transition-transform cursor-default">
              IP
            </div>
            <span className="text-3xl font-bold text-blue-950 tracking-tight">IntelliPort</span>
          </div>
          <p className="text-gray-500 text-sm font-medium italic">Smart Portfolio Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">อีเมล</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all bg-gray-50/50 outline-none text-gray-800 placeholder-gray-400 font-medium"
                placeholder="example@email.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-bold text-gray-700">รหัสผ่าน</label>
              <Link href="#" className="text-xs text-blue-600 hover:text-blue-800 font-bold transition-colors">
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-11 py-3.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all bg-gray-50/50 outline-none text-gray-800 placeholder-gray-400 font-medium"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-bold py-4 px-4 rounded-xl shadow-lg shadow-yellow-400/30 transition-all active:scale-[0.98]
              ${isLoading ? 'opacity-70 cursor-wait' : ''}
            `}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                กำลังตรวจสอบ...
              </>
            ) : (
              <>
                เข้าสู่ระบบ
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-gray-500">
            ยังไม่มีบัญชีใช่ไหม?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-800 font-bold hover:underline">
              สมัครสมาชิกฟรี
            </Link>
          </p>
          <div className="pt-4 border-t border-gray-100/60">
             <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
               Project CS-01: AI Powered Investment
             </span>
          </div>
        </div>
      </div>
    </div>
  );
}