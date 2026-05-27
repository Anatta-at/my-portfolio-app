'use client'; 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs'; 
import { Sliders, DollarSign, Clock, AlertCircle, X, ArrowRight } from 'lucide-react';

export default function PlanPage() {
  const router = useRouter();
  const { userId } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  
  const [mainTab, setMainTab] = useState<'template' | 'custom'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateBudget, setTemplateBudget] = useState('');

  type CalcMode = 'normal' | 'find_duration' | 'find_budget';
  const [calcMode, setCalcMode] = useState<CalcMode>('normal');
  const [numStocks, setNumStocks] = useState('5');
  const [maxWeight, setMaxWeight] = useState(40);
  const [availableStocks, setAvailableStocks] = useState<string[]>([]);
  const [lockedStocks, setLockedStocks] = useState<string[]>([]);
  const [stockSearch, setStockSearch] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/admin/assets')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setAvailableStocks(data.data.filter((a: any) => a.is_active).map((a: any) => a.ticker.replace('.BK', '')));
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
    numStocks: '',
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
      const cleanData = { ...formData, initialAmount: finalBudget, targetAmount: finalTarget, duration: finalDuration, numStocks: Number(numStocks) };
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
            user_id: userId, portfolio_name: formData.portfolioName, target_beta: targetBeta, max_stocks: Number(numStocks),
            max_weight_per_asset: maxWeight / 100,
            start_date: startDate.toISOString().split('T')[0], end_date: endDate.toISOString().split('T')[0],
            locked_stocks: lockedStocks, budget: finalBudget, target_amount: finalTarget, duration_years: finalDuration
          })
        });
        if (!response.ok) throw new Error('การตอบสนองจากเซิร์ฟเวอร์ผิดพลาด');
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
      if (errors[field as keyof typeof errors]) setErrors({ ...errors, [field]: '' });
      return;
    }
    const formattedValue = formatNumber(value);
    setFormData({ ...formData, [field]: formattedValue });
    if (errors[field as keyof typeof errors]) setErrors({ ...errors, [field]: '' });
  };

  const riskLabels: Record<string, { label: string; desc: string; beta: string }> = {
    low: { label: 'ความเสี่ยงต่ำ', desc: 'ปลอดภัย เงินต้นอยู่ครบ', beta: 'β < 1' },
    medium: { label: 'ความเสี่ยงปานกลาง', desc: 'เติบโตสมดุล', beta: 'β ≈ 1' },
    high: { label: 'ความเสี่ยงสูง', desc: 'เน้นกำไรสูงสุด', beta: 'β > 1' },
  };

  const templates = [
    {
      id: 'conservative',
      name: 'พอร์ตความมั่นคง',
      desc: 'เน้นรักษาเงินต้น ลงทุนในหุ้นขนาดใหญ่ที่มีความมั่นคงและปันผลสม่ำเสมอ',
      beta: 0.8,
      return: 0.06,
      volatility: 0.10,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      stocks: [
        { Ticker: 'BBL.BK', Weight: 0.30, Beta: 0.7 },
        { Ticker: 'ADVANC.BK', Weight: 0.30, Beta: 0.8 },
        { Ticker: 'PTT.BK', Weight: 0.20, Beta: 0.9 },
        { Ticker: 'SCC.BK', Weight: 0.20, Beta: 0.9 }
      ]
    },
    {
      id: 'moderate',
      name: 'พอร์ตสมดุล',
      desc: 'กระจายความเสี่ยงอย่างสมดุล ผสมผสานหุ้นปันผลและหุ้นเติบโต',
      beta: 1.0,
      return: 0.08,
      volatility: 0.15,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-500/10',
      borderColor: 'border-amber-200 dark:border-amber-800',
      textColor: 'text-amber-700 dark:text-amber-400',
      stocks: [
        { Ticker: 'AOT.BK', Weight: 0.30, Beta: 1.1 },
        { Ticker: 'CPALL.BK', Weight: 0.20, Beta: 1.0 },
        { Ticker: 'BDMS.BK', Weight: 0.20, Beta: 0.8 },
        { Ticker: 'GULF.BK', Weight: 0.20, Beta: 1.1 },
        { Ticker: 'KBANK.BK', Weight: 0.10, Beta: 1.0 }
      ]
    },
    {
      id: 'aggressive',
      name: 'พอร์ตเติบโตสูง',
      desc: 'เน้นสร้างผลตอบแทนระยะยาว รับความผันผวนได้สูง ลงทุนในหุ้นเติบโต',
      beta: 1.2,
      return: 0.12,
      volatility: 0.22,
      color: 'bg-rose-500',
      bgColor: 'bg-rose-50 dark:bg-rose-500/10',
      borderColor: 'border-rose-200 dark:border-rose-800',
      textColor: 'text-rose-700 dark:text-rose-400',
      stocks: [
        { Ticker: 'DELTA.BK', Weight: 0.30, Beta: 1.5 },
        { Ticker: 'EA.BK', Weight: 0.20, Beta: 1.4 },
        { Ticker: 'MTC.BK', Weight: 0.20, Beta: 1.2 },
        { Ticker: 'KCE.BK', Weight: 0.20, Beta: 1.3 },
        { Ticker: 'JMT.BK', Weight: 0.10, Beta: 1.2 }
      ]
    }
  ];

  const handleTemplateSubmit = async (templateId: string) => {
    if (!userId) {
      alert("กรุณาเข้าสู่ระบบก่อนสร้างแผนการลงทุนครับ");
      router.push('/login'); 
      return; 
    }
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    const budgetRaw = Number(getRawNumber(templateBudget));
    if (budgetRaw <= 0) {
      alert("กรุณาระบุเงินลงทุนให้ถูกต้อง (มากกว่า 0 บาท)");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/portfolios/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          portfolio_name: template.name,
          target_beta: template.beta,
          budget: budgetRaw,
          target_amount: null,
          duration_years: 5,
          expected_return: template.return,
          portfolio_volatility: template.volatility,
          portfolio_data: template.stocks
        })
      });
      if (!response.ok) throw new Error('การตอบสนองจากเซิร์ฟเวอร์ผิดพลาด');
      const data = await response.json();
      if (data.status === 'success') {
        router.push(`/dashboard/${data.portfolio_id}`); 
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึก: ' + data.message);
      }
    } catch (error) {
      console.error("API Error:", error);
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ประมวลผลได้');
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8] dark:bg-[#111110] py-12 px-4 sm:px-6 lg:px-8 selection:bg-amber-100 selection:text-amber-900">
      <div className="max-w-6xl mx-auto">

        <div className="mb-10">
          <h1 className="text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight">สร้างแผนลงทุน</h1>
          <p className="mt-2 text-stone-500 dark:text-stone-400 text-sm">กำหนดเป้าหมาย แล้วให้ AI ออกแบบพอร์ตที่ดีที่สุดให้คุณ</p>
        </div>

        <div className="mb-8 border-b border-stone-200 dark:border-stone-800 flex gap-6 sm:gap-10">
          <button
            onClick={() => setMainTab('template')}
            className={`pb-4 border-b-2 font-bold text-sm sm:text-base transition-colors ${
              mainTab === 'template' ? 'border-amber-500 text-stone-900 dark:text-stone-100' : 'border-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
            }`}
          >
            พอร์ตสำเร็จรูป (แนะนำ)
          </button>
          <button
            onClick={() => setMainTab('custom')}
            className={`pb-4 border-b-2 font-bold text-sm sm:text-base transition-colors ${
              mainTab === 'custom' ? 'border-amber-500 text-stone-900 dark:text-stone-100' : 'border-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
            }`}
          >
            จัดพอร์ตด้วย AI (กำหนดเอง)
          </button>
        </div>

        {mainTab === 'template' && (
          <div className="space-y-6">
            <p className="text-stone-500 dark:text-stone-400 text-sm">เลือกแผนการลงทุนที่เหมาะกับคุณ กรอกเงินลงทุนแล้วเริ่มได้เลย</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {templates.map(t => (
                <div key={t.id} className={`bg-white dark:bg-[#1A1A19] border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${selectedTemplate === t.id ? t.borderColor + ' ring-2 ring-amber-500/20' : 'border-stone-200 dark:border-stone-800'}`}>
                  <div className={`px-5 py-4 ${t.bgColor} border-b ${t.borderColor} flex justify-between items-center cursor-pointer`} onClick={() => setSelectedTemplate(t.id)}>
                    <h3 className={`font-black text-lg ${t.textColor}`}>{t.name}</h3>
                    <div className="bg-white dark:bg-[#111110] text-xs px-2 py-1 rounded shadow-sm font-bold border border-stone-200 dark:border-stone-700">Beta {t.beta}</div>
                  </div>
                  <div className="p-5 space-y-4">
                    <p className="text-sm text-stone-500 dark:text-stone-400 min-h-[40px]">{t.desc}</p>
                    <div className="flex justify-between items-center text-sm border-t border-stone-100 dark:border-stone-800 pt-3">
                      <span className="text-stone-500">ผลตอบแทนคาดหวัง</span>
                      <span className="font-bold text-emerald-600">~{(t.return * 100).toFixed(0)}% / ปี</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-stone-500">ความผันผวน</span>
                      <span className="font-bold text-stone-700 dark:text-stone-300">{(t.volatility * 100).toFixed(0)}%</span>
                    </div>
                    
                    <div className="pt-4 mt-2">
                      {selectedTemplate === t.id ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 uppercase tracking-wider">ระบุเงินลงทุนตั้งต้น (บาท)</label>
                            <input 
                              type="text" 
                              value={templateBudget}
                              onChange={(e) => setTemplateBudget(formatNumber(e.target.value))}
                              placeholder="เช่น 10,000"
                              className="w-full px-4 py-2 bg-stone-50 dark:bg-[#111110] border border-stone-200 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-shadow text-stone-900 dark:text-stone-100"
                            />
                          </div>
                          <button 
                            onClick={() => handleTemplateSubmit(t.id)}
                            disabled={isLoading || !templateBudget}
                            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors flex justify-center items-center disabled:opacity-50"
                          >
                            {isLoading ? 'กำลังประมวลผล...' : 'ยืนยันและสร้างพอร์ต'}
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setSelectedTemplate(t.id)}
                          className="w-full py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold rounded-lg transition-colors"
                        >
                          เลือกพอร์ตนี้
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mainTab === 'custom' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar — Summary Panel */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="lg:sticky lg:top-20 space-y-4">
              
              <div className="bg-white dark:bg-[#1A1A19] rounded-lg border border-stone-200 dark:border-stone-800 p-5">
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">สรุปแผน</div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">ชื่อพอร์ต</span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100 truncate ml-2 max-w-[140px]">{formData.portfolioName || '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">เงินลงทุน</span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">
                      {calcMode === 'find_budget' ? (getCalculatedBudget() ? `฿${formatNumber(String(getCalculatedBudget()))}` : '—') : (formData.initialAmount ? `฿${formData.initialAmount}` : '—')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">เป้าหมาย</span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">{formData.targetAmount ? `฿${formData.targetAmount}` : '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">ระยะเวลา</span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">
                      {calcMode === 'find_duration' ? (getCalculatedDuration() ? `${getCalculatedDuration()} ปี` : '—') : (formData.duration ? `${formData.duration} ปี` : '—')}
                    </span>
                  </div>
                  <div className="border-t border-stone-100 dark:border-stone-800 pt-3 flex justify-between text-sm">
                    <span className="text-stone-500">ความเสี่ยง</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">{riskLabels[formData.riskLevel].label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">จำนวนหุ้น</span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">{numStocks} ตัว</span>
                  </div>
                  {lockedStocks.length > 0 && (
                    <div className="border-t border-stone-100 dark:border-stone-800 pt-3">
                      <span className="text-stone-500 text-sm">ล็อกหุ้น:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {lockedStocks.map(s => (
                          <span key={s} className="text-xs px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded font-semibold">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-amber-600 dark:bg-amber-600 rounded-lg p-5 text-white">
                <div className="text-xs font-bold text-amber-200 uppercase tracking-wider mb-2">โหมดคำนวณ</div>
                <div className="text-sm font-semibold">
                  {calcMode === 'normal' && 'กำหนดเองทั้งหมด'}
                  {calcMode === 'find_budget' && 'AI คำนวณเงินลงทุนตั้งต้น'}
                  {calcMode === 'find_duration' && 'AI คำนวณระยะเวลา'}
                </div>
              </div>

            </div>
          </div>

          {/* Form Panel */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white dark:bg-[#1A1A19] rounded-lg border border-stone-200 dark:border-stone-800 p-6 sm:p-8">
              
              {/* Mode Selector */}
              <div className="mb-8 flex flex-wrap gap-2">
                {[
                  { mode: 'normal' as CalcMode, icon: Sliders, label: 'กำหนดเอง' },
                  { mode: 'find_budget' as CalcMode, icon: DollarSign, label: 'หาเงินลงทุน' },
                  { mode: 'find_duration' as CalcMode, icon: Clock, label: 'หาระยะเวลา' },
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode} type="button"
                    onClick={() => { setCalcMode(mode); setErrors({...errors, initialAmount: '', duration: ''}); }}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${calcMode === mode ? 'bg-amber-600 dark:bg-amber-600 text-white dark:text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'}`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                
                {/* ชื่อพอร์ต */}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">ชื่อพอร์ตการลงทุน</label>
                  <input type="text" className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all outline-none bg-[#FAFAF8] dark:bg-[#111110] text-stone-900 dark:text-stone-100 ${errors.portfolioName ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 focus:border-amber-400'}`}
                    placeholder="เช่น กองทุนเกษียณอายุ" value={formData.portfolioName} onChange={(e) => handleChange('portfolioName', e.target.value)} disabled={isLoading}
                  />
                  {errors.portfolioName && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.portfolioName}</p>}
                </div>

                {/* เงินลงทุน */}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    เงินลงทุนเริ่มต้น (฿) {calcMode === 'find_budget' && <span className="text-amber-600 text-xs ml-1">AI คำนวณ</span>}
                  </label>
                  <input type="text" inputMode="numeric"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all outline-none bg-[#FAFAF8] dark:bg-[#111110] text-stone-900 dark:text-stone-100 ${errors.initialAmount ? 'border-red-400' : 'border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 focus:border-amber-400'} ${calcMode === 'find_budget' ? 'bg-amber-50 dark:bg-amber-900/10 font-bold text-amber-700 dark:text-amber-400' : ''}`}
                    placeholder="100,000" 
                    value={calcMode === 'find_budget' ? (getCalculatedBudget() ? formatNumber(String(getCalculatedBudget())) : '') : formData.initialAmount} 
                    onChange={(e) => handleChange('initialAmount', e.target.value)} disabled={isLoading || calcMode === 'find_budget'}
                  />
                  {errors.initialAmount && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.initialAmount}</p>}
                </div>

                {/* เป้าหมาย */}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">เป้าหมายเงินเก็บ (฿)</label>
                  <input type="text" inputMode="numeric"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all outline-none bg-[#FAFAF8] dark:bg-[#111110] text-stone-900 dark:text-stone-100 ${errors.targetAmount ? 'border-red-400' : 'border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 focus:border-amber-400'}`}
                    placeholder="150,000" value={formData.targetAmount} onChange={(e) => handleChange('targetAmount', e.target.value)} disabled={isLoading}
                  />
                  {errors.targetAmount && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.targetAmount}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* ระยะเวลา */}
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      ระยะเวลา (ปี) {calcMode === 'find_duration' && <span className="text-amber-600 text-xs ml-1">AI คำนวณ</span>}
                    </label>
                    <input type="text" inputMode="numeric" maxLength={2}
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all outline-none bg-[#FAFAF8] dark:bg-[#111110] text-stone-900 dark:text-stone-100 ${errors.duration ? 'border-red-400' : 'border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 focus:border-amber-400'} ${calcMode === 'find_duration' ? 'bg-amber-50 dark:bg-amber-900/10 font-bold text-amber-700 dark:text-amber-400' : ''}`}
                      placeholder="5" value={calcMode === 'find_duration' ? (getCalculatedDuration() || '') : formData.duration} onChange={(e) => handleChange('duration', e.target.value)} disabled={isLoading || calcMode === 'find_duration'}
                    />
                    {errors.duration && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.duration}</p>}
                  </div>
                  {/* จำนวนหุ้น */}
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">จำนวนหุ้น (ขั้นต่ำ 3)</label>
                    <input type="number" min="3"
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all outline-none bg-[#FAFAF8] dark:bg-[#111110] text-stone-900 dark:text-stone-100 ${errors.numStocks ? 'border-red-400' : 'border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 focus:border-amber-400'}`}
                      placeholder="5" value={numStocks} onChange={(e) => setNumStocks(e.target.value)} disabled={isLoading}
                    />
                    {errors.numStocks && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.numStocks}</p>}
                  </div>
                </div>

                {/* ตั้งค่าขั้นสูง: จำกัดน้ำหนักสูงสุด */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">
                      <span className="flex items-center gap-1.5">
                        ตั้งค่าขั้นสูง: สัดส่วนสูงสุดต่อหุ้น
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border border-stone-200 dark:border-stone-700">Diversification</span>
                      </span>
                    </label>
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-500">{maxWeight}%</span>
                  </div>
                  <input type="range" min="20" max="100" step="5"
                    className="w-full accent-amber-500 cursor-pointer"
                    value={maxWeight} onChange={(e) => setMaxWeight(Number(e.target.value))} disabled={isLoading}
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 dark:text-stone-500 mt-1 font-medium">
                    <span>กระจายความเสี่ยง (20%)</span>
                    <span>เทหมดหน้าตัก (100%)</span>
                  </div>
                </div>

                {/* ล็อกหุ้น */}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    ล็อกหุ้นในพอร์ต <span className="text-stone-400 font-normal">(ไม่บังคับ, สูงสุด {numStocks || 0} ตัว)</span>
                  </label>
                  {lockedStocks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {lockedStocks.map(stock => (
                        <span key={stock} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-semibold rounded text-xs border border-amber-200 dark:border-amber-800">
                          {stock}
                          <button type="button" onClick={() => setLockedStocks(lockedStocks.filter(s => s !== stock))} className="hover:bg-amber-100 dark:hover:bg-amber-800 rounded p-0.5"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 text-sm outline-none bg-[#FAFAF8] dark:bg-[#111110] text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 focus:border-amber-400"
                      placeholder="พิมพ์ค้นหาหุ้น เช่น TRUE, PTT" value={stockSearch} onChange={(e) => setStockSearch(e.target.value.toUpperCase())} disabled={isLoading || lockedStocks.length >= Number(numStocks)}
                    />
                    {stockSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#1A1A19] border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {availableStocks.filter(s => s.includes(stockSearch) && !lockedStocks.includes(s)).map(stock => (
                          <button key={stock} type="button" className="w-full text-left px-4 py-2.5 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm transition-colors border-b border-stone-100 dark:border-stone-800 last:border-0"
                            onClick={() => { if (lockedStocks.length < Number(numStocks)) { setLockedStocks([...lockedStocks, stock]); setStockSearch(''); } }}
                          >{stock}</button>
                        ))}
                        {availableStocks.filter(s => s.includes(stockSearch) && !lockedStocks.includes(s)).length === 0 && (
                          <div className="px-4 py-3 text-stone-400 text-sm text-center">ไม่พบหุ้น</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Risk Level — Horizontal Radio */}
                <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">ระดับความเสี่ยง</label>
                  <div className="flex gap-3">
                    {(['low', 'medium', 'high'] as const).map((level) => (
                      <button key={level} type="button" disabled={isLoading}
                        onClick={() => setFormData({...formData, riskLevel: level})}
                        className={`flex-1 py-4 px-3 rounded-xl border text-center transition-all ${
                          formData.riskLevel === level 
                            ? (level === 'low' ? 'border-emerald-500 bg-emerald-500 text-white shadow-md' :
                               level === 'medium' ? 'border-amber-500 bg-amber-500 text-white shadow-md' :
                               'border-rose-500 bg-rose-500 text-white shadow-md')
                            : `border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 ${
                                level === 'low' ? 'hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400' :
                                level === 'medium' ? 'hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-400' :
                                'hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-400'
                              }`
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="font-bold text-sm sm:text-base mb-1">{riskLabels[level].label}</div>
                        <div className={`text-xs ${formData.riskLevel === level ? 'text-white/90' : 'text-stone-400'}`}>{riskLabels[level].beta}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={isLoading}
                  className={`w-full mt-4 font-semibold py-3 px-8 rounded-lg text-sm flex justify-center items-center transition-all ${isLoading ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-wait' : 'bg-amber-600 dark:bg-amber-600 text-white dark:text-white hover:bg-amber-700 dark:hover:bg-amber-700'}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      กำลังประมวลผล...
                    </>
                  ) : (
                    <>ประมวลผลและสร้างพอร์ต <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
        )}

      </div>

      {isLoading && (
        <div className="fixed inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-[#1A1A19] p-6 rounded-2xl shadow-xl border border-stone-100 dark:border-stone-800 flex flex-col items-center max-w-sm w-full mx-4">
            <div className="relative w-16 h-16 mb-4">
              <svg className="animate-spin w-full h-full text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 mb-1">กำลังประมวลผล...</h3>
            <p className="text-stone-500 dark:text-stone-400 text-sm text-center">รอสักครู่ ระบบกำลังจัดการข้อมูลพอร์ตของคุณ</p>
          </div>
        </div>
      )}
    </main>
  );
}