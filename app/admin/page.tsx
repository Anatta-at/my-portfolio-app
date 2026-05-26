'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Key, Users, Database } from 'lucide-react';

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const { userId } = useAuth();
  const router = useRouter();

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [activeTab, setActiveTab] = useState<'users' | 'assets'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [assets, setAssets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem('isAdmin') === 'true';
    setIsAdminAuthenticated(auth);
    if (auth) {
      fetchAdminData();
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin') {
      localStorage.setItem('isAdmin', 'true');
      setIsAdminAuthenticated(true);
      setPasswordError('');
      fetchAdminData();
      // Dispatch event to update navbar immediately
      window.dispatchEvent(new Event('admin-login'));
    } else {
      setPasswordError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleExitAdmin = () => {
    localStorage.removeItem('isAdmin');
    setIsAdminAuthenticated(false);
    setAdminPassword('');
    window.dispatchEvent(new Event('admin-logout'));
    router.push('/dashboard');
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, assetsRes] = await Promise.all([
        fetch('http://localhost:8000/api/admin/users'),
        fetch('http://localhost:8000/api/admin/assets')
      ]);

      const usersData = await usersRes.json();
      const assetsData = await assetsRes.json();

      if (usersData.status === 'success') {
        setUsers(usersData.data);
      }
      if (assetsData.status === 'success') {
        setAssets(assetsData.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setIsLoading(false);
    }
  };



  if (!isAdminAuthenticated) {
    return (
      <main className="min-h-screen bg-[#FFFEF5] dark:bg-slate-950 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] font-sans">
        <div className="max-w-md w-full p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-100/50 dark:border-slate-800">
          <div className="flex flex-col items-center mb-6">
            <span className="text-4xl mb-3 flex justify-center text-yellow-500"><Key className="w-12 h-12" /></span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">เข้าสู่ระบบผู้ดูแลระบบ (Admin)</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">กรุณากรอกรหัสผ่านผู้ดูแลระบบเพื่อเข้าถึงข้อมูล</p>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">รหัสผ่าน Admin</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-slate-800 dark:text-white dark:bg-slate-800/50"
                placeholder="ป้อนรหัสผ่าน..."
                required
              />
            </div>
            {passwordError && (
              <p className="text-red-500 text-xs font-semibold">{passwordError}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-bold rounded-xl transition-all shadow-md shadow-yellow-400/20"
            >
              ยืนยันรหัสผ่าน
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFEF5] dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">ระบบผู้ดูแลระบบ</h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">จัดการข้อมูลผู้ใช้งานและตั้งค่าพารามิเตอร์สินทรัพย์</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExitAdmin}
              className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold px-4 py-2 rounded-lg text-sm transition-all border border-red-200 dark:border-red-900/50"
            >
              ออกจากโหมด Admin
            </button>
            <div className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400 px-4 py-2 rounded-lg font-bold shadow-sm">
              Admin Mode
            </div>
          </div>
        </div>

        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 mb-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-6 font-bold text-lg border-b-4 transition-colors flex items-center gap-2 ${activeTab === 'users' ? 'border-yellow-400 text-yellow-600 dark:text-yellow-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            <Users className="w-5 h-5" /> ข้อมูลผู้ใช้งาน ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`py-3 px-6 font-bold text-lg border-b-4 transition-colors flex items-center gap-2 ${activeTab === 'assets' ? 'border-yellow-400 text-yellow-600 dark:text-yellow-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            <Database className="w-5 h-5" /> สินทรัพย์ SET50 ({assets.length})
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <svg className="animate-spin h-10 w-10 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-sm">
                      <th className="p-4 font-semibold">Clerk User ID</th>
                      <th className="p-4 font-semibold">สร้างบัญชีเมื่อ</th>
                      <th className="p-4 font-semibold">ล็อกอินล่าสุด</th>
                      <th className="p-4 font-semibold text-center">จำนวนแผนการลงทุน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? users.map((u, i) => (
                      <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="p-4 text-slate-800 dark:text-slate-200 font-mono text-sm">{u.clerk_id}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{new Date(u.created_at).toLocaleString('th-TH')}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{new Date(u.last_login_at).toLocaleString('th-TH')}</td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400 font-bold">
                            {u.portfolio_count}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">ไม่พบข้อมูลผู้ใช้งาน</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'assets' && (
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {assets.map((ticker, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-yellow-300 dark:hover:border-yellow-500 transition-colors">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{ticker}</span>
                      <span className="text-xs text-green-600 dark:text-green-400 font-semibold bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">Active</span>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">* ข้อมูลดึงมาจาก SET50 ล่าสุดโดยอัตโนมัติ น้ำหนักจำกัดสูงสุดถูกควบคุมไว้ใน Backend ไม่เกิน 25% ต่อตัว</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
