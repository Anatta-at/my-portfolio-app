'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import Link from 'next/link';
import { ArrowLeft, Download, X } from 'lucide-react';

// Warm minimal palette for charts
// ชุดสีที่มองเห็นชัดเจนและตัดกัน (Vibrant & High Contrast)
const COLORS = [
  '#2563eb', // blue-600
  '#059669', // emerald-600
  '#d97706', // amber-600
  '#dc2626', // red-600
  '#7c3aed', // violet-600
  '#db2777', // pink-600
  '#0891b2', // cyan-600
  '#65a30d', // lime-600
  '#ea580c', // orange-600
  '#4f46e5', // indigo-600
];

export default function PortfolioDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [portfolioData, setPortfolioData] = useState<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allocationData, setAllocationData] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [tableView, setTableView] = useState<'year' | 'month'>('year');

  const displayTableData = useMemo(() => {
    if (tableView === 'month') return performanceData;
    
    // Group by year, taking the last available month for that year
    const yearlyMap = new Map();
    performanceData.forEach(row => {
      const year = row.year.substring(0, 4);
      yearlyMap.set(year, { ...row, year: year });
    });
    return Array.from(yearlyMap.values());
  }, [performanceData, tableView]);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const yearlyForecast = useMemo(() => {
    if (!portfolioData?.metadata) return [];
    const meta = portfolioData.metadata;
    const budget = meta.budget;
    const mu = meta.expected_return;
    const sigma = meta.portfolio_volatility;
    const duration = meta.duration_years || 5;

    const data = [];
    for (let t = 1; t <= duration; t++) {
      const expected = budget * Math.exp(mu * t);
      const m = Math.log(budget) + (mu - 0.5 * Math.pow(sigma, 2)) * t;
      const s = sigma * Math.sqrt(t);
      const lower = Math.exp(m - s);
      const upper = Math.exp(m + s);

      data.push({ year: t, expected, lower, upper });
    }
    return data;
  }, [portfolioData]);

  useEffect(() => {
    if (!id) return;

    async function fetchPortfolio() {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/portfolios/${id}`);
        if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลพอร์ตได้');
        const data = await res.json();

        if (data.status === 'success') {
          setPortfolioData(data);

          if (data.portfolio && Array.isArray(data.portfolio)) {
            const initialBudget = data.metadata?.budget || 100000;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedAllocation = data.portfolio.map((stock: any, index: number) => ({
              name: stock.Ticker.replace('.BK', ''),
              value: Number((stock.Weight * 100).toFixed(2)),
              amount: Math.round(stock.Weight * initialBudget),
              color: COLORS[index % COLORS.length]
            }));
            setAllocationData(mappedAllocation);
          }

          if (data.backtest && data.backtest.chart_data && Array.isArray(data.backtest.chart_data)) {
            const initialBudget = data.metadata.budget || 100000;
            const ratio = initialBudget / 100000;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedPerformance = data.backtest.chart_data.map((bt: any) => ({
              year: bt.date,
              AI: Math.round(bt.AI * ratio),
              SET50: Math.round(bt.SET50 * ratio)
            }));
            setPerformanceData(mappedPerformance);
          }
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || 'การเชื่อมต่อผิดพลาด');
        } else {
          setError('การเชื่อมต่อผิดพลาด');
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchPortfolio();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!dashboardRef.current) return;
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const targetWidth = 1200;
      const dataUrl = await toPng(dashboardRef.current, {
        cacheBust: true, backgroundColor: '#FAFAF8', quality: 1.0, pixelRatio: 2,
        width: targetWidth, style: { width: `${targetWidth}px`, maxWidth: `${targetWidth}px`, height: 'auto', margin: '0', padding: '30px' }
      });
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });
      const pdf = new jsPDF('l', 'px', [img.width, img.height]);
      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
      pdf.save(`Portfolio_Report_${id}.pdf`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
    if (percent < 0.04) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] dark:bg-[#111110]">
        <div className="text-sm text-stone-500">กำลังวิเคราะห์ข้อมูล...</div>
      </div>
    );
  }

  if (error || !portfolioData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] dark:bg-[#111110]">
        <div className="text-sm text-red-500">{error || 'ไม่พบข้อมูล'}</div>
      </div>
    );
  }

  const meta = portfolioData.metadata;

  return (
    <main className="min-h-screen bg-[#FAFAF8] dark:bg-[#111110] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto mb-8">
        <Link href="/dashboard" className="inline-flex items-center text-xs font-semibold text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 mb-6 uppercase tracking-wider">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> กลับไปประวัติ
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight">{meta.name}</h1>
            <div className="text-stone-500 dark:text-stone-400 text-sm mt-2 flex gap-3">
              <span>#{id}</span>
              <span>•</span>
              <span>{new Date(meta.created_at).toLocaleDateString('th-TH')}</span>
            </div>
          </div>
          <button
            onClick={handleDownloadPDF} disabled={isDownloading}
            className="px-4 py-2 bg-white dark:bg-[#1A1A19] border border-stone-200 dark:border-stone-700 rounded-lg text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center"
          >
            {isDownloading ? 'กำลังสร้าง PDF...' : <><Download className="w-4 h-4 mr-2" /> PDF Report</>}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto" ref={dashboardRef}>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white dark:bg-[#1A1A19] p-4 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm flex flex-col justify-center">
            <div className="text-[10px] text-stone-500 font-bold mb-1.5">เงินลงทุนตั้งต้น</div>
            <div className="text-lg font-black text-stone-900 dark:text-stone-100">฿{Number(meta.budget).toLocaleString()}</div>
          </div>
          <div className="bg-white dark:bg-[#1A1A19] p-4 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm flex flex-col justify-center">
            <div className="text-[10px] text-stone-500 font-bold mb-1.5">เป้าหมายเงินออม</div>
            <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">{meta.target_amount ? `฿${Number(meta.target_amount).toLocaleString()}` : '—'}</div>
          </div>
          <div 
            className="bg-white dark:bg-[#1A1A19] p-4 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm flex flex-col justify-center cursor-pointer hover:bg-stone-50 dark:hover:bg-[#222221] transition-colors group relative overflow-hidden"
            onClick={() => setIsForecastModalOpen(true)}
          >
            <div className="flex justify-between items-start mb-1.5">
              <div className="text-[10px] text-stone-500 font-bold">คาดการณ์เมื่อครบ {meta.duration_years} ปี</div>
              <div className="text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold">ดูรายละเอียด</div>
            </div>
            <div className="text-[13px] xl:text-[14px] font-black text-stone-900 dark:text-stone-100">
              {meta.forecast_lower && meta.forecast_upper
                ? `฿${Math.round(meta.forecast_lower).toLocaleString()} - ฿${Math.round(meta.forecast_upper).toLocaleString()}`
                : (meta.forecast_lower ? `฿${Math.round(meta.forecast_lower).toLocaleString()}` : '—')}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A19] p-4 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm flex flex-col justify-center">
            <div className="text-[10px] text-stone-500 font-bold mb-1.5">โอกาสสำเร็จ</div>
            <div className={`text-lg font-black ${meta.success_probability
              ? (meta.success_probability < 0.5 ? 'text-rose-600 dark:text-rose-500' : meta.success_probability < 0.8 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-500')
              : 'text-stone-900 dark:text-stone-100'
              }`}>
              {meta.success_probability ? `${Math.round(meta.success_probability * 100)}%` : '—'}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A19] p-4 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm flex flex-col justify-center">
            <div className="text-[10px] text-stone-500 font-bold mb-1.5">ผลตอบแทนคาดหวังรายปี</div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-500">{(meta.expected_return * 100).toFixed(2)}%</div>
          </div>

          <div className="bg-white dark:bg-[#1A1A19] p-4 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm flex flex-col justify-center relative">
            <div className="text-[10px] text-stone-500 font-bold mb-1.5">ระดับความเสี่ยง</div>
            <div className="text-lg font-black text-stone-900 dark:text-stone-100">
              {meta.target_beta < 0.9 ? 'Conservative' : meta.target_beta > 1.1 ? 'Aggressive' : 'Moderate'}
            </div>
            <div className={`absolute top-4 right-3 text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${meta.target_beta < 0.9 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
              meta.target_beta > 1.1 ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
              }`}>
              Beta {meta.target_beta}
            </div>
          </div>
        </div>

        {/* Charts Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Allocation */}
          <div className="lg:col-span-1 bg-white dark:bg-[#1A1A19] p-6 rounded-lg border border-stone-200 dark:border-stone-800">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-6 uppercase tracking-wider">Asset Allocation</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData} innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none"
                    labelLine={false} label={renderCustomizedLabel}
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-[#1A1A19] p-3 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm text-sm min-w-[150px]">
                            <p className="font-bold text-stone-900 dark:text-stone-100 mb-1 flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }}></span>
                              {data.name}
                            </p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-[12px]">
                              <p className="text-stone-500 dark:text-stone-400">สัดส่วน</p>
                              <p className="font-bold text-right text-stone-900 dark:text-stone-100">{data.value}%</p>
                              <p className="text-stone-500 dark:text-stone-400">ต้องใช้เงิน</p>
                              <p className="font-bold text-right text-emerald-600 dark:text-emerald-500">฿{data.amount.toLocaleString()}</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#78716c' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-stone-500">ความเสี่ยง (Beta)</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{meta.target_beta}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500">ผลตอบแทนคาดหวัง</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{(meta.expected_return * 100).toFixed(1)}% / ปี</span>
              </div>
            </div>
          </div>

          {/* Performance Analysis (Historical Backtest) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1A1A19] p-6 rounded-lg border border-stone-200 dark:border-stone-800">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-6 uppercase tracking-wider">
              Historical Backtest
            </h3>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" stroke="#78716c" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#78716c" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} width={50} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                  <Area type="monotone" dataKey="SET50" stroke="currentColor" className="text-stone-400 dark:text-stone-200" strokeWidth={2} strokeDasharray="4 4" fill="transparent" name="SET50 Index" />
                  <Area type="monotone" dataKey="AI" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorAI)" name="AI Portfolio" />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e7e5e4', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', color: '#1c1917' }} />
                  <Legend verticalAlign="top" height={30} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Comparison Table */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                  ตารางผลตอบแทน (Portfolio vs SET50)
                </h4>
                <div className="flex bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
                  <button
                    onClick={() => setTableView('year')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      tableView === 'year' 
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm' 
                        : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                    }`}
                  >
                    รายปี (Yearly)
                  </button>
                  <button
                    onClick={() => setTableView('month')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      tableView === 'month' 
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm' 
                        : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                    }`}
                  >
                    รายเดือน (Monthly)
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-stone-500 uppercase bg-stone-50 dark:bg-stone-800/50 dark:text-stone-400">
                    <tr>
                      <th className="px-4 py-3 font-semibold rounded-tl-md">ช่วงเวลา (Period)</th>
                      <th className="px-4 py-3 font-semibold">พอร์ตของเรา (Portfolio)</th>
                      <th className="px-4 py-3 font-semibold rounded-tr-md">SET50 (Benchmark)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayTableData.map((row, idx) => (
                      <tr key={idx} className="border-b border-stone-100 dark:border-stone-800 last:border-0 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">{row.year}</td>
                        <td className="px-4 py-3 text-emerald-600 dark:text-emerald-500 font-semibold">฿{row.AI.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-3 text-stone-600 dark:text-stone-400 font-medium">฿{row.SET50.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
      {/* Forecast Modal */}
      {isForecastModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1A19] w-full max-w-2xl rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-5 sm:p-6 border-b border-stone-100 dark:border-stone-800">
              <h2 className="text-lg font-black text-stone-900 dark:text-stone-100">
                รายละเอียดคาดการณ์ผลตอบแทน (รายปี)
              </h2>
              <button onClick={() => setIsForecastModalOpen(false)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 p-1.5 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-5 sm:p-6">
              <div className="bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 p-4 rounded-xl text-xs mb-6 border border-amber-200/50 dark:border-amber-800/50 leading-relaxed">
                <strong className="font-bold">หมายเหตุ:</strong> การคาดการณ์นี้ใช้แบบจำลอง Geometric Brownian Motion (GBM) ที่ระดับความเชื่อมั่น 68% (1 Standard Deviation) ผลลัพธ์ในอนาคตอาจมีความคลาดเคลื่อนจากที่แสดง
              </div>
              
              <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
                <table className="w-full text-sm text-left">
                  <thead className="bg-stone-50 dark:bg-[#111110] text-stone-500 font-bold border-b border-stone-200 dark:border-stone-800">
                    <tr>
                      <th className="py-3 px-4 w-20 text-center">ปีที่</th>
                      <th className="py-3 px-4 text-right">คาดการณ์ต่ำสุด</th>
                      <th className="py-3 px-4 text-right text-stone-900 dark:text-stone-100">ค่าเฉลี่ยที่คาดหวัง</th>
                      <th className="py-3 px-4 text-right">คาดการณ์สูงสุด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearlyForecast.map((row, idx) => (
                      <tr key={row.year} className={`border-b border-stone-100 dark:border-stone-800/50 hover:bg-stone-50/50 dark:hover:bg-[#151514] ${idx === yearlyForecast.length - 1 ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}`}>
                        <td className="py-3 px-4 text-center font-bold text-stone-900 dark:text-stone-100">{row.year}</td>
                        <td className="py-3 px-4 text-right font-medium text-rose-600 dark:text-rose-500">฿{Math.round(row.lower).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-bold text-stone-900 dark:text-stone-100">฿{Math.round(row.expected).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-medium text-emerald-600 dark:text-emerald-500">฿{Math.round(row.upper).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-5 sm:p-6 border-t border-stone-100 dark:border-stone-800 flex justify-end">
              <button onClick={() => setIsForecastModalOpen(false)} className="px-5 py-2.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 font-bold rounded-lg transition-colors">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
