// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    // เปลี่ยน Selection เป็นสีเหลืองสด ตัวหนังสือดำ
    <div className="relative min-h-screen bg-white selection:bg-yellow-400 selection:text-black font-sans">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-yellow-50 via-white to-white pt-20 pb-16 lg:pt-32 lg:pb-24">
        
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* เส้นตารางสีเหลืองสด */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#fde047_1px,transparent_1px),linear-gradient(to_bottom,#fde047_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,transparent,white)]"></div>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          {/* แสงสีเหลืองสว่าง (Lemon Yellow) */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-300/20 blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-400/20 blur-[100px] animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-yellow-300 bg-yellow-50 text-yellow-700 text-sm font-bold mb-6 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-yellow-500 mr-2 animate-ping"></span>
                Project CS-01: AI Powered Investment
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                The Future of <br />
                {/* สีเหลืองสดไล่เฉด */}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 animate-gradient">
                  Intelligent Portfolio
                </span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-yellow-100">
                ปฏิวัติการจัดพอร์ตการลงทุนด้วยพลังของ <strong>Genetic Algorithm</strong> และ <strong>Black-Litterman Model</strong> ออกแบบแผนการเงินที่แม่นยำที่สุดเพื่อคุณโดยเฉพาะ
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {/* ปุ่มสีเหลืองสด ตัวหนังสือดำ (เพื่อให้ตัดกัน) */}
                <Link href="/plan" className="group relative px-8 py-4 bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-lg shadow-yellow-400/40 hover:bg-yellow-300 hover:-translate-y-1 transition-all duration-200 overflow-hidden">
                   เริ่มต้นสร้างพอร์ตฟรี
                </Link>
                <Link href="/dashboard" className="px-8 py-4 bg-white text-slate-800 font-bold rounded-xl border-2 border-slate-100 shadow-sm hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200">
                  ดูตัวอย่างระบบ
                </Link>
              </div>
            </div>

            {/* Right Visual (Yellow Theme) */}
            <div className="relative lg:h-[600px] flex items-center justify-center perspective-1000">
               <div className="relative w-full max-w-md aspect-[4/3] bg-white/80 backdrop-blur-2xl border-2 border-white rounded-2xl shadow-2xl shadow-yellow-200 p-6 transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-transform duration-500 ease-out animate-[float_6s_ease-in-out_infinite]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  </div>
                  <div className="text-xs font-mono text-slate-400">AI_GENETIC_ALGO_V1.0</div>
                </div>
                <div className="flex items-end justify-between h-40 gap-2 mb-6">
                  <div className="w-full bg-slate-100 rounded-t-lg h-[40%] relative group"><div className="absolute bottom-0 w-full bg-slate-300 rounded-t-lg h-0 group-hover:h-full transition-all duration-500"></div></div>
                  <div className="w-full bg-yellow-100 rounded-t-lg h-[65%] relative group"><div className="absolute bottom-0 w-full bg-yellow-400 rounded-t-lg h-0 group-hover:h-full transition-all duration-700 delay-100"></div></div>
                  <div className="w-full bg-yellow-50 rounded-t-lg h-[85%] relative group"><div className="absolute bottom-0 w-full bg-yellow-500 rounded-t-lg h-0 group-hover:h-full transition-all duration-1000 delay-200"></div></div>
                  <div className="w-full bg-yellow-50 rounded-t-lg h-[50%] relative group"><div className="absolute bottom-0 w-full bg-yellow-300 rounded-t-lg h-0 group-hover:h-full transition-all duration-500 delay-150"></div></div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full w-[70%] bg-gradient-to-r from-yellow-300 to-yellow-500"></div></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Expected Return</span><span className="font-bold text-yellow-600">+12.5% 📈</span></div>
                </div>
                <div className="absolute -right-8 top-10 bg-white p-4 rounded-xl shadow-xl border border-yellow-100 animate-[bounce_3s_infinite]"><div className="text-xs text-slate-400 mb-1">Risk Level</div><div className="font-bold text-slate-800 text-lg">Medium 🛡️</div></div>
                <div className="absolute -left-8 bottom-10 bg-white p-4 rounded-xl shadow-xl border border-yellow-100 animate-[bounce_4s_infinite] delay-700"><div className="text-xs text-slate-400 mb-1">Assets</div><div className="font-bold text-yellow-600 text-lg">Global Stock 🌏</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">ทำไมต้อง IntelliPort?</h2>
            <p className="mt-4 text-lg text-slate-600">เราผสานทฤษฎีการเงินสมัยใหม่เข้ากับปัญญาประดิษฐ์</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="p-8 bg-yellow-50 rounded-2xl border border-yellow-100 hover:shadow-xl hover:shadow-yellow-100 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white text-yellow-500 border border-yellow-200 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:bg-yellow-400 group-hover:text-white transition-all">🧠</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Genetic Algorithm</h3>
              <p className="text-slate-600 leading-relaxed">
                ใช้อัลกอริทึมเชิงพันธุกรรมในการคัดเลือกสัดส่วนการลงทุนที่ดีที่สุด (Optimization) ผ่านการจำลองนับหมื่นรูปแบบ
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-yellow-50 rounded-2xl border border-yellow-100 hover:shadow-xl hover:shadow-yellow-100 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white text-yellow-500 border border-yellow-200 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:bg-yellow-400 group-hover:text-white transition-all">🛡️</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Risk Management</h3>
              <p className="text-slate-600 leading-relaxed">
                บริหารความเสี่ยงอย่างแม่นยำด้วยค่า Beta (Market Risk) ตามทฤษฎี Modern Portfolio Theory
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-yellow-50 rounded-2xl border border-yellow-100 hover:shadow-xl hover:shadow-yellow-100 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white text-yellow-500 border border-yellow-200 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:bg-yellow-400 group-hover:text-white transition-all">📊</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Advanced Models</h3>
              <p className="text-slate-600 leading-relaxed">
                ยกระดับความแม่นยำด้วย Black-Litterman Model ที่ผสมผสานมุมมองตลาดเข้ากับข้อมูลสถิติ
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-yellow-500/10 blur-[120px] rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">ขั้นตอนการทำงาน</h2>
            <p className="mt-4 text-slate-400">จากข้อมูลของคุณ สู่พอร์ตการลงทุนระดับมืออาชีพ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center relative">

            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-700 -z-10"></div>

            {/* Step 1 */}
            <div className="relative group">
              <div className="w-24 h-24 mx-auto bg-slate-800 border-4 border-slate-700 rounded-full flex items-center justify-center text-3xl font-bold mb-6 relative z-10 group-hover:border-yellow-400 transition-colors">1</div>
              <h3 className="text-xl font-bold mb-2">กำหนดเป้าหมาย</h3>
              <p className="text-slate-400 text-sm">ระบุเงินลงทุนและ<br/>ความเสี่ยงที่รับได้</p>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="w-24 h-24 mx-auto bg-slate-800 border-4 border-yellow-600 rounded-full flex items-center justify-center text-3xl font-bold mb-6 relative z-10 shadow-[0_0_20px_rgba(202,138,4,0.3)] group-hover:border-yellow-400 transition-colors">2</div>
              <h3 className="text-xl font-bold mb-2">Black-Litterman</h3>
              <p className="text-slate-400 text-sm">ปรับปรุงผลตอบแทน<br/>คาดหวังให้สมดุล</p>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="w-24 h-24 mx-auto bg-slate-800 border-4 border-yellow-400 rounded-full flex items-center justify-center text-3xl font-bold mb-6 relative z-10 shadow-[0_0_20px_rgba(250,204,21,0.4)] group-hover:scale-105 transition-transform">3</div>
              <h3 className="text-xl font-bold mb-2 text-yellow-400">Genetic Algo</h3>
              <p className="text-slate-400 text-sm">จำลองการจัดพอร์ต<br/>เพื่อหาสัดส่วนที่ดีที่สุด</p>
            </div>

            {/* Step 4 */}
            <div className="relative group">
              <div className="w-24 h-24 mx-auto bg-yellow-400 border-4 border-yellow-200 rounded-full flex items-center justify-center text-3xl font-bold mb-6 relative z-10 text-slate-900 shadow-[0_0_30px_rgba(250,204,21,0.5)]">4</div>
              <h3 className="text-xl font-bold mb-2 text-yellow-400">ได้พอร์ตลงทุน</h3>
              <p className="text-slate-200 text-sm">พร้อมกราฟแสดงผล<br/>และคำแนะนำ</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/plan" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-900 bg-yellow-400 rounded-full hover:bg-yellow-300 transition-colors shadow-lg shadow-yellow-500/20">
              เริ่มใช้งานระบบทันที
            </Link>
          </div>
        </div>
      </section>


      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <span className="text-xl font-bold text-slate-900">IntelliPort</span>
            <p className="text-sm text-slate-500 mt-2">
              โครงงานวิทยาการคอมพิวเตอร์ (CS-01)<br/>
              คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสวนดุสิต
            </p>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <p>Developed by: Thanawin & Peerapat</p>
            <p>Advisor: Dr.Chawalsak</p>
          </div>
        </div>
      </footer>

    </div>
  );
}