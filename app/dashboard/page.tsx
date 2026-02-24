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
  const [isDownloading, setIsDownloading] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('userPlan');
    if (savedData) {
      setUserData(JSON.parse(savedData));
    }
  }, []);

  const handleDownloadPDF = async () => {
    if (!dashboardRef.current) return;
    
    setIsDownloading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const targetWidth = 1600;

      const dataUrl = await toPng(dashboardRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        quality: 1.0,
        pixelRatio: 2,
        width: targetWidth, 
        style: {
          width: `${targetWidth}px`,
          maxWidth: `${targetWidth}px`,
          height: 'auto',
          margin: '0',
          padding: '40px' 
        }
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      const imgWidth = img.width;
      const imgHeight = img.height;

      const pdf = new jsPDF('l', 'px', [imgWidth, imgHeight]);
      pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`IntelliPort_Report.pdf`);
      
    } catch (error: any) {
      console.error("PDF Error:", error);
      alert(`บันทึกไม่สำเร็จ: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const allocationData = [
    { name: 'AOT (ท่าอากาศยานไทย)', value: 35, color: '#3b82f6' }, // สีฟ้า
    { name: 'PTT (ปตท.)', value: 25, color: '#10b981' }, // สีเขียว
    { name: 'CPALL (ซีพี ออลล์)', value: 20, color: '#f59e0b' }, // สีส้ม
    { name: 'ADVANC (AIS)', value: 15, color: '#8b5cf6' }, // สีม่วง
    { name: 'KBANK (กสิกรไทย)', value: 5, color: '#ef4444' }, // สีแดง
  ];
  
  const performanceData = [
    { year: '2019', AI: 100000, SET50: 100000 },
    { year: '2020', AI: 112000, SET50: 95000 },
    { year: '2021', AI: 125000, SET50: 105000 },
    { year: '2022', AI: 138000, SET50: 108000 },
    { year: '2023', AI: 155000, SET50: 112000 },
    { year: '2024', AI: 172000, SET50: 115000 },
  ];

  // --- ฟังก์ชันคำนวณตำแหน่งตัวเลขในวงกลม (เพิ่มใหม่) ---
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    // คำนวณจุดกึ่งกลางของวงโดนัท
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-xs font-bold shadow-sm" // ปรับขนาดตัวหนังสือตรงนี้
      >
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
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className={`flex items-center px-6 py-3 border rounded-xl shadow-sm transition-all font-medium ${
            isDownloading 
              ? 'bg-blue-50 border-blue-200 text-blue-600 cursor-wait' 
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:shadow-md'
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
             ไม่พบข้อมูลการลงทุน
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- กราฟวงกลม (แก้ตรงนี้) --- */}
          <div className="lg:col-span-1 p-6 rounded-2xl border border-slate-100 bg-white">
            <h3 className="text-lg font-bold text-slate-900 mb-6 border-l-4 border-blue-500 pl-3">
              สัดส่วนสินทรัพย์แนะนำ
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    innerRadius={60}
                    outerRadius={100} // ขยายกลับมาเต็ม 100 เพราะตัวเลขอยู่ข้างในแล้ว
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false} // ปิดเส้นชี้
                    label={renderCustomizedLabel} // เรียกใช้ฟังก์ชันแสดงตัวเลขข้างใน
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  
                  <RechartsTooltip 
                    formatter={(value: any) => `${value}%`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  
                  <Legend 
                    verticalAlign="bottom" 
                    height={72} 
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-100 bg-white">
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
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `฿${value/1000}k`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Area type="monotone" dataKey="SET50" stroke="#cbd5e1" strokeWidth={3} fill="transparent" />
                  <Area type="monotone" dataKey="AI" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAI)" />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 bg-slate-50 p-3 rounded-lg text-center">
              <p className="text-sm text-slate-600">
                ระบบ AI ชนะตลาดได้เฉลี่ย <span className="text-green-600 font-bold text-lg">+15.4%</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}