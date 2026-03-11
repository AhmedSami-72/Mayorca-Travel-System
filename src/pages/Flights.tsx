import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Plane, Hash, MapPin, Clock, Calendar, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../contexts/AppContext';
import { parseFlightText } from '../utils';

export default function Flights() {
  const { t } = useTranslation();
  const { trips, refreshStats } = useAppContext();
  const [flights, setFlights] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    trip_id: '',
    raw_text: '',
    airline: '',
    flight_number: '',
    route: '',
    departure_date: '',
    departure_time: '',
    arrival_time: '',
    description: '',
    reference_code: ''
  });

  const fetchFlights = async () => {
    try {
      const res = await fetch('/api/flights');
      const data = await res.json();
      setFlights(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleRawTextChange = (text: string) => {
    const parsed = parseFlightText(text);
    if (parsed) {
      setFormData({
        ...formData,
        raw_text: text,
        airline: parsed.airline,
        flight_number: parsed.flightNumber,
        route: parsed.route,
        departure_date: parsed.date,
        departure_time: parsed.depTime,
        arrival_time: parsed.arrTime,
        description: parsed.description
      });
    } else {
      setFormData({ ...formData, raw_text: text });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      setFormData({
        trip_id: '', raw_text: '', airline: '', flight_number: '', route: '',
        departure_date: '', departure_time: '', arrival_time: '', description: '', reference_code: ''
      });
      fetchFlights();
      refreshStats();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{t('flights')}</h2>
          <p className="text-slate-500">إدارة بيانات الطيران والرحلات الجوية</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="neumorph-btn px-6 py-3 rounded-2xl flex items-center gap-2 text-blue-600 font-bold"
        >
          <Plus size={20} />
          {t('add_flight')}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {flights.map((flight: any) => (
          <motion.div
            key={flight.id}
            whileHover={{ y: -5 }}
            className="glass-card p-6"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Plane size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{flight.airline} {flight.flight_number}</h3>
                  <p className="text-sm text-blue-600 font-medium">{flight.trip_name}</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
                REF: {flight.reference_code || '---'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin size={16} className="text-blue-500" />
                <span className="text-sm font-bold">{flight.route}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar size={16} className="text-blue-500" />
                <span className="text-sm font-bold">{flight.departure_date}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock size={16} className="text-blue-500" />
                <span className="text-sm font-bold">{flight.departure_time} - {flight.arrival_time}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm text-blue-800 font-medium">{flight.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-6">{t('add_flight')}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <label className="block text-sm font-medium text-slate-600 mb-1">{t('flight_raw_text')}</label>
                <textarea 
                  required
                  rows={2}
                  value={formData.raw_text}
                  onChange={(e) => handleRawTextChange(e.target.value)}
                  placeholder="مثال: SM 477 Y 11FEB 4 CAIJED DK1 1040 1345 11FEB"
                  className="w-full px-4 py-3 rounded-xl neumorph-inset focus:outline-none font-mono text-sm"
                />
                <p className="text-[10px] text-slate-400 mt-1">سيقوم النظام بتحليل النص تلقائياً واستخراج البيانات</p>
              </div>

              {formData.description && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                  <Info className="text-emerald-500 shrink-0" size={20} />
                  <p className="text-sm text-emerald-800 font-medium">{formData.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{t('reference_code')}</label>
                  <input 
                    type="text" 
                    value={formData.reference_code}
                    onChange={(e) => setFormData({...formData, reference_code: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl neumorph-inset focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{t('flight_number')}</label>
                  <input 
                    type="text" 
                    value={formData.flight_number}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-500 focus:outline-none"
                  />
                </div>
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
