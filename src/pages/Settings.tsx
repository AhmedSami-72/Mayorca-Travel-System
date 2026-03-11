import React from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Globe, Database, Shield, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">{t('settings')}</h2>
        <p className="text-slate-500">تخصيص إعدادات النظام واللغة</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <div className="glass-card p-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Globe size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">لغة النظام</h3>
              <p className="text-slate-500">تغيير لغة الواجهة (العربية / الإنجليزية)</p>
            </div>
          </div>
          <button 
            onClick={toggleLanguage}
            className="neumorph-btn px-8 py-3 rounded-xl font-bold text-blue-600"
          >
            {i18n.language === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>

        <div className="glass-card p-8 flex items-center justify-between opacity-60">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Database size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">نسخ احتياطي</h3>
              <p className="text-slate-500">إنشاء نسخة احتياطية من قاعدة البيانات</p>
            </div>
          </div>
          <button className="neumorph-btn px-8 py-3 rounded-xl font-bold text-emerald-600">
            تصدير DB
          </button>
        </div>

        <div className="glass-card p-8 flex items-center justify-between opacity-60">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <Shield size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">الأمان</h3>
              <p className="text-slate-500">تغيير كلمة مرور النظام</p>
            </div>
          </div>
          <button className="neumorph-btn px-8 py-3 rounded-xl font-bold text-violet-600">
            تعديل
          </button>
        </div>
      </div>
    </div>
  );
}
