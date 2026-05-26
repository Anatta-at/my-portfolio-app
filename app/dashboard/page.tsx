'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Lock, Plus, AlertCircle, BarChart3, ArrowRight } from 'lucide-react';

export default function HistoryPage() {
  const { userId, isLoaded } = useAuth();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !userId) {
      if (isLoaded && !userId) {
        setIsLoading(false);
      }
      return;
    }

    async function fetchHistory() {
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/portfolios?clerk_id=${userId}`);
        if (!res.ok) throw new Error('ไม่สามารถเชื่อมต่อระบบประวัติพอร์ตลงทุนได้');
        const data = await res.json();
        
        if (data.status === 'success') {
          setPortfolios(data.portfolios || []);
        } else {
          setError(data.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลประวัติ');
        }
      } catch (err: any) {
        setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [userId, isLoaded]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFEF5] dark:bg-slate-950">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-yellow-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-600 dark:text-slate-400 font-medium">กำลังโหลดประวัติแผนการลงทุนของคุณ...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFEF5] dark:bg-slate-950 px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-red-100 dark:border-slate-800 text-center">
          <span className="text-4xl flex justify-center text-slate-700 dark:text-slate-300 mb-2"><Lock className="w-12 h-12" /></span>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-4 mb-2">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">คุณต้องเข้าสู่ระบบก่อนจึงจะดูประวัติการวางแผนลงทุนได้</p>
          <Link href="/login" className="inline-block bg-slate-900 dark:bg-yellow-400 hover:bg-slate-800 dark:hover:bg-yellow-300 text-white dark:text-slate-900 font-bold py-3 px-6 rounded-xl transition-all">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  const getRiskLabel = (beta: number) => {
    if (beta < 0.9) return { label: 'Conservative', color: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' };
    if (beta > 1.1) return { label: 'Aggressive', color: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' };
    return { label: 'Moderate', color: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400' };
  };

  return (
    <main className="min-h-screen bg-[#FFFEF5] dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] selection:bg-yellow-400 selection:text-black">
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ประวัติแผนการลงทุน</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">ประวัติรายการพอร์ตโฟลิโอของคุณที่สร้างขึ้นโดยระบบ AI</p>
        </div>
        <Link href="/plan" className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-yellow-400/20 hover:shadow-yellow-400/40 flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> สร้างแผนใหม่
        </Link>
      </div>

      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-8 border border-red-200 dark:border-red-900/50 text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" /> {error}
          </div>
        )}

        {portfolios.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-sm flex flex-col items-center">
            <span className="text-5xl text-slate-400"><BarChart3 className="w-14 h-14" /></span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-2 mb-2">ไม่พบประวัติพอร์ตการลงทุน</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
              คุณยังไม่เคยจำลองและออกแบบพอร์ตลงทุนด้วยระบบ AI ของเรา เริ่มออกแบบพอร์ตแรกของคุณตอนนี้ได้เลย!
            </p>
            <Link href="/plan" className="inline-block bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-yellow-400/20">
              สร้างพอร์ตลงทุนใหม่
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-300 text-sm font-semibold">
                    <th className="py-4 px-6">ชื่อพอร์ต (ID)</th>
                    <th className="py-4 px-6">วันและเวลาที่บันทึก</th>
                    <th className="py-4 px-6">เงินลงทุนเริ่มต้น</th>
                    <th className="py-4 px-6">เป้าหมายเงินออม</th>
                    <th className="py-4 px-6">ระยะเวลา (ปี)</th>
                    <th className="py-4 px-6">ระดับความเสี่ยง</th>
                    <th className="py-4 px-6">ผลตอบแทนคาดหวังรายปี</th>
                    <th className="py-4 px-6">โอกาสสำเร็จ</th>
                    <th className="py-4 px-6 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {portfolios.map((portfolio) => {
                    const risk = getRiskLabel(portfolio.target_beta);
                    const formattedDate = new Date(portfolio.created_at).toLocaleString('th-TH', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    });

                    return (
                      <tr key={portfolio.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-700 dark:text-slate-200">
                          <div className="text-sm">{portfolio.name}</div>
                          <div className="text-xs text-slate-400 font-normal">#{portfolio.id}</div>
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{formattedDate}</td>
                        <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200">
                          ฿{Number(portfolio.budget).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 font-bold text-indigo-600 dark:text-indigo-400">
                          <div>{portfolio.target_amount ? `฿${Number(portfolio.target_amount).toLocaleString()}` : '-'}</div>
                          {portfolio.forecast_lower !== undefined && portfolio.forecast_lower !== null && portfolio.forecast_upper !== undefined && portfolio.forecast_upper !== null ? (
                            <div className="text-xs text-slate-400 font-normal mt-0.5 whitespace-nowrap">
                              คาดการณ์: ฿{Math.round(portfolio.forecast_lower).toLocaleString()} ~ ฿{Math.round(portfolio.forecast_upper).toLocaleString()}
                            </div>
                          ) : null}
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{portfolio.duration_years} ปี</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${risk.color}`}>
                            {risk.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-green-600 dark:text-green-400 font-bold">
                          {(portfolio.expected_return * 100).toFixed(2)}%
                        </td>
                        <td className="py-4 px-6 font-bold">
                          {portfolio.success_probability !== undefined && portfolio.success_probability !== null ? (
                            <span className={portfolio.success_probability >= 0.7 ? 'text-green-600 dark:text-green-400' : portfolio.success_probability >= 0.4 ? 'text-amber-500' : 'text-red-500'}>
                              {(portfolio.success_probability * 100).toFixed(0)}%
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link href={`/dashboard/${portfolio.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                            ดูรายละเอียดพอร์ต <ArrowRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}