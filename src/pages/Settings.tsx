import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Globe, Database, Shield, Bell, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const [password, setPassword] = useState('');
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.password) setPassword(data.password);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const toggleLanguage = async () => {
    const nextLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'language', value: nextLang })
    });
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) return;
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'password', value: newPassword })
      });
      setPassword(newPassword);
      setNewPassword('');
      setIsEditingPassword(false);
      alert('تم تحديث كلمة المرور بنجاح');
    } catch (e) {
      console.error(e);
    }
  };

  const handleBackup = () => {
    window.location.href = '/api/settings/backup';
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">{t('settings')}</h2>
        <p className="text-slate-500">تخصيص إعدادات النظام واللغة والأمان</p>
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

        <div className="glass-card p-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Database size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">نسخ احتياطي</h3>
              <p className="text-slate-500">إنشاء نسخة احتياطية من قاعدة البيانات</p>
            </div>
          </div>
          <button 
            onClick={handleBackup}
            className="neumorph-btn px-8 py-3 rounded-xl font-bold text-emerald-600"
          >
            تصدير DB
          </button>
        </div>

        <div className="glass-card p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
                <Shield size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">الأمان</h3>
                <p className="text-slate-500">تغيير كلمة مرور النظام</p>
              </div>
            </div>
            {!isEditingPassword ? (
              <button 
                onClick={() => setIsEditingPassword(true)}
                className="neumorph-btn px-8 py-3 rounded-xl font-bold text-violet-600"
              >
                تعديل
              </button>
            ) : (
              <button 
                onClick={() => setIsEditingPassword(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                إلغاء
              </button>
            )}
          </div>
          
          {isEditingPassword && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="pt-4 border-t border-white/20 flex gap-4"
            >
              <input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="كلمة المرور الجديدة"
                className="flex-1 px-4 py-3 rounded-xl neumorph-inset focus:outline-none"
              />
              <button 
                onClick={handleUpdatePassword}
                className="px-6 py-3 bg-violet-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-violet-200"
              >
                <Save size={18} />
                حفظ
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
