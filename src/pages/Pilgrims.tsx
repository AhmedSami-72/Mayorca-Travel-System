import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, User, FileText, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../contexts/AppContext';

export default function Pilgrims() {
  const { t } = useTranslation();
  const { trips, agents, refreshStats } = useAppContext();
  const [pilgrims, setPilgrims] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    agent_id: '',
    trip_id: '',
    passport_type: 'Physical',
    passport_image_exists: false,
    data_complete: false,
    notes: ''
  });

  const fetchPilgrims = async () => {
    try {
      const res = await fetch('/api/pilgrims');
      const data = await res.json();
      setPilgrims(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPilgrims();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/pilgrims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      setFormData({
        full_name: '',
        agent_id: '',
        trip_id: '',
        passport_type: 'Physical',
        passport_image_exists: false,
        data_complete: false,
        notes: ''
      });
      fetchPilgrims();
      refreshStats();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{t('pilgrims')}</h2>
          <p className="text-slate-500">إدارة بيانات المعتمرين وجوازات السفر</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="neumorph-btn px-6 py-3 rounded-2xl flex items-center gap-2 text-blue-600 font-bold"
        >
          <Plus size={20} />
          {t('add_pilgrim')}
        </button>
      </header>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-white/30 border-b border-white/20">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-700">{t('full_name')}</th>
              <th className="px-6 py-4 font-bold text-slate-700">{t('trips')}</th>
              <th className="px-6 py-4 font-bold text-slate-700">{t('agent')}</th>
              <th className="px-6 py-4 font-bold text-slate-700">{t('passport_type')}</th>
              <th className="px-6 py-4 font-bold text-slate-700">الحالة</th>
              <th className="px-6 py-4 font-bold text-slate-700">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {pilgrims.map((p: any) => (
              <tr key={p.id} className="hover:bg-white/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <User size={20} />
                    </div>
                    <span className="font-bold text-slate-800">{p.full_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{p.trip_name || '---'}</td>
                <td className="px-6 py-4 text-slate-600">{p.agent_name || '---'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    p.passport_type === 'Physical' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {p.passport_type === 'Physical' ? t('physical_passport') : t('whatsapp_image')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {p.passport_image_exists ? (
                      <CheckCircle2 size={18} className="text-emerald-500" title="الصورة موجودة" />
                    ) : (
                      <AlertCircle size={18} className="text-orange-400" title="الصورة ناقصة" />
                    )}
                    {p.data_complete ? (
                      <CheckCircle2 size={18} className="text-blue-500" title="البيانات مكتملة" />
                    ) : (
                      <AlertCircle size={18} className="text-slate-300" title="البيانات غير مكتملة" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pilgrims.length === 0 && (
          <div className="text-center py-12 text-slate-400 italic">لا يوجد معتمرين مسجلين بعد</div>
        )}
      </div>

      {/* Add Pilgrim Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-lg p-8"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-6">{t('add_pilgrim')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">{t('full_name')}</label>
                <input 
                  required
                  type="text" 
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl neumorph-inset focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{t('trips')}</label>
                  <select 
                    required
                    value={formData.trip_id}
                    onChange={(e) => setFormData({...formData, trip_id: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl neumorph-inset focus:outline-none bg-transparent"
                  >
                    <option value="">اختر الرحلة</option>
                    {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{t('agent')}</label>
                  <select 
                    required
                    value={formData.agent_id}
                    onChange={(e) => setFormData({...formData, agent_id: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl neumorph-inset focus:outline-none bg-transparent"
                  >
                    <option value="">اختر المندوب</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">{t('passport_type')}</label>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, passport_type: 'Physical'})}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                      formData.passport_type === 'Physical' ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {t('physical_passport')}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, passport_type: 'WhatsApp'})}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                      formData.passport_type === 'WhatsApp' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {t('whatsapp_image')}
                  </button>
                </div>
              </div>
              <div className="flex gap-6 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.passport_image_exists}
                    onChange={(e) => setFormData({...formData, passport_image_exists: e.target.checked})}
                    className="w-5 h-5 rounded-md border-slate-300 text-blue-500 focus:ring-blue-400"
                  />
                  <span className="text-sm text-slate-600">{t('passport_exists')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.data_complete}
                    onChange={(e) => setFormData({...formData, data_complete: e.target.checked})}
                    className="w-5 h-5 rounded-md border-slate-300 text-blue-500 focus:ring-blue-400"
                  />
                  <span className="text-sm text-slate-600">{t('data_complete')}</span>
                </label>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-200"
                >
                  {t('save')}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
