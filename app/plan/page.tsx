'use client'; 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs'; 
import { Sliders, DollarSign, Clock, AlertCircle, X } from 'lucide-react';

export default function PlanPage() {
  const router = useRouter();
  const { userId } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  
  type CalcMode = 'normal' | 'find_duration' | 'find_budget';
  const [calcMode, setCalcMode] = useState<CalcMode>('normal');
  
  // 🌟 เพิ่ม State สำหรับจำนวนหุ้น (กำหนดค่าเริ่มต้นเป็น 5)
  const [numStocks, setNumStocks] = useState('5');
  
  // 🌟 เพิ่ม State สำหรับหุ้นบังคับเลือก
  const [availableStocks, setAvailableStocks] = useState<string[]>([]);
  const [lockedStocks, setLockedStocks] = useState<string[]>([]);
  const [stockSearch, setStockSearch] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/admin/assets')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setAvailableStocks(data.data.map((t: string) => t.replace('.BK', '')));
        }
      })
      .catch(err => console.error("Failed to fetch assets", err));
  }, []);
  
  const [formData, setFormData] = useState({
    portfolioName: '',
    initialAmount: '',
    targetAmount: '',
    duration: '',
    riskLevel: 'medium',
  });

  const [errors, setErrors] = useState({
    portfolioName: '',
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
    const newErrors = { portfolioName: '', initialAmount: '', targetAmount: '', duration: '', numStocks: '' };

    if (!formData.portfolioName.trim()) {
      newErrors.portfolioName = 'กรุณาระบุชื่อพอร์ตการลงทุน'; isValid = false;
    }

    if (calcMode !== 'find_budget') {
      if (!formData.initialAmount) {
        newErrors.initialAmount = 'กรุณาระบุเงินลงทุนเริ่มต้น'; isValid = false;
      } else if (Number(getRawNumber(formData.initialAmount)) <= 0) {
        newErrors.initialAmount = 'เงินลงทุนต้องมากกว่า 0 บาท'; isValid = false;
      }
    }

    if (!formData.targetAmount) {
      newErrors.targetAmount = 'กรุณาระบุเป้าหมายเงินเก็บ'; isValid = false;
    }

    if (calcMode !== 'find_duration') {
      if (!formData.duration) {
        newErrors.duration = 'กรุณาระบุระยะเวลาลงทุน'; isValid = false;
      }
    }

    // 🌟 ตรวจสอบจำนวนหุ้น (ต้องไม่น้อยกว่า 3 ตามที่ตั้งค่าใน Backend)
    if (!numStocks || Number(numStocks) < 3) {
      newErrors.numStocks = 'ต้องระบุอย่างน้อย 3 ตัว'; isValid = false;
    } else if (lockedStocks.length > Number(numStocks)) {
      newErrors.numStocks = `ล็อกหุ้นได้ไม่เกิน ${numStocks} ตัว`; isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const expectedReturn = formData.riskLevel === 'low' ? 0.05 : formData.riskLevel === 'medium' ? 0.08 : 0.12;

  const getCalculatedDuration = () => {
    if (calcMode === 'find_duration' && formData.initialAmount && formData.targetAmount) {
      const p = Number(getRawNumber(formData.initialAmount));
      const t = Number(getRawNumber(formData.targetAmount));
      if (p > 0 && t > p) {
        return Math.ceil(Math.log(t / p) / Math.log(1 + expectedReturn));
      }
    }
    return formData.duration;
  };

  const getCalculatedBudget = () => {
    if (calcMode === 'find_budget' && formData.duration && formData.targetAmount) {
      const t = Number(getRawNumber(formData.targetAmount));
      const d = Number(getRawNumber(formData.duration));
      if (t > 0 && d > 0) {
        return Math.ceil(t / Math.pow(1 + expectedReturn, d));
      }
    }
    return formData.initialAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      alert("กรุณาเข้าสู่ระบบก่อนสร้างแผนการลงทุนครับ");
      router.push('/login'); 
      return; 
    }

    if (validateForm()) {
      setIsLoading(true);

      const finalDuration = Number(getCalculatedDuration() || 0);
      const finalBudget = Number(getRawNumber(String(getCalculatedBudget() || '0')));
      const finalTarget = Number(getRawNumber(formData.targetAmount));

      const cleanData = {
        ...formData,
        initialAmount: finalBudget,
        targetAmount: finalTarget,
        duration: finalDuration,
        numStocks: Number(numStocks)
      };

      let targetBeta = 1.0;
      if (formData.riskLevel === 'low') targetBeta = 0.8;
      if (formData.riskLevel === 'medium') targetBeta = 1.0;
      if (formData.riskLevel === 'high') targetBeta = 1.2;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - finalDuration);

      try {
        const response = await fetch('http://localhost:8000/api/optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            portfolio_name: formData.portfolioName,
            target_beta: targetBeta,
            max_stocks: Number(numStocks),
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            locked_stocks: lockedStocks,
            
            // 🌟 เพิ่ม 2 บรรทัดนี้ส่งไปให้ Backend เพื่อ Insert ลง PostgreSQL 🌟
            budget: finalBudget,
            target_amount: finalTarget,
            duration_years: finalDuration
          })
        });

        if (!response.ok) {
          throw new Error('การตอบสนองจากเซิร์ฟเวอร์ผิดพลาด');
        }

        const data = await response.json();

        if (data.status === 'success') {
          localStorage.setItem('userPlan', JSON.stringify(cleanData));
          localStorage.setItem('portfolioResult', JSON.stringify(data)); 
          router.push(`/dashboard/${data.portfolio_id}`); 
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
    if (field === 'portfolioName') {
      setFormData({ ...formData, [field]: value });
      if (errors[field as keyof typeof errors]) {
        setErrors({ ...errors, [field]: '' });
      }
      return;
    }
    const formattedValue = formatNumber(value);
    setFormData({ ...formData, [field]: formattedValue });
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFEF5] dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] selection:bg-yellow-400 selection:text-black">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Design Your Wealth</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">กำหนดเป้าหมายของคุณ แล้วให้ AI ช่วยออกแบบเส้นทางสู่ความสำเร็จ</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-10 px-8 shadow-2xl shadow-yellow-100/50 dark:shadow-slate-900/50 rounded-2xl border border-yellow-100 dark:border-slate-800">
          
          {/* 🌟 Goal Calculator Mode Selector */}
          <div className="mb-8 flex flex-col sm:flex-row gap-3 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button" onClick={() => {setCalcMode('normal'); setErrors({...errors, initialAmount: '', duration: ''});}}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${calcMode === 'normal' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
            >
              <Sliders className="w-4 h-4" /> กำหนดเองทั้งหมด
            </button>
            <button
              type="button" onClick={() => {setCalcMode('find_budget'); setErrors({...errors, initialAmount: ''});}}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${calcMode === 'find_budget' ? 'bg-yellow-400 text-slate-900 shadow-sm shadow-yellow-400/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
            >
              <DollarSign className="w-4 h-4" /> คำนวณหาเงินลงทุนตั้งต้น
            </button>
            <button
              type="button" onClick={() => {setCalcMode('find_duration'); setErrors({...errors, duration: ''});}}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${calcMode === 'find_duration' ? 'bg-yellow-400 text-slate-900 shadow-sm shadow-yellow-400/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
            >
              <Clock className="w-4 h-4" /> คำนวณหาระยะเวลา (ปี)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            
            {/* ชื่อพอร์ต */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">ชื่อพอร์ตการลงทุน</label>
              <input
                type="text"
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 transition-all outline-none bg-slate-50 dark:bg-slate-800/50 group-hover:bg-white dark:group-hover:bg-slate-800 text-slate-900 dark:text-white font-medium ${errors.portfolioName ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-700 focus:border-yellow-400 focus:ring-yellow-200'}`}
                placeholder="เช่น กองทุนเกษียณอายุ, พอร์ตลูกรัก" value={formData.portfolioName} onChange={(e) => handleChange('portfolioName', e.target.value)} disabled={isLoading}
              />
              {errors.portfolioName && <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.portfolioName}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* เงินลงทุนเริ่มต้น */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  เงินลงทุนเริ่มต้น {calcMode === 'find_budget' && <span className="text-yellow-600 dark:text-yellow-500 ml-1">(AI คำนวณให้)</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">฿</span>
                  <input
                    type="text" inputMode="numeric"
                    className={`w-full pl-8 pr-4 py-3 rounded-lg border focus:ring-2 transition-all outline-none bg-slate-50 dark:bg-slate-800/50 group-hover:bg-white dark:group-hover:bg-slate-800 text-slate-900 dark:text-white font-medium ${errors.initialAmount ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-700 focus:border-yellow-400 focus:ring-yellow-200'} ${calcMode === 'find_budget' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 font-bold' : ''}`}
                    placeholder="100,000" 
                    value={calcMode === 'find_budget' ? (getCalculatedBudget() ? formatNumber(String(getCalculatedBudget())) : '') : formData.initialAmount} 
                    onChange={(e) => handleChange('initialAmount', e.target.value)} 
                    disabled={isLoading || calcMode === 'find_budget'}
                  />
                </div>
                {errors.initialAmount && <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.initialAmount}</p>}
              </div>

              {/* เป้าหมาย */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">เป้าหมายที่ต้องการ</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">฿</span>
                  <input
                    type="text" inputMode="numeric"
                    className={`w-full pl-8 pr-4 py-3 rounded-lg border focus:ring-2 transition-all outline-none bg-slate-50 dark:bg-slate-800/50 group-hover:bg-white dark:group-hover:bg-slate-800 text-slate-900 dark:text-white font-medium ${errors.targetAmount ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-700 focus:border-yellow-400 focus:ring-yellow-200'}`}
                    placeholder="150,000" value={formData.targetAmount} onChange={(e) => handleChange('targetAmount', e.target.value)} disabled={isLoading}
                  />
                </div>
                {errors.targetAmount && <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.targetAmount}</p>}
              </div>

              {/* ระยะเวลา */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  ระยะเวลา (ปี) {calcMode === 'find_duration' && <span className="text-yellow-600 dark:text-yellow-500 ml-1">(AI คำนวณให้)</span>}
                </label>
                <input
                  type="text" inputMode="numeric" maxLength={2}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 transition-all outline-none bg-slate-50 dark:bg-slate-800/50 group-hover:bg-white dark:group-hover:bg-slate-800 text-slate-900 dark:text-white font-medium ${errors.duration ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-700 focus:border-yellow-400 focus:ring-yellow-200'} ${calcMode === 'find_duration' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 font-bold' : ''}`}
                  placeholder="5" 
                  value={calcMode === 'find_duration' ? (getCalculatedDuration() || '') : formData.duration} 
                  onChange={(e) => handleChange('duration', e.target.value)} 
                  disabled={isLoading || calcMode === 'find_duration'}
                />
                {errors.duration && <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.duration}</p>}
              </div>

              {/* 🌟 ช่องใส่จำนวนหุ้น (ใหม่) */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">จำนวนหุ้นในพอร์ต (ตัว)</label>
                <input
                  type="number" min="3"
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 transition-all outline-none bg-slate-50 dark:bg-slate-800/50 group-hover:bg-white dark:group-hover:bg-slate-800 text-slate-900 dark:text-white font-medium ${errors.numStocks ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-700 focus:border-yellow-400 focus:ring-yellow-200'}`}
                  placeholder="5" value={numStocks} onChange={(e) => setNumStocks(e.target.value)} disabled={isLoading}
                />
                <p className="mt-1 text-[10px] text-slate-400">* ขั้นต่ำ 3 ตัว</p>
                {errors.numStocks && <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.numStocks}</p>}
              </div>
            </div>

            {/* 🌟 ช่องใส่หุ้นที่ต้องการบังคับให้อยู่ในพอร์ต (ใหม่) */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                ล็อกหุ้นที่ต้องมีในพอร์ต <span className="text-slate-400 font-normal ml-1">(เลือกได้สูงสุด {numStocks || 0} ตัว)</span>
              </label>
              
              {/* Selected Stocks */}
              {lockedStocks.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {lockedStocks.map(stock => (
                    <span key={stock} className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400 font-bold rounded-full text-sm shadow-sm border border-yellow-200 dark:border-yellow-800">
                      {stock}
                      <button type="button" onClick={() => setLockedStocks(lockedStocks.filter(s => s !== stock))} className="hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded-full p-0.5 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 transition-all outline-none bg-slate-50 dark:bg-slate-800/50 group-hover:bg-white dark:group-hover:bg-slate-800 text-slate-900 dark:text-white font-medium border-slate-200 dark:border-slate-700 focus:border-yellow-400 focus:ring-yellow-200"
                  placeholder="พิมพ์ค้นหาหุ้น (เช่น TRUE, PTT)"
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value.toUpperCase())}
                  disabled={isLoading || lockedStocks.length >= Number(numStocks)}
                />
                
                {/* Search Dropdown */}
                {stockSearch && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-56 overflow-y-auto overflow-x-hidden">
                    {availableStocks
                      .filter(s => s.includes(stockSearch) && !lockedStocks.includes(s))
                      .map(stock => (
                        <button
                          key={stock}
                          type="button"
                          className="w-full text-left px-5 py-3 hover:bg-yellow-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                          onClick={() => {
                            if (lockedStocks.length < Number(numStocks)) {
                              setLockedStocks([...lockedStocks, stock]);
                              setStockSearch('');
                            }
                          }}
                        >
                          {stock}
                        </button>
                      ))}
                    {availableStocks.filter(s => s.includes(stockSearch) && !lockedStocks.includes(s)).length === 0 && (
                      <div className="px-5 py-4 text-slate-500 text-sm text-center bg-slate-50 dark:bg-slate-800/50">ไม่พบข้อมูลหุ้นที่ค้นหา</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ระดับความเสี่ยง */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-lg font-bold text-slate-800 dark:text-white mb-4">ระดับความเสี่ยงที่ยอมรับได้ (Risk Appetite)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Conservative */}
                <div onClick={() => !isLoading && setFormData({...formData, riskLevel: 'low'})} className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${formData.riskLevel === 'low' ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20 shadow-sm scale-[1.02]' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-green-200 dark:hover:border-green-800'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-slate-800 dark:text-white">Conservative</span>{formData.riskLevel === 'low' && <span className="text-green-600 dark:text-green-400">✓</span>}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">เน้นความปลอดภัย เงินต้นอยู่ครบ</p><div className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs font-bold rounded">Beta &lt; 1</div>
                </div>
                {/* Moderate */}
                <div onClick={() => !isLoading && setFormData({...formData, riskLevel: 'medium'})} className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${formData.riskLevel === 'medium' ? 'border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/20 shadow-sm scale-[1.02]' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-yellow-200 dark:hover:border-yellow-800'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-slate-800 dark:text-white">Moderate</span>{formData.riskLevel === 'medium' && <span className="text-yellow-600 dark:text-yellow-400">✓</span>}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">เติบโตปานกลาง รับความผันผวนได้บ้าง</p><div className="inline-block px-2 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 text-xs font-bold rounded">Beta ≈ 1</div>
                </div>
                {/* Aggressive */}
                <div onClick={() => !isLoading && setFormData({...formData, riskLevel: 'high'})} className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${formData.riskLevel === 'high' ? 'border-red-500 bg-red-50/50 dark:bg-red-900/20 shadow-sm scale-[1.02]' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-red-200 dark:hover:border-red-800'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-slate-800 dark:text-white">Aggressive</span>{formData.riskLevel === 'high' && <span className="text-red-600 dark:text-red-400">✓</span>}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">เน้นกำไรสูงสุด รับความผันผวนได้สูง</p><div className="inline-block px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 text-xs font-bold rounded">Beta &gt; 1</div>
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