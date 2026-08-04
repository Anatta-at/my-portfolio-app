'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const { userId, getToken } = useAuth();
  const router = useRouter();

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'assets'>('users');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [assets, setAssets] = useState<any[]>([]);
  
  const [newAssetTicker, setNewAssetTicker] = useState('');
  const [newAssetMarketCap, setNewAssetMarketCap] = useState('');
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editMarketCap, setEditMarketCap] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const [usersRes, assetsRes] = await Promise.all([
        fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/assets`)
      ]);
      const usersData = await usersRes.json();
      const assetsData = await assetsRes.json();
      if (usersData.status === 'success') setUsers(usersData.data);
      if (assetsData.status === 'success') setAssets(assetsData.data);
    } catch (err) {
      console.error('Failed to fetch', err);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    const checkRole = async () => {
      if (!userId) {
        setIsLoading(false);
        setAccessDenied(true);
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/users/${userId}/role`);
        const data = await res.json();
        if (data.status === 'success' && data.role === 'admin') {
          setIsAdminAuthenticated(true);
          fetchAdminData();
        } else {
          setAccessDenied(true);
          setIsLoading(false);
        }
      } catch {
        setAccessDenied(true);
        setIsLoading(false);
      }
    };
    checkRole();
  }, [userId, fetchAdminData]);

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    if (!confirm(`ยืนยันการเปลี่ยนสิทธิ์เป็น ${newRole}?`)) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/users/${targetUserId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_role: newRole, admin_id: userId })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchAdminData();
      } else {
        alert(data.message || 'Failed to update role');
      }
    } catch {
      alert('Error updating role');
    }
  };

  const handleAddAsset = async () => {
    if (!newAssetTicker || !newAssetMarketCap) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: newAssetTicker.toUpperCase(), market_cap: parseInt(newAssetMarketCap), is_active: true })
      });
      const resJson = await res.json();
      if (resJson.status === 'success') {
        setNewAssetTicker('');
        setNewAssetMarketCap('');
        fetchAdminData();
      } else {
        alert('Failed to add asset: ' + resJson.message);
      }
    } catch { alert('Error adding asset'); }
  };

  const handleUpdateAsset = async (ticker: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/assets/${ticker}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, market_cap: parseInt(editMarketCap), is_active: editIsActive })
      });
      if ((await res.json()).status === 'success') {
        setEditingAsset(null);
        fetchAdminData();
      }
    } catch { alert('Error updating asset'); }
  };

  const handleDeleteAsset = async (ticker: string) => {
    if (!confirm(`ยืนยันการลบ ${ticker}?`)) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/assets/${ticker}`, { method: 'DELETE' });
      if ((await res.json()).status === 'success') fetchAdminData();
    } catch { alert('Error deleting asset'); }
  };

  const handleExitAdmin = () => {
    router.push('/dashboard');
  };


  if (isLoading && !isAdminAuthenticated) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] dark:bg-[#111110] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] dark:bg-[#111110] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Access Denied</h1>
            <p className="text-sm text-stone-500 mt-2">บัญชีของคุณไม่มีสิทธิ์เข้าถึงส่วนผู้ดูแลระบบ</p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="w-full py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-bold rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors">
            กลับหน้าหลัก
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] dark:bg-[#111110] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-stone-200 dark:border-stone-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight">Admin Console</h1>
            <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">จัดการข้อมูลระบบและตั้งค่า</p>
          </div>
          <button onClick={handleExitAdmin} className="px-4 py-2 border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-xs font-semibold rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
            ออกจากระบบ
          </button>
        </div>

        <div className="flex gap-6 border-b border-stone-200 dark:border-stone-800 mb-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'users' ? 'border-amber-500 text-amber-600 dark:text-amber-500' : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'}`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'assets' ? 'border-amber-500 text-amber-600 dark:text-amber-500' : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'}`}
          >
            Assets SET50
          </button>
        </div>

        {isLoading ? (
          <div className="text-sm text-stone-500 py-10 text-center">กำลังโหลดข้อมูล...</div>
        ) : (
          <div className="bg-white dark:bg-[#1A1A19] rounded-lg border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#FAFAF8] dark:bg-[#111110] border-b border-stone-200 dark:border-stone-800">
                      <th className="p-4 font-semibold text-stone-600 dark:text-stone-400">User Info</th>
                      <th className="p-4 font-semibold text-stone-600 dark:text-stone-400">Created At</th>
                      <th className="p-4 font-semibold text-stone-600 dark:text-stone-400">Last Login</th>
                      <th className="p-4 font-semibold text-stone-600 dark:text-stone-400 text-center">Portfolios</th>
                      <th className="p-4 font-semibold text-stone-600 dark:text-stone-400 text-center">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {users.length > 0 ? users.map((u, i) => (
                      <tr key={i} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {u.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={u.imageUrl} alt={u.fullName} className="w-9 h-9 rounded-full border border-stone-200 dark:border-stone-700 shadow-sm" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-500 text-xs font-bold shadow-sm">
                                {u.fullName?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-sm text-stone-900 dark:text-stone-100">{u.fullName || 'Unknown User'}</div>
                              <div className="text-xs text-stone-500 font-mono mt-0.5">{u.email || u.clerk_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-stone-500 dark:text-stone-400">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-stone-500 dark:text-stone-400">{new Date(u.last_login_at).toLocaleDateString()}</td>
                        <td className="p-4 text-center font-bold text-stone-900 dark:text-stone-100">{u.portfolio_count}</td>
                        <td className="p-4 text-center">
                          <select
                            value={u.role || 'user'}
                            onChange={(e) => handleRoleChange(u.clerk_id, e.target.value)}
                            disabled={u.clerk_id === userId}
                            className={`text-xs px-2 py-1 rounded border outline-none ${u.role === 'admin' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' : 'bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700'}`}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="p-8 text-center text-stone-500 text-sm">ไม่มีข้อมูล</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'assets' && (
              <div className="p-6">
                <div className="mb-6 flex flex-col sm:flex-row gap-3 p-4 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800">
                  <input type="text" placeholder="Ticker (e.g. ADVANC)" value={newAssetTicker} onChange={e => setNewAssetTicker(e.target.value)} className="px-3 py-2 text-sm border rounded bg-white dark:bg-stone-950 dark:border-stone-800 outline-none flex-1" />
                  <input type="number" placeholder="Market Cap" value={newAssetMarketCap} onChange={e => setNewAssetMarketCap(e.target.value)} className="px-3 py-2 text-sm border rounded bg-white dark:bg-stone-950 dark:border-stone-800 outline-none flex-1" />
                  <button onClick={handleAddAsset} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded text-sm font-bold transition-colors">Add Asset</button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#FAFAF8] dark:bg-[#111110] border-b border-stone-200 dark:border-stone-800">
                        <th className="p-4 font-semibold text-stone-600 dark:text-stone-400">Ticker</th>
                        <th className="p-4 font-semibold text-stone-600 dark:text-stone-400">Market Cap</th>
                        <th className="p-4 font-semibold text-stone-600 dark:text-stone-400 text-center">Status</th>
                        <th className="p-4 font-semibold text-stone-600 dark:text-stone-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {assets.map((asset: any, i) => (
                        <tr key={i} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                          <td className="p-4 font-bold text-stone-900 dark:text-stone-100">{asset.ticker}</td>
                          <td className="p-4 text-stone-600 dark:text-stone-400">
                            {editingAsset === asset.ticker ? (
                              <input type="number" value={editMarketCap} onChange={e => setEditMarketCap(e.target.value)} className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-stone-950 dark:border-stone-800 outline-none" />
                            ) : (
                              asset.market_cap.toLocaleString()
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {editingAsset === asset.ticker ? (
                              <input type="checkbox" checked={editIsActive} onChange={e => setEditIsActive(e.target.checked)} className="w-4 h-4 text-amber-500 bg-stone-100 border-stone-300 rounded focus:ring-amber-500" />
                            ) : (
                              <span className={`px-2 py-1 text-xs rounded ${asset.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500'}`}>
                                {asset.is_active ? 'Active' : 'Inactive'}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {editingAsset === asset.ticker ? (
                              <div className="flex justify-end gap-3">
                                <button onClick={() => handleUpdateAsset(asset.ticker)} className="text-green-600 hover:text-green-500 font-semibold text-xs bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">Save</button>
                                <button onClick={() => setEditingAsset(null)} className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 font-semibold text-xs bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded">Cancel</button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-3">
                                <button onClick={() => { setEditingAsset(asset.ticker); setEditMarketCap(asset.market_cap); setEditIsActive(asset.is_active); }} className="text-amber-500 hover:text-amber-600 font-semibold text-xs bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">Edit</button>
                                <button onClick={() => handleDeleteAsset(asset.ticker)} className="text-red-500 hover:text-red-600 font-semibold text-xs bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">Delete</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {assets.length === 0 && (
                        <tr><td colSpan={4} className="p-8 text-center text-stone-500 text-sm">ไม่มีข้อมูลสินทรัพย์</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
