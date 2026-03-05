'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs'; 

export default function PlanPage() {
  const router = useRouter();
  const { userId } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  
  // 🌟 เพิ่ม State สำหรับจำนวนหุ้น (กำหนดค่าเริ่มต้นเป็น 5)
  const [numStocks, setNumStocks] = useState('5');
  
  const [formData, setFormData] = useState({
    initialAmount: '',
    targetAmount: '',
    duration: '',
    riskLevel: 'medium',
  });

  const [errors, setErrors] = useState({
    initialAmount: '',
    targetAmount: '',
    duration: '',
    numStocks: '', // 🌟 เพิ่มส่วนแสดง Error ของจำนวนหุ้น
  });

  const formatNumber = (value: string) => {
    const numberOnly = value.replace(/[^0-9]/g, '');
    return numberOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getRawNumber = (value: string) => {
    return value.replace(/,/g, '');
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { initialAmount: '', targetAmount: '', duration: '', numStocks: '' };

    if (!formData.initialAmount) {
      newErrors.initialAmount = 'กรุณาระบุเงินลงทุนเริ่มต้น'; isValid = false;
    } else if (Number(getRawNumber(formData.initialAmount)) <= 0) {
      newErrors.initialAmount = 'เงินลงทุนต้องมากกว่า 0 บาท'; isValid = false;
    }

    if (!formData.targetAmount) {
      newErrors.targetAmount = 'กรุณาระบุเป้าหมายเงินเก็บ'; isValid = false;
    }

    if (!formData.duration) {
      newErrors.duration = 'กรุณาระบุระยะเวลาลงทุน'; isValid = false;
    }

    // 🌟 ตรวจสอบจำนวนหุ้น (ต้องไม่น้อยกว่า 3 ตามที่ตั้งค่าใน Backend)
    if (!numStocks || Number(numStocks) < 3) {
      newErrors.numStocks = 'ต้องระบุอย่างน้อย 3 ตัว'; isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      alert("กรุณาเข้าสู่ระบบก่อนสร้างแผนการลงทุนครับ");
      router.push('/sign-in'); 
      return; 
    }

    if (validateForm()) {
      setIsLoading(true);

      const durationNum = Number(getRawNumber(formData.duration));
      const cleanData = {
        ...formData,
        initialAmount: Number(getRawNumber(formData.initialAmount)),
        targetAmount: Number(getRawNumber(formData.targetAmount)),
        duration: durationNum,
        numStocks: Number(numStocks)
      };

      let targetBeta = 1.0;
      if (formData.riskLevel === 'low') targetBeta = 0.8;
      if (formData.riskLevel === 'medium') targetBeta = 1.0;
      if (formData.riskLevel === 'high') targetBeta = 1.2;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - durationNum);

      try {
        const response = await fetch('http://localhost:8000/api/optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            target_beta: targetBeta,
            max_stocks: Number(numStocks),
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            
            // 🌟 เพิ่ม 2 บรรทัดนี้ส่งไปให้ Backend เพื่อ Insert ลง PostgreSQL 🌟
            budget: Number(getRawNumber(formData.initialAmount)),
            duration_years: durationNum
          })
        });

        if (!response.ok) {
          throw new Error('การตอบสนองจากเซิร์ฟเวอร์ผิดพลาด');
        }

        const data = await response.json();

        if (data.status === 'success') {
          localStorage.setItem('userPlan', JSON.stringify(cleanData));
          localStorage.setItem('portfolioResult', JSON.stringify(data)); 
          router.push('/dashboard'); 
        } else {
          alert('เกิดข้อผิดพลาดในการคำนวณ: ' + data.message);
        }

      } catch (error) {
        console.error("API Error:", error);
        alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ประมวลผลได้');
      } finally {
        setIsLoading(false); 
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    const formattedValue = formatNumber(value);
    setFormData({ ...formData, [field]: formattedValue });
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFEF5] py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] selection:bg-yellow-400 selection:text-black">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Design Your Wealth</h1>
          <p className="mt-4 text-lg text-slate-600">กำหนดเป้าหมายของคุณ แล้วให้ AI ช่วยออกแบบเส้นทางสู่ความสำเร็จ</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl py-10 px-8 shadow-2xl shadow-yellow-100/50 rounded-2xl border border-yellow-100">
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* เงินลงทุนเริ่มต้น */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">เงินลงทุนเริ่มต้น</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">฿</span>
                  <input
                    type="text" inputMode="numeric"
                    className={`w-full pl-8 pr-4 py-3 rounded-lg border focus:ring-2 transition-all outline-none bg-slate-50 group-hover:bg-white text-slate-900 font-medium ${errors.initialAmount ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50' : 'border-slate-200 focus:border-yellow-400 focus:ring-yellow-200'}`}
                    placeholder="100,000" value={formData.initialAmount} onChange={(e) => handleChange('initialAmount', e.target.value)} disabled={isLoading}
                  />
                </div>
                {errors.initialAmount && <p className="mt-1 text-xs text-red-500 font-medium">⚠️ {errors.initialAmount}</p>}
              </div>

              {/* เป้าหมาย */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">เป้าหมายที่ต้องการ</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">฿</span>
                  <input
                    type="text" inputMode="numeric"
                    className={`w-full pl-8 pr-4 py-3 rounded-lg border focus:ring-2 transition-all outline-none bg-slate-50 group-hover:bg-white text-slate-900 font-medium ${errors.targetAmount ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50' : 'border-slate-200 focus:border-yellow-400 focus:ring-yellow-200'}`}
                    placeholder="150,000" value={formData.targetAmount} onChange={(e) => handleChange('targetAmount', e.target.value)} disabled={isLoading}
                  />
                </div>
                {errors.targetAmount && <p className="mt-1 text-xs text-red-500 font-medium">⚠️ {errors.targetAmount}</p>}
              </div>

              {/* ระยะเวลา */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">ระยะเวลา (ปี)</label>
                <input
                  type="text" inputMode="numeric" maxLength={2}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 transition-all outline-none bg-slate-50 group-hover:bg-white text-slate-900 font-medium ${errors.duration ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50' : 'border-slate-200 focus:border-yellow-400 focus:ring-yellow-200'}`}
                  placeholder="5" value={formData.duration} onChange={(e) => handleChange('duration', e.target.value)} disabled={isLoading}
                />
                {errors.duration && <p className="mt-1 text-xs text-red-500 font-medium">⚠️ {errors.duration}</p>}
              </div>

              {/* 🌟 ช่องใส่จำนวนหุ้น (ใหม่) */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">จำนวนหุ้นในพอร์ต (ตัว)</label>
                <input
                  type="number" min="3"
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 transition-all outline-none bg-slate-50 group-hover:bg-white text-slate-900 font-medium ${errors.numStocks ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50' : 'border-slate-200 focus:border-yellow-400 focus:ring-yellow-200'}`}
                  placeholder="5" value={numStocks} onChange={(e) => setNumStocks(e.target.value)} disabled={isLoading}
                />
                <p className="mt-1 text-[10px] text-slate-400">* ขั้นต่ำ 3 ตัว แนะนำ 7-12 ตัว</p>
                {errors.numStocks && <p className="mt-1 text-xs text-red-500 font-medium">⚠️ {errors.numStocks}</p>}
              </div>
            </div>

            {/* ระดับความเสี่ยง */}
            <div className="pt-6 border-t border-slate-100">
              <label className="block text-lg font-bold text-slate-800 mb-4">ระดับความเสี่ยงที่ยอมรับได้ (Risk Appetite)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Conservative */}
                <div onClick={() => !isLoading && setFormData({...formData, riskLevel: 'low'})} className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${formData.riskLevel === 'low' ? 'border-green-500 bg-green-50/50 shadow-sm scale-[1.02]' : 'border-slate-100 bg-white hover:border-green-200'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-slate-800">Conservative</span>{formData.riskLevel === 'low' && <span className="text-green-600">✓</span>}
                  </div>
                  <p className="text-sm text-slate-500 mb-2">เน้นความปลอดภัย เงินต้นอยู่ครบ</p><div className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Beta &lt; 1</div>
                </div>
                {/* Moderate */}
                <div onClick={() => !isLoading && setFormData({...formData, riskLevel: 'medium'})} className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${formData.riskLevel === 'medium' ? 'border-yellow-400 bg-yellow-50/50 shadow-sm scale-[1.02]' : 'border-slate-100 bg-white hover:border-yellow-200'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-slate-800">Moderate</span>{formData.riskLevel === 'medium' && <span className="text-yellow-600">✓</span>}
                  </div>
                  <p className="text-sm text-slate-500 mb-2">เติบโตปานกลาง รับความผันผวนได้บ้าง</p><div className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">Beta ≈ 1</div>
                </div>
                {/* Aggressive */}
                <div onClick={() => !isLoading && setFormData({...formData, riskLevel: 'high'})} className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${formData.riskLevel === 'high' ? 'border-red-500 bg-red-50/50 shadow-sm scale-[1.02]' : 'border-slate-100 bg-white hover:border-red-200'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-slate-800">Aggressive</span>{formData.riskLevel === 'high' && <span className="text-red-600">✓</span>}
                  </div>
                  <p className="text-sm text-slate-500 mb-2">เน้นกำไรสูงสุด รับความผันผวนได้สูง</p><div className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">Beta &gt; 1</div>
                </div>
              </div>
            </div>

            {/* ปุ่ม Submit */}
            <button
              type="submit" disabled={isLoading}
              className={`w-full mt-8 font-bold py-4 px-8 rounded-xl shadow-lg transform transition-all duration-200 text-lg flex justify-center items-center ${isLoading ? 'bg-slate-300 text-slate-500 cursor-wait shadow-none' : 'bg-yellow-400 hover:bg-yellow-300 text-slate-900 hover:shadow-yellow-400/50 hover:-translate-y-0.5 shadow-yellow-400/30'}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังประมวลผลด้วย AI...
                </>
              ) : ("ประมวลผลและสร้างพอร์ตการลงทุน")}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}