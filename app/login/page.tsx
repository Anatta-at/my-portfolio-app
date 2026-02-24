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
  const [isLoading, setIsLoading] = useState(false); // [ใหม่] เพิ่มสถานะกำลังโหลด

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // เริ่มหมุนติ้วๆ

    try {
      // 1. เชื่อมต่อ API
      const res = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // --- กรณีสำเร็จ---
        // บันทึก Token
        if (data.token) {
          localStorage.setItem('token', data.token);
          // อาจจะบันทึกข้อมูล user ลง state global หรือ localStorage ด้วยก็ได้
          if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
        }

        // ย้ายหน้า
        alert('✅ ยินดีต้อนรับเข้าสู่ระบบ!');
        router.push('/dashboard');
        
      } else {
        // --- กรณีไม่สำเร็จ (รหัสผิด / อีเมลไม่เจอ) ---
        alert('❌ ' + (data.detail || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'));
        setIsLoading(false); // หยุดหมุนเพื่อให้กรอกใหม่
      }
    } catch (error) {
      // --- กรณีเชื่อมต่อ Server ไม่ได้ ---
      console.error('Login Error:', error);
      alert('⚠️ ไม่สามารถเชื่อมต่อ Server ได้ กรุณาตรวจสอบว่า Docker รันอยู่หรือไม่');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white relative overflow-hidden font-sans">
      
      {/* --- Background Section --- */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

      {/* --- Card Section --- */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-600/20 transform -rotate-3">
              IP
            </div>
            <span className="text-3xl font-bold text-blue-950 tracking-tight">IntelliPort</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">ระบบจัดการพอร์ตการลงทุนอัจฉริยะ</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Input */}
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
                className="block w-full pl-11 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all bg-gray-50/50 outline-none text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="name@gmail.com"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-semibold text-gray-700">รหัสผ่าน</label>
              <a href="#" className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline">
                ลืมรหัสผ่าน?
              </a>
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
                className="block w-full pl-11 pr-11 py-3.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all bg-gray-50/50 outline-none text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>            </div>
          </div>

          {/* Submit Button */}
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

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-gray-500">
            ยังไม่มีบัญชีใช่ไหม?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-colors">
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