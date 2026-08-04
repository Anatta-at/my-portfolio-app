'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, ChevronLeft, ChevronRight, MoreHorizontal, ArrowRight, Trash2, TriangleAlert, X } from 'lucide-react';

export default function HistoryPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Table State
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded || !userId) {
      if (isLoaded && !userId) setIsLoading(false);
      return;
    }

    async function fetchHistory() {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/portfolios?clerk_id=${userId}`);
        if (!res.ok) throw new Error('ไม่สามารถเชื่อมต่อระบบประวัติพอร์ตลงทุนได้');
        const data = await res.json();
        
        if (data.status === 'success') {
          setPortfolios(data.portfolios || []);
        } else {
          setError(data.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลประวัติ');
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        } else {
          setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [userId, isLoaded]);

  // Filtering and Pagination Logic
  const filteredData = useMemo(() => {
    return portfolios.filter(p => 
      p.name.toLowerCase().includes(globalFilter.toLowerCase())
    );
  }, [portfolios, globalFilter]);

  const pageCount = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setPageIndex(0);
    setSelectedIds(new Set()); // Reset selection too
  }, [globalFilter, pageSize]);

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length && paginatedData.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map(p => p.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const confirmDelete = async () => {
    if (selectedIds.size === 0) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/portfolios/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio_ids: Array.from(selectedIds), clerk_id: userId })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setSelectedIds(new Set());
        setPortfolios(prev => prev.filter(p => !selectedIds.has(p.id)));
        setIsDeleteDialogOpen(false);
      } else {
        alert(data.message || 'ลบข้อมูลไม่สำเร็จ');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] dark:bg-[#111110]">
        <div className="text-center text-stone-500 dark:text-stone-400 text-sm">
          กำลังโหลดข้อมูล...
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] dark:bg-[#111110] px-4">
        <div className="max-w-sm w-full bg-white dark:bg-[#1A1A19] p-8 rounded-lg border border-stone-200 dark:border-stone-800 text-center">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">เข้าสู่ระบบ</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">คุณต้องเข้าสู่ระบบเพื่อดูพอร์ตการลงทุน</p>
          <Link href="/login" className="inline-block w-full bg-amber-600 dark:bg-amber-600 hover:bg-amber-700 dark:hover:bg-amber-700 text-white dark:text-white font-bold py-2.5 rounded-lg text-sm transition-colors">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  const getRiskLabel = (beta: number) => {
    if (beta < 0.9) return { label: 'ความเสี่ยงต่ำ', class: 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20' };
    if (beta > 1.1) return { label: 'ความเสี่ยงสูง', class: 'bg-rose-500/15 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-500/20' };
    return { label: 'ความเสี่ยงปานกลาง', class: 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-500/20' };
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8] dark:bg-[#111110] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6">
        <div>
          <h1 className="text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight">แดชบอร์ด</h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">ประวัติพอร์ตการลงทุนของคุณ</p>
        </div>
        <Link href="/plan" className="inline-flex items-center justify-center px-5 py-2.5 bg-amber-600 dark:bg-amber-600 text-white dark:text-white font-bold rounded-lg hover:bg-amber-700 dark:hover:bg-amber-700 transition-colors text-sm shadow-sm">
          <Plus className="w-4 h-4 mr-1.5" /> สร้างพอร์ตใหม่
        </Link>
      </div>

      <div className="max-w-5xl mx-auto">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {portfolios.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-stone-300 dark:border-stone-700 rounded-lg">
            <p className="text-stone-500 dark:text-stone-400 mb-4 text-sm">คุณยังไม่มีประวัติพอร์ตการลงทุน</p>
            <Link href="/plan" className="inline-flex items-center text-sm font-semibold text-stone-900 dark:text-stone-100 hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
              เริ่มต้นสร้างพอร์ตแรก <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        ) : (
          <div className="w-full space-y-4">
            
            {/* Top Bar: Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-stone-500 dark:text-stone-400">แสดง</span>
                <select 
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-9 w-16 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A19] px-2 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500 transition-shadow"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
                <span className="text-sm text-stone-500 dark:text-stone-400">รายการ</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                {selectedIds.size > 0 && (
                  <button 
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={isDeleting}
                    className="h-9 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-md text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" /> ลบ ({selectedIds.size})
                  </button>
                )}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อพอร์ต..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="h-9 w-full rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A19] px-3 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500 transition-shadow"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A19] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 font-medium">
                    <tr>
                      <th className="h-12 px-4 align-middle w-12 text-center">
                        <input 
                          type="checkbox" 
                          checked={paginatedData.length > 0 && selectedIds.size === paginatedData.length}
                          onChange={toggleSelectAll}
                          className="rounded border-stone-300 dark:border-stone-700 text-amber-600 focus:ring-amber-500 cursor-pointer" 
                        />
                      </th>
                      <th className="h-12 px-4 align-middle font-medium">ชื่อพอร์ต</th>
                      <th className="h-12 px-4 align-middle font-medium">วันที่สร้าง</th>
                      <th className="h-12 px-4 align-middle font-medium">ระดับความเสี่ยง</th>
                      <th className="h-12 px-4 align-middle font-medium text-right">เงินลงทุน (บาท)</th>
                      <th className="h-12 px-4 align-middle w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {paginatedData.length > 0 ? paginatedData.map((portfolio) => {
                      const risk = getRiskLabel(portfolio.target_beta);
                      const date = new Date(portfolio.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                      const isSelected = selectedIds.has(portfolio.id);

                      return (
                        <tr 
                          key={portfolio.id} 
                          onClick={() => router.push(`/dashboard/${portfolio.id}`)}
                          className={`hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group cursor-pointer ${isSelected ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}
                        >
                          <td className="p-4 align-middle text-center" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => toggleSelect(portfolio.id)}
                              className={`rounded border-stone-300 dark:border-stone-700 text-amber-600 focus:ring-amber-500 cursor-pointer transition-opacity ${isSelected ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`}
                            />
                          </td>
                          <td className="p-4 align-middle font-medium text-stone-900 dark:text-stone-100">
                            {portfolio.name}
                          </td>
                          <td className="p-4 align-middle text-stone-500 dark:text-stone-400">
                            {date}
                          </td>
                          <td className="p-4 align-middle">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${risk.class}`}>
                              {risk.label}
                            </span>
                          </td>
                          <td className="p-4 align-middle text-right font-medium text-stone-900 dark:text-stone-100">
                            ฿{Number(portfolio.budget).toLocaleString()}
                          </td>
                          <td className="p-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                            <Link href={`/dashboard/${portfolio.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                              <MoreHorizontal className="h-4 w-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={6} className="h-24 text-center text-stone-500">ไม่พบข้อมูลประวัติพอร์ต</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Bar: Pagination */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
              <p className="text-sm text-stone-500 dark:text-stone-400">
                แสดง {filteredData.length > 0 ? pageIndex * pageSize + 1 : 0} ถึง {Math.min((pageIndex + 1) * pageSize, filteredData.length)} จากทั้งหมด {filteredData.length} รายการ
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPageIndex(p => Math.max(0, p - 1))}
                  disabled={pageIndex === 0}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A19] text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: pageCount || 1 }, (_, i) => i).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPageIndex(page)}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium transition-colors
                      ${pageIndex === page 
                        ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900' 
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A19] text-stone-900 dark:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                  >
                    {page + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPageIndex(p => Math.min(pageCount - 1, p + 1))}
                  disabled={pageIndex >= pageCount - 1 || pageCount === 0}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A19] text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-[2px] transition-opacity">
          <div className="bg-white dark:bg-[#1A1A19] rounded-xl shadow-xl w-full max-w-[450px] overflow-hidden border border-stone-200 dark:border-stone-800 animate-in fade-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => !isDeleting && setIsDeleteDialogOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-500 dark:hover:text-stone-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20">
                  <TriangleAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                    ยืนยันการลบประวัติ
                  </h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                    คุณแน่ใจหรือไม่ที่จะลบประวัติพอร์ตการลงทุนจำนวน {selectedIds.size} รายการที่เลือก? ข้อมูลทั้งหมดจะถูกลบอย่างถาวรและไม่สามารถกู้คืนได้
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-stone-50 dark:bg-stone-800/50 flex justify-end gap-3 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1A1A19] text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#e11d48] hover:bg-[#be123c] text-white transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'กำลังลบ...' : 'ลบข้อมูล'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}