// app/page.tsx
'use client';
import Link from "next/link";
import { useState, useEffect } from "react";
import { Brain, Shield, BarChart3, ArrowRight, ArrowUpRight, TrendingUp, Target, Database } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";

const features = [
  {
    title: "เริ่มจัดพอร์ตกับ AI",
    description: "กรอกเงินลงทุน เป้าหมาย และระยะเวลา เพื่อให้ AI เริ่มประมวลผล",
    href: "/plan",
    icon: ArrowRight,
    iconForeground: "text-emerald-700 dark:text-emerald-400",
    iconBackground: "bg-emerald-50 dark:bg-emerald-950/30",
    ringColorClass: "ring-emerald-700/30 dark:ring-emerald-400/30",
  },
  {
    title: "ระบบอัลกอริทึมเชิงพันธุกรรม",
    description: "จำลองพอร์ตการลงทุนนับหมื่นรูปแบบ เพื่อหาสัดส่วนที่เหมาะสมที่สุด (Optimal Portfolio)",
    href: "/plan",
    icon: Brain,
    iconForeground: "text-amber-700 dark:text-amber-400",
    iconBackground: "bg-amber-50 dark:bg-amber-950/30",
    ringColorClass: "ring-amber-700/30 dark:ring-amber-400/30",
  },
  {
    title: "ทฤษฎี Black-Litterman",
    description: "ผสานข้อมูลสถิติในอดีต เข้ากับมุมมองตลาดปัจจุบัน เพื่อผลลัพธ์ที่แม่นยำยิ่งขึ้น",
    href: "/plan",
    icon: BarChart3,
    iconForeground: "text-blue-700 dark:text-blue-400",
    iconBackground: "bg-blue-50 dark:bg-blue-950/30",
    ringColorClass: "ring-blue-700/30 dark:ring-blue-400/30",
  },
  {
    title: "ทดสอบย้อนหลัง 5 ปี (Backtest)",
    description: "เปรียบเทียบผลลัพธ์ของพอร์ต AI กับดัชนีตลาด SET50 จากข้อมูลจริงย้อนหลัง",
    href: "/plan",
    icon: TrendingUp,
    iconForeground: "text-sky-700 dark:text-sky-400",
    iconBackground: "bg-sky-50 dark:bg-sky-950/30",
    ringColorClass: "ring-sky-700/30 dark:ring-sky-400/30",
  },
  {
    title: "บริหารความเสี่ยง (Beta)",
    description: "เลือกระดับความเสี่ยงที่คุณรับได้ ระบบจะควบคุมความผันผวนให้อยู่ในขอบเขต",
    href: "/plan",
    icon: Shield,
    iconForeground: "text-rose-700 dark:text-rose-400",
    iconBackground: "bg-rose-50 dark:bg-rose-950/30",
    ringColorClass: "ring-rose-700/30 dark:ring-rose-400/30",
  },
  {
    title: "จัดพอร์ตด้วยตนเอง",
    description: "คุณสามารถล็อคหุ้นตัวโปรด แล้วปล่อยให้ระบบเลือกหุ้นตัวอื่นมาจับคู่เพื่อลดความเสี่ยง",
    href: "/plan",
    icon: Target,
    iconForeground: "text-purple-700 dark:text-purple-400",
    iconBackground: "bg-purple-50 dark:bg-purple-950/30",
    ringColorClass: "ring-purple-700/30 dark:ring-purple-400/30",
  },
];

function MarketHighlights() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/market-highlights')
      .then(res => res.json())
      .then(json => {
        if (json.status === 'success') {
          setData(json.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-40 flex items-center justify-center relative z-10"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!data || data.length === 0) return null;

  return (
    <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 w-full relative z-10 pb-16">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl mx-auto">
        {data.map((item) => {
          const sanitizedName = item.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "_").toLowerCase();
          const gradientId = `gradient-${sanitizedName}`;
          const isPositive = item.changeType === "positive";
          const color = isPositive ? "#16a34a" : "#dc2626"; 

          return (
            <div key={item.name} className="bg-white/80 dark:bg-[#1A1A19]/80 backdrop-blur-sm rounded-xl border border-stone-200/50 dark:border-stone-800/50 shadow-sm overflow-hidden flex flex-col hover:border-amber-500/30 transition-colors">
              <div className="p-5 pb-2">
                <dt className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {item.name} <span className="font-normal text-stone-500 dark:text-stone-400 ml-1">{item.tickerSymbol}</span>
                </dt>
                <div className="flex items-baseline justify-between mt-2">
                  <dd className={`text-xl font-bold ${isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                    {item.value}
                  </dd>
                  <dd className="flex items-center space-x-1.5 text-sm font-semibold">
                    <span className="text-stone-700 dark:text-stone-300">
                      {isPositive ? '+' : ''}{item.change}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${isPositive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {isPositive ? '+' : ''}{item.percentageChange}%
                    </span>
                  </dd>
                </div>
              </div>

              <div className="h-16 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={item.chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide={true} />
                    <YAxis domain={[(dataMin: number) => Math.floor(dataMin * 0.98), (dataMax: number) => Math.ceil(dataMax * 1.02)]} hide={true} />
                    <Area
                      dataKey="value"
                      stroke={color}
                      fill={`url(#${gradientId})`}
                      fillOpacity={1}
                      strokeWidth={1.5}
                      type="monotone"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#FAFAF8] dark:bg-[#111110] selection:bg-amber-100 selection:text-amber-900 dark:selection:bg-amber-900 dark:selection:text-amber-100 font-sans text-stone-900 dark:text-stone-100 overflow-hidden">
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e7e5e4_1px,transparent_1px),linear-gradient(to_bottom,#e7e5e4_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#292524_1px,transparent_1px),linear-gradient(to_bottom,#292524_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50"></div>
        
        {/* Animated Orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-200/40 dark:bg-amber-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-stone-300/50 dark:bg-stone-700/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '2s', animationDuration: '9s' }}></div>
        <div className="absolute -top-32 left-1/2 w-[600px] h-[600px] bg-orange-100/40 dark:bg-orange-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '4s', animationDuration: '11s' }}></div>
      </div>

      {/* Hero Section — Centered Editorial */}
      <section className="relative z-10 pt-32 pb-24 lg:pt-44 lg:pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-stone-300 dark:border-stone-700 text-xs font-medium text-stone-500 dark:text-stone-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>
            CS-01 Senior Project
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-stone-900 dark:text-stone-50 tracking-tight leading-[0.95] mb-6">
            Intelligent
            <br />
            <span className="text-stone-400 dark:text-stone-500">Portfolio</span>
          </h1>

          <p className="text-lg sm:text-xl text-stone-500 dark:text-stone-400 max-w-xl mx-auto mb-10 leading-relaxed font-light">
            ออกแบบพอร์ตการลงทุนด้วย Genetic Algorithm
            <br className="hidden sm:block" />
            ผสานกับ Black-Litterman Model อย่างแม่นยำ
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-20">
            <Link href="/plan" className="inline-flex items-center justify-center px-8 py-3.5 bg-amber-600 dark:bg-amber-600 text-white dark:text-white font-bold rounded-lg hover:bg-amber-700 dark:hover:bg-amber-700 transition-colors text-sm">
              เริ่มสร้างพอร์ต
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center px-8 py-3.5 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-sm">
              เข้าสู่ระบบ
            </Link>
          </div>

          {/* Stat Numbers */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-stone-100">50+</div>
              <div className="text-xs text-stone-400 mt-1 font-medium">หุ้น SET50</div>
            </div>
            <div className="text-center border-x border-stone-200 dark:border-stone-800">
              <div className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-stone-100">10K+</div>
              <div className="text-xs text-stone-400 mt-1 font-medium">การจำลอง</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-500">AI</div>
              <div className="text-xs text-stone-400 mt-1 font-medium">Optimization</div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Highlights */}
      <MarketHighlights />

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4"><div className="border-t border-stone-200 dark:border-stone-800"></div></div>
      
      {/* Features — Grid Layout */}
      <section className="py-24 bg-[#FAFAF8] dark:bg-[#111110]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-3">ทำไมต้อง IntelliPort?</h2>
            <p className="text-stone-500 dark:text-stone-400">เทคโนโลยีที่อยู่เบื้องหลังระบบ</p>
          </div>

          <div className="overflow-hidden rounded-2xl bg-stone-200/60 dark:bg-stone-800/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5 p-0.5 shadow-sm">
            {features.map((action) => (
              <div
                key={action.title}
                className="group relative bg-white dark:bg-[#1A1A19] p-8 hover:bg-stone-50 dark:hover:bg-[#222220] transition-colors focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-inset"
              >
                <div>
                  <span
                    className={`inline-flex rounded-xl p-3 ring-2 ring-inset ${action.iconBackground} ${action.iconForeground} ${action.ringColorClass}`}
                  >
                    <action.icon aria-hidden="true" className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-5">
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    <Link href={action.href} className="focus:outline-none">
                      <span aria-hidden="true" className="absolute inset-0" />
                      {action.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                    {action.description}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-6 right-6 text-stone-300 dark:text-stone-700 group-hover:text-amber-500 dark:group-hover:text-amber-500 transition-colors"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — Dark Section, Editorial Numbers */}
      <section className="py-24 bg-stone-900 dark:bg-stone-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">ขั้นตอนการทำงาน</h2>
            <p className="text-stone-400">จากข้อมูลของคุณ สู่พอร์ตการลงทุนระดับมืออาชีพ</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="text-5xl font-black text-amber-500 mb-4">01</div>
              <h3 className="text-lg font-bold mb-2">กำหนดเป้าหมาย</h3>
              <p className="text-stone-400 text-sm leading-relaxed">ระบุเงินลงทุน เป้าหมาย ระยะเวลา และความเสี่ยงที่รับได้</p>
            </div>
            <div>
              <div className="text-5xl font-black text-amber-500/70 mb-4">02</div>
              <h3 className="text-lg font-bold mb-2">Black-Litterman</h3>
              <p className="text-stone-400 text-sm leading-relaxed">ปรับปรุงผลตอบแทนคาดหวังจาก Market Views ให้สมดุล</p>
            </div>
            <div>
              <div className="text-5xl font-black text-amber-500/50 mb-4">03</div>
              <h3 className="text-lg font-bold mb-2">Genetic Algo</h3>
              <p className="text-stone-400 text-sm leading-relaxed">จำลองการจัดพอร์ตนับหมื่นรูปแบบเพื่อหาสัดส่วนที่ดีที่สุด</p>
            </div>
            <div>
              <div className="text-5xl font-black text-amber-400 mb-4">04</div>
              <h3 className="text-lg font-bold mb-2">ได้พอร์ตลงทุน</h3>
              <p className="text-stone-400 text-sm leading-relaxed">พร้อมกราฟ Backtest ย้อนหลัง และคำแนะนำการจัดสรร</p>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-stone-800">
            <Link href="/plan" className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-stone-900 bg-white rounded-lg hover:bg-stone-100 transition-colors">
              เริ่มใช้งานระบบ
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-stone-900 dark:bg-stone-100 flex items-center justify-center text-white dark:text-stone-900 text-[9px] font-bold">IP</div>
            <span className="text-sm text-stone-500">IntelliPort — CS-01 คณะวิทยาศาสตร์ฯ ม.สวนดุสิต</span>
          </div>
          <div className="flex gap-6 text-xs text-stone-400">
            <span>Thanawin & Peerapat</span>
            <span>Advisor: Dr.Chawalsak</span>
          </div>
        </div>
      </footer>

    </div>
  );
}