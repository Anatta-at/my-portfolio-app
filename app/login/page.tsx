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

  // ✅ ฟังก์ชัน handleSubmit ที่ถูกต้อง (ไม่อันซ้อนกันแล้ว)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("1. เริ่มต้นกดปุ่ม Login"); 
    setIsLoading(true);

    try {
      console.log("2. กำลังส่งข้อมูลไปที่ Backend...");
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("3. Backend ตอบกลับมาแล้ว Status:", res.status);
      const data = await res.json();

      if (res.ok) {
        console.log("4. Login สำเร็จ!", data);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('✅ ยินดีต้อนรับเข้าสู่ระบบ!');
        router.push('/plan'); // ไปหน้าวางแผนลงทุน
      } else {
        console.log("4. Login ไม่สำเร็จ:", data.detail);
        alert('❌ ' + (data.detail || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'));
      }
    } catch (error) {
      console.error("❌ เกิด Error ตอนยิง API:", error);
      alert('⚠️ ไม่สามารถเชื่อมต่อ Server ได้ (ตรวจสอบว่ารัน Python ทิ้งไว้หรือยัง?)');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-700"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100">
        
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-600/20 transform -rotate-3">
              IP
            </div>
            <span className="text-3xl font-bold text-blue-950 tracking-tight">IntelliPort</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">ระบบจัดการพอร์ตการลงทุนอัจฉริยะ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">อีเมล</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                <Mail size={20} />
              </div>
              <input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all bg-gray-50/50 outline-none text-gray-800 placeholder-gray-400"
                placeholder="name@gmail.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-semibold text-gray-700">รหัสผ่าน</label>
              <Link href="#" className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline">
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-11 py-3.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all bg-gray-50/50 outline-none text-gray-800 placeholder-gray-400"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-bold py-4 px-4 rounded-xl shadow-lg shadow-yellow-400/20 transition-all transform 
              ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0'}
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
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">
              สมัครสมาชิกฟรี
            </Link>
          </p>
          <div className="pt-4 border-t border-gray-100">
             <span className="text-xs text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-full">Project CS-01: AI Powered Investment</span>
          </div>
        </div>
      </div>
    </div>
  );
}