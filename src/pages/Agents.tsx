import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, UserRound, Phone, Users, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../contexts/AppContext';

export default function Agents() {
  const { t } = useTranslation();
  const { agents, refreshAgents } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      setFormData({ name: '' });
      refreshAgents();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{t('agents')}</h2>
          <p className="text-slate-500">إدارة المناديب والوكلاء المسؤولين عن المعتمرين</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="neumorph-btn px-6 py-3 rounded-2xl flex items-center gap-2 text-blue-600 font-bold"
        >
          <Plus size={20} />
          {t('add_agent')}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <motion.div
            key={agent.id}
            whileHover={{ y: -5 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
                <UserRound size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{agent.name}</h3>
                <p className="text-xs text-slate-500">منذ: {new Date(agent.created_at).toLocaleDateString('ar-EG')}</p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-white/50 border border-white/20 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-600">
                <Users size={18} />
                <span className="text-sm font-bold">{agent.pilgrim_count} معتمر</span>
              </div>
              <button className="text-blue-500 text-xs font-bold hover:underline">عرض القائمة</button>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-lg p-8"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-6">{t('add_agent')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">{t('full_name')}</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl neumorph-inset focus:outline-none"
                />
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
