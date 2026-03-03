"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State สำหรับเก็บค่า
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log("🚀 กำลังส่งข้อมูลสมัครสมาชิก:", { username, email });

    try {
      // ✅ เชื่อมต่อกับ FastAPI Port 8000
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          username: username, 
          email: email, 
          password: password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ สมัครสำเร็จ:", data);
        alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
        router.push("/login"); // ✅ เมื่อสมัครเสร็จ ให้ไปหน้า Login เพื่อความปลอดภัย
      } else {
        // ✅ แสดงข้อความ Error จาก FastAPI เช่น "อีเมลนี้มีผู้ใช้งานแล้ว"
        console.error("❌ สมัครไม่สำเร็จ:", data.detail);
        alert(data.detail || "สมัครสมาชิกไม่สำเร็จ");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("⚠️ ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่ารัน Python (uvicorn) ทิ้งไว้หรือยัง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-500/30">
            <span className="text-white font-bold text-xl">IP</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">สร้างบัญชีผู้ใช้ใหม่</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อผู้ใช้งาน</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 text-slate-900 rounded-xl border border-slate-200 focus:ring-2 focus:ring-yellow-400 outline-none transition-all" 
              placeholder="ตั้งชื่อผู้ใช้งาน"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">อีเมล</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-slate-900 rounded-xl border border-slate-200 focus:ring-2 focus:ring-yellow-400 outline-none transition-all" 
              placeholder="name@example.com"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">รหัสผ่าน</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-slate-900 rounded-xl border border-slate-200 focus:ring-2 focus:ring-yellow-400 outline-none transition-all" 
                placeholder="••••••••"
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-blue-600"
              >
                {showPassword ? "ซ่อน" : "ดู"}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {isLoading ? "กำลังประมวลผล..." : "สมัครสมาชิก"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <p className="text-slate-500">มีบัญชีอยู่แล้ว? 
            <Link href="/login" className="ml-1 text-blue-600 font-bold hover:underline">เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </div>
  );
}