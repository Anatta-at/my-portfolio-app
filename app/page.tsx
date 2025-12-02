// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white selection:bg-blue-500 selection:text-white font-sans">
      
      {/* =========================================
          PART 1: HERO SECTION (ส่วนหัวที่ทำไปแล้ว)
      ========================================= */}
      <div className="relative overflow-hidden bg-slate-50 pt-20 pb-16 lg:pt-32 lg:pb-24">
        
        {/* Grid Pattern & Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] opacity-60"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,transparent,white)]"></div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[100px] animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-blue-200 bg-white/80 backdrop-blur-sm text-blue-600 text-sm font-medium mb-6 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-ping"></span>
                Project CS-01: AI Powered Investment
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                The Future of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient">
                  Intelligent Portfolio
                </span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed bg-white/50 backdrop-blur-sm p-2 rounded-lg">
                ปฏิวัติการจัดพอร์ตการลงทุนด้วยพลังของ <strong>Genetic Algorithm</strong> และ <strong>Black-Litterman Model</strong> ออกแบบแผนการเงินที่แม่นยำที่สุดเพื่อคุณโดยเฉพาะ
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/plan" className="group relative px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-200 overflow-hidden">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  🚀 เริ่มต้นสร้างพอร์ตฟรี
                </Link>
                <Link href="/dashboard" className="px-8 py-4 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                  ดูตัวอย่างระบบ
                </Link>
              </div>
            </div>

            {/* Right Visual (3D Floating) */}
            <div className="relative lg:h-[600px] flex items-center justify-center perspective-1000">
               <div className="relative w-full max-w-md aspect-[4/3] bg-gradient-to-br from-white/90 to-white/50 backdrop-blur-2xl border border-white/80 rounded-2xl shadow-2xl shadow-blue-500/10 p-6 transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-transform duration-500 ease-out animate-[float_6s_ease-in-out_infinite]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="text-xs font-mono text-slate-400">AI_GENETIC_ALGO_V1.0</div>
                </div>
                <div className="flex items-end justify-between h-40 gap-2 mb-6">
                  <div className="w-full bg-blue-100 rounded-t-lg h-[40%] relative group"><div className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg h-0 group-hover:h-full transition-all duration-500"></div></div>
                  <div className="w-full bg-indigo-100 rounded-t-lg h-[65%] relative group"><div className="absolute bottom-0 w-full bg-indigo-500 rounded-t-lg h-0 group-hover:h-full transition-all duration-700 delay-100"></div></div>
                  <div className="w-full bg-purple-100 rounded-t-lg h-[85%] relative group"><div className="absolute bottom-0 w-full bg-purple-500 rounded-t-lg h-0 group-hover:h-full transition-all duration-1000 delay-200"></div></div>
                  <div className="w-full bg-cyan-100 rounded-t-lg h-[50%] relative group"><div className="absolute bottom-0 w-full bg-cyan-500 rounded-t-lg h-0 group-hover:h-full transition-all duration-500 delay-150"></div></div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full w-[70%] bg-gradient-to-r from-blue-500 to-purple-500"></div></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Expected Return</span><span className="font-bold text-green-600">+12.5% 📈</span></div>
                </div>
                <div className="absolute -right-8 top-10 bg-white p-4 rounded-xl shadow-xl border border-white/50 animate-[bounce_3s_infinite]"><div className="text-xs text-slate-400 mb-1">Risk Level</div><div className="font-bold text-slate-800 text-lg">Medium 🛡️</div></div>
                <div className="absolute -left-8 bottom-10 bg-white p-4 rounded-xl shadow-xl border border-white/50 animate-[bounce_4s_infinite] delay-700"><div className="text-xs text-slate-400 mb-1">Assets</div><div className="font-bold text-blue-600 text-lg">Global Stock 🌏</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          PART 2: FEATURES SECTION (เพิ่มใหม่)
      ========================================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">ทำไมต้อง IntelliPort?</h2>
            <p className="mt-4 text-lg text-slate-600">เราผสานทฤษฎีการเงินสมัยใหม่เข้ากับปัญญาประดิษฐ์</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🧠</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Genetic Algorithm</h3>
              <p className="text-slate-600 leading-relaxed">
                ใช้อัลกอริทึมเชิงพันธุกรรมในการคัดเลือกสัดส่วนการลงทุนที่ดีที่สุด (Optimization) ผ่านการจำลองนับหมื่นรูปแบบ
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🛡️</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Risk Management</h3>
              <p className="text-slate-600 leading-relaxed">
                บริหารความเสี่ยงอย่างแม่นยำด้วยค่า Beta (Market Risk) ตามทฤษฎี Modern Portfolio Theory
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">📊</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Advanced Models</h3>
              <p className="text-slate-600 leading-relaxed">
                ยกระดับความแม่นยำด้วย Black-Litterman Model ที่ผสมผสานมุมมองตลาดเข้ากับข้อมูลสถิติ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          PART 3: HOW IT WORKS (เพิ่มใหม่)
      ========================================= */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">ขั้นตอนการทำงาน</h2>
            <p className="mt-4 text-blue-200">จากข้อมูลของคุณ สู่พอร์ตการลงทุนระดับมืออาชีพ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center relative">
            {/* เส้นเชื่อม (Connector Line) - ซ่อนในมือถือ */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-700 -z-10"></div>

            {/* Step 1 */}
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-slate-800 border-4 border-slate-700 rounded-full flex items-center justify-center text-3xl font-bold mb-6 relative z-10">1</div>
              <h3 className="text-xl font-bold mb-2">กำหนดเป้าหมาย</h3>
              <p className="text-slate-400 text-sm">ระบุเงินลงทุนและ<br/>ความเสี่ยงที่รับได้</p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-slate-800 border-4 border-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mb-6 relative z-10 shadow-[0_0_20px_rgba(37,99,235,0.5)]">2</div>
              <h3 className="text-xl font-bold mb-2">Black-Litterman</h3>
              <p className="text-slate-400 text-sm">ปรับปรุงผลตอบแทน<br/>คาดหวังให้สมดุล</p>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-slate-800 border-4 border-purple-600 rounded-full flex items-center justify-center text-3xl font-bold mb-6 relative z-10 shadow-[0_0_20px_rgba(147,51,234,0.5)]">3</div>
              <h3 className="text-xl font-bold mb-2">Genetic Algo</h3>
              <p className="text-slate-400 text-sm">จำลองการจัดพอร์ต<br/>เพื่อหาสัดส่วนที่ดีที่สุด</p>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-green-600 border-4 border-green-400 rounded-full flex items-center justify-center text-3xl font-bold mb-6 relative z-10">4</div>
              <h3 className="text-xl font-bold mb-2">ได้พอร์ตลงทุน</h3>
              <p className="text-green-200 text-sm">พร้อมกราฟแสดงผล<br/>และคำแนะนำ</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/plan" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-900 bg-white rounded-full hover:bg-blue-50 transition-colors">
              เริ่มใช้งานระบบทันที
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================
          PART 4: FOOTER (เพิ่มใหม่)
      ========================================= */}
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