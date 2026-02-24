// app/register/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // State สำหรับเก็บค่าที่พิมพ์ในฟอร์ม
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ฟังก์ชันจัดการเมื่อกดปุ่ม "สมัครสมาชิก"
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        alert("สมัครสมาชิกสำเร็จ! กำลังพาไปหน้า Dashboard...");
        router.push("/dashboard"); // เด้งไปหน้าหลักหลังจากสมัครสำเร็จ
      } else {
        alert("สมัครสมาชิกไม่สำเร็จ อาจมีชื่อหรืออีเมลนี้แล้ว");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลังบ้านได้ กรุณาตรวจสอบว่ารัน Backend หรือยัง");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden font-sans">
      
      {/* พื้นหลังตาราง Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
      
      {/* แสงวงกลม (Blobs) ประกอบฉาก */}
      <div className="absolute top-[10%] left-[10%] w-96 h-96 rounded-full bg-yellow-100/50 blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[10%] right-[10%] w-96 h-96 rounded-full bg-blue-50/50 blur-[100px] animate-pulse delay-1000"></div>

      {/* กล่อง Form สมัครสมาชิก */}
      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100">
        
        {/* หัวข้อ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-500/30">
            <span className="text-white font-bold text-xl">IP</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">สร้างบัญชีผู้ใช้ใหม่</h1>
          <p className="text-sm text-slate-500">ระบบจัดการพอร์ตการลงทุนอัจฉริยะ (CS-01)</p>
        </div>

        {/* ฟอร์มกรอกข้อมูล (เพิ่ม onSubmit) */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* ชื่อผู้ใช้งาน */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อผู้ใช้งาน (Username)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </span>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-slate-900 placeholder:text-slate-400 font-medium rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all outline-none" 
                placeholder="ตั้งชื่อผู้ใช้งานของคุณ"
                required 
              />
            </div>
          </div>

          {/* อีเมล */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">อีเมล (Email)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-slate-900 placeholder:text-slate-400 font-medium rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all outline-none" 
                placeholder="name@example.com"
                required 
              />
            </div>
          </div>

          {/* รหัสผ่าน */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">รหัสผ่าน (Password)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </span>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 text-slate-900 placeholder:text-slate-400 font-medium text-lg tracking-wider rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all outline-none" 
                placeholder="••••••••"
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* ปุ่ม สมัครสมาชิก */}
          <button 
            type="submit" 
            className="w-full flex justify-center items-center gap-2 py-3.5 mt-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-lg shadow-yellow-400/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            สมัครสมาชิก
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>

        </form>

        {/* ลิงก์กลับไปหน้า Login */}
        <div className="mt-8 text-center text-sm text-slate-600">
          มีบัญชีอยู่แล้วใช่ไหม?{" "}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            เข้าสู่ระบบ
          </Link>
        </div>

      </div>
    </div>
  );
}