import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Plane, Calendar, Users, ChevronRight, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../contexts/AppContext';

export default function Trips() {
  const { t } = useTranslation();
  const { trips, refreshTrips } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    month_gregorian: '',
    month_hijri: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      setFormData({ name: '', month_gregorian: '', month_hijri: '', notes: '' });
      refreshTrips();
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTripDetails = async (id: number) => {
    try {
      const res = await fetch(`/api/trips/${id}`);
      const data = await res.json();
      setSelectedTrip(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{t('trips')}</h2>
          <p className="text-slate-500">إدارة وتنظيم رحلات العمرة</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="neumorph-btn px-6 py-3 rounded-2xl flex items-center gap-2 text-blue-600 font-bold"
        >
          <Plus size={20} />
          {t('add_trip')}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <motion.div
            key={trip.id}
            whileHover={{ y: -5 }}
            className="glass-card p-6 cursor-pointer group"
            onClick={() => fetchTripDetails(trip.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-blue-100 text-blue-600">
                <Plane size={24} />
              </div>
              <div className="flex gap-2">
                {trip.visa_issued ? (
                  <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-600 text-[10px] font-bold">تأشيرات</span>
                ) : (
                  <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-400 text-[10px] font-bold">تأشيرات</span>
                )}
                {trip.flight_added ? (
                  <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-600 text-[10px] font-bold">طيران</span>
                ) : (
                  <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-400 text-[10px] font-bold">طيران</span>
                )}
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{trip.name}</h3>
            <div className="space-y-2 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{trip.month_gregorian} / {trip.month_hijri}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} />
                <span>{trip.men_count + trip.women_count + trip.children_count + trip.infants_count} معتمر</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-400">تم الإنشاء: {new Date(trip.created_at).toLocaleDateString('ar-EG')}</span>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Trip Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-lg p-8"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-6">{t('add_trip')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">{t('trip_name')}</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl neumorph-inset focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{t('month_gregorian')}</label>
                  <input 
                    type="text" 
                    value={formData.month_gregorian}
                    onChange={(e) => setFormData({...formData, month_gregorian: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl neumorph-inset focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{t('month_hijri')}</label>
                  <input 
                    type="text" 
                    value={formData.month_hijri}
                    onChange={(e) => setFormData({...formData, month_hijri: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl neumorph-inset focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">{t('notes')}</label>
                <textarea 
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
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

      {/* Trip Details Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="p-8 border-b border-white/20 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">{selectedTrip.name}</h3>
                <p className="text-slate-500">{selectedTrip.month_gregorian} / {selectedTrip.month_hijri}</p>
              </div>
              <button 
                onClick={() => setSelectedTrip(null)}
                className="p-2 rounded-xl hover:bg-slate-100"
              >
                <Plus className="rotate-45" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                  <p className="text-xs text-blue-600 font-bold mb-1">{t('men')}</p>
                  <p className="text-2xl font-bold text-blue-800">{selectedTrip.men_count}</p>
                </div>
                <div className="p-4 rounded-2xl bg-pink-50 border border-pink-100 text-center">
                  <p className="text-xs text-pink-600 font-bold mb-1">{t('women')}</p>
                  <p className="text-2xl font-bold text-pink-800">{selectedTrip.women_count}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                  <p className="text-xs text-emerald-600 font-bold mb-1">{t('children')}</p>
                  <p className="text-2xl font-bold text-emerald-800">{selectedTrip.children_count}</p>
                </div>
                <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100 text-center">
                  <p className="text-xs text-violet-600 font-bold mb-1">{t('infants')}</p>
                  <p className="text-2xl font-bold text-violet-800">{selectedTrip.infants_count}</p>
                </div>
              </div>

              <h4 className="text-lg font-bold text-slate-800 mb-4">قائمة المعتمرين ({selectedTrip.pilgrims?.length || 0})</h4>
              <div className="space-y-2">
                {selectedTrip.pilgrims?.map((p: any) => (
                  <div key={p.id} className="p-4 rounded-xl bg-white/50 border border-white/20 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{p.full_name}</p>
                      <p className="text-xs text-slate-500">المندوب: {p.agent_name || 'غير محدد'}</p>
                    </div>
                    <div className="flex gap-2">
                      {p.passport_type === 'Physical' ? (
                        <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-600 text-[10px] font-bold">جواز جلد</span>
                      ) : (
                        <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-600 text-[10px] font-bold">واتساب</span>
                      )}
                    </div>
                  </div>
                ))}
                {(!selectedTrip.pilgrims || selectedTrip.pilgrims.length === 0) && (
                  <div className="text-center py-8 text-slate-400 italic">لا يوجد معتمرين في هذه الرحلة بعد</div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
