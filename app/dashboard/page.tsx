// app/dashboard/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';

import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null);
  
  const [allocationData, setAllocationData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  
  const [isDownloading, setIsDownloading] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#f43f5e', '#f97316'];

  useEffect(() => {
    // 1. ดึงข้อมูลเป้าหมายผู้ใช้ และเก็บค่าเริ่มต้นไว้สเกลกราฟ
    const savedPlan = localStorage.getItem('userPlan');
    let userInitialAmount = 100000; // ค่าเริ่มต้นถ้าไม่เจอข้อมูล

    if (savedPlan) {
      const parsedPlan = JSON.parse(savedPlan);
      setUserData(parsedPlan);
      if (parsedPlan.initialAmount) {
        userInitialAmount = Number(parsedPlan.initialAmount);
      }
    }

    // 2. ดึงผลลัพธ์จาก AI 
    const savedResult = localStorage.getItem('portfolioResult');
    if (savedResult) {
      const parsedResult = JSON.parse(savedResult);
      
      // ✅ กราฟวงกลม: แปลงข้อมูลหุ้น
      if (parsedResult.portfolio && Array.isArray(parsedResult.portfolio)) {
        const mappedAllocation = parsedResult.portfolio.map((stock: any, index: number) => ({
          name: stock.Ticker.replace('.BK', ''), 
          value: Number((stock.Weight * 100).toFixed(2)), 
          color: COLORS[index % COLORS.length]
        }));
        setAllocationData(mappedAllocation);
      }

      // ✅ กราฟเส้น: ดึงข้อมูล chart_data ที่ได้จาก Backend มาวาดกราฟ
      if (parsedResult.backtest && parsedResult.backtest.chart_data && Array.isArray(parsedResult.backtest.chart_data)) {
        
        // เราตั้งต้นเงินลงทุนไว้ที่ 100,000 จากหลังบ้าน ดังนั้นให้หา อัตราส่วน เพื่อสเกลเงินตามเป้าหมายของผู้ใช้
        const ratio = userInitialAmount / 100000;

        const mappedPerformance = parsedResult.backtest.chart_data.map((bt: any) => ({
          year: bt.date, 
          AI: Math.round(bt.AI * ratio),        // สเกลเงิน AI ตามทุนผู้ใช้
          SET50: Math.round(bt.SET50 * ratio)   // สเกลเงิน SET50 ตามทุนผู้ใช้
        }));
        
        setPerformanceData(mappedPerformance);
      } else {
        // Fallback กรณีไม่มีข้อมูล
        setPerformanceData([]);
      }
    }
  }, []); // ✅ ปิดวงเล็บ useEffect อย่างสมบูรณ์

  const handleDownloadPDF = async () => {
    if (!dashboardRef.current) return;
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const targetWidth = 1600;
      const dataUrl = await toPng(dashboardRef.current, {
        cacheBust: true, backgroundColor: '#ffffff', quality: 1.0, pixelRatio: 2,
        width: targetWidth, style: { width: `${targetWidth}px`, maxWidth: `${targetWidth}px`, height: 'auto', margin: '0', padding: '40px' }
      });
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });
      const pdf = new jsPDF('l', 'px', [img.width, img.height]);
      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
      pdf.save(`IntelliPort_Report.pdf`);
    } catch (error: any) {
      console.error("PDF Error:", error);
      alert(`บันทึกไม่สำเร็จ: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.03) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold shadow-sm">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <main className="min-h-screen bg-[#FFFEF5] py-8 px-4 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] selection:bg-yellow-400 selection:text-black">
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Portfolio Dashboard</h1>
          <p className="text-slate-500">ระบบจัดการพอร์ตการลงทุนอัจฉริยะ (CS-01)</p>
        </div>
        <button 
          onClick={handleDownloadPDF} disabled={isDownloading}
          className={`flex items-center px-6 py-3 border rounded-xl shadow-sm transition-all font-medium ${
            isDownloading ? 'bg-blue-50 border-blue-200 text-blue-600 cursor-wait' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:shadow-md'
          }`}
        >
          {isDownloading ? ' กำลังสร้างไฟล์...' : '⬇️ ดาวน์โหลด PDF'}
        </button>
      </div>

      <div className="max-w-7xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-200" ref={dashboardRef}> 
        <div className="mb-8 border-b border-slate-100 pb-6">
          <h2 className="text-2xl font-bold text-slate-900">Portfolio Dashboard</h2>
          <p className="text-slate-500">ผลลัพธ์การวิเคราะห์ด้วย Genetic Algorithm สำหรับคุณ</p>
        </div>

        {userData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <span className="text-slate-500 text-sm block mb-1">เงินลงทุนตั้งต้น</span>
                <span className="text-3xl font-bold text-slate-800">฿ {Number(userData.initialAmount).toLocaleString()}</span>
             </div>
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <span className="text-slate-500 text-sm block mb-1">เป้าหมาย</span>
                <span className="text-3xl font-bold text-green-600">฿ {Number(userData.targetAmount).toLocaleString()}</span>
             </div>
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <span className="text-slate-500 text-sm block mb-1">ความเสี่ยง</span>
                <span className="text-3xl font-bold text-blue-600 uppercase">{userData.riskLevel}</span>
             </div>
          </div>
        ) : (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 text-center border border-red-200">
             ไม่พบข้อมูลการลงทุน หรือคุณยังไม่ได้รันการคำนวณผ่านหน้า Plan
          </div>
        )}

        {allocationData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 p-6 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-slate-900 mb-6 border-l-4 border-blue-500 pl-3">
                สัดส่วนสินทรัพย์แนะนำ
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                      labelLine={false} label={renderCustomizedLabel}
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => `${value}%`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" height={72} align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-slate-900 mb-6 border-l-4 border-green-500 pl-3">
                ผลการทดสอบย้อนหลัง (Backtest)
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `฿${(value/1000).toFixed(0)}k`} width={60} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <Area type="monotone" dataKey="SET50" stroke="#cbd5e1" strokeWidth={3} fill="transparent" name="ดัชนีตลาด SET50" />
                    <Area type="monotone" dataKey="AI" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAI)" name="พอร์ต AI แนะนำ" />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="top" height={36}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 animate-pulse">
            กำลังรอผลการวิเคราะห์พอร์ตจาก AI...
          </div>
        )}

      </div>
    </main>
  );
}