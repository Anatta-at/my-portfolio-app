// app/plan/page.tsx
'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PlanPage() {
  const router = useRouter();
  
  // 1. เก็บข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    initialAmount: '',
    targetAmount: '',
    duration: '',
    riskLevel: 'medium',
  });

  // 2. สร้างตัวแปรเก็บ Error ของแต่ละช่อง (ถ้ามีค่า = มี error)
  const [errors, setErrors] = useState({
    initialAmount: '',
    targetAmount: '',
    duration: '',
  });

  // ฟังก์ชันตรวจสอบความถูกต้อง (Validation)
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      initialAmount: '',
      targetAmount: '',
      duration: '',
    };

    // เช็คเงินต้น
    if (!formData.initialAmount) {
      newErrors.initialAmount = 'กรุณาระบุเงินลงทุนเริ่มต้น';
      isValid = false;
    } else if (Number(formData.initialAmount) <= 0) {
      newErrors.initialAmount = 'เงินลงทุนต้องมากกว่า 0 บาท';
      isValid = false;
    }

    // เช็คเป้าหมาย
    if (!formData.targetAmount) {
      newErrors.targetAmount = 'กรุณาระบุเป้าหมายเงินเก็บ';
      isValid = false;
    }

    // เช็คระยะเวลา
    if (!formData.duration) {
      newErrors.duration = 'กรุณาระบุระยะเวลาลงทุน';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // เรียกใช้ฟังก์ชันตรวจสอบก่อน
    if (validateForm()) {
      // ถ้าผ่าน ถึงจะบันทึกและเปลี่ยนหน้า
      localStorage.setItem('userPlan', JSON.stringify(formData));
      router.push('/dashboard'); 
    } else {
      // ถ้าไม่ผ่าน ให้ขยับจอไปหาจุดที่ผิด (Optional)
      // alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
  };

  // ฟังก์ชันช่วยเวลาพิมพ์ (พิมพ์ปุ๊บ ลบ Error ทิ้งปั๊บ)
  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // ล้าง Error ของช่องนั้นๆ
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Design Your Wealth
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            กำหนดเป้าหมายของคุณ แล้วให้ AI ช่วยออกแบบเส้นทางสู่ความสำเร็จ
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl py-10 px-8 shadow-2xl shadow-blue-100/50 rounded-2xl border border-white/50">
          {/* ใส่ noValidate เพื่อปิดกล่องแจ้งเตือนเดิมของ Browser ทิ้งไปซะ */}
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* --- ช่องเงินต้น --- */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">เงินลงทุนเริ่มต้น</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">฿</span>
                  <input
                    type="number"
                    className={`w-full pl-8 pr-4 py-3 rounded-lg border focus:ring-2 transition-all outline-none bg-slate-50 group-hover:bg-white text-slate-900 
                      ${errors.initialAmount 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50' // ถ้าผิด: สีแดง
                        : 'border-slate-200 focus:border-transparent focus:ring-blue-500' // ถ้าถูก: สีปกติ
                      }`}
                    placeholder="100,000"
                    value={formData.initialAmount}
                    onChange={(e) => handleChange('initialAmount', e.target.value)}
                  />
                </div>
                {/* ข้อความแจ้งเตือนสีแดง (แสดงเมื่อมี Error) */}
                {errors.initialAmount && (
                  <p className="mt-1 text-xs text-red-500 font-medium animate-pulse">⚠️ {errors.initialAmount}</p>
                )}
              </div>

              {/* --- ช่องเป้าหมาย --- */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">เป้าหมายที่ต้องการ</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">฿</span>
                  <input
                    type="number"
                    className={`w-full pl-8 pr-4 py-3 rounded-lg border focus:ring-2 transition-all outline-none bg-slate-50 group-hover:bg-white text-slate-900 
                      ${errors.targetAmount 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50' 
                        : 'border-slate-200 focus:border-transparent focus:ring-green-500'
                      }`}
                    placeholder="1,000,000"
                    value={formData.targetAmount}
                    onChange={(e) => handleChange('targetAmount', e.target.value)}
                  />
                </div>
                {errors.targetAmount && (
                  <p className="mt-1 text-xs text-red-500 font-medium animate-pulse">⚠️ {errors.targetAmount}</p>
                )}
              </div>

              {/* --- ช่องระยะเวลา --- */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">ระยะเวลา (ปี)</label>
                <input
                  type="number"
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 transition-all outline-none bg-slate-50 group-hover:bg-white text-slate-900 
                    ${errors.duration 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50' 
                      : 'border-slate-200 focus:border-transparent focus:ring-indigo-500'
                    }`}
                  placeholder="5"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                />
                {errors.duration && (
                  <p className="mt-1 text-xs text-red-500 font-medium animate-pulse">⚠️ {errors.duration}</p>
                )}
              </div>
            </div>

            {/* ส่วนเลือกความเสี่ยง (เหมือนเดิม) */}
            <div className="pt-6 border-t border-slate-100">
              <label className="block text-lg font-bold text-slate-800 mb-4">ระดับความเสี่ยงที่ยอมรับได้ (Risk Appetite)</label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Low Risk */}
                <div 
                  onClick={() => setFormData({...formData, riskLevel: 'low'})}
                  className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    formData.riskLevel === 'low' 
                    ? 'border-green-500 bg-green-50/50 shadow-md scale-105' 
                    : 'border-slate-100 bg-white hover:border-green-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-slate-800">Conservative</span>
                    {formData.riskLevel === 'low' && <span className="text-green-600">✓</span>}
                  </div>
                  <p className="text-sm text-slate-500 mb-2">เน้นความปลอดภัย เงินต้นอยู่ครบ</p>
                  <div className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Beta &lt; 1</div>
                </div>

                {/* Medium Risk */}
                <div 
                  onClick={() => setFormData({...formData, riskLevel: 'medium'})}
                  className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    formData.riskLevel === 'medium' 
                    ? 'border-yellow-400 bg-yellow-50/50 shadow-md scale-105' 
                    : 'border-slate-100 bg-white hover:border-yellow-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-slate-800">Moderate</span>
                    {formData.riskLevel === 'medium' && <span className="text-yellow-600">✓</span>}
                  </div>
                  <p className="text-sm text-slate-500 mb-2">เติบโตปานกลาง รับความผันผวนได้บ้าง</p>
                  <div className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">Beta ≈ 1</div>
                </div>

                {/* High Risk */}
                <div 
                  onClick={() => setFormData({...formData, riskLevel: 'high'})}
                  className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    formData.riskLevel === 'high' 
                    ? 'border-red-500 bg-red-50/50 shadow-md scale-105' 
                    : 'border-slate-100 bg-white hover:border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-slate-800">Aggressive</span>
                    {formData.riskLevel === 'high' && <span className="text-red-600">✓</span>}
                  </div>
                  <p className="text-sm text-slate-500 mb-2">เน้นกำไรสูงสุด รับความผันผวนได้สูง</p>
                  <div className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">Beta &gt; 1</div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-0.5 transition-all duration-200 text-lg"
            >
              🚀 ประมวลผลและสร้างพอร์ตการลงทุน
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}