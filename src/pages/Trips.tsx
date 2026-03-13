import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Plane, Calendar, Users, ChevronRight, Info, Clock, MapPin, Hash, X, AlertCircle, Filter, Download, Trash2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../contexts/AppContext';
import { parseFlightText } from '../utils';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function Trips() {
  const { t } = useTranslation();
  const { trips, refreshTrips, refreshStats, agents, searchQuery, user } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTripId, setEditingTripId] = useState<number | null>(null);
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    month_gregorian: '',
    month_hijri: '',
    supervisor1_id: '',
    supervisor2_id: '',
    notes: '',
    visa_issued: false,
    flight_added: false,
    barcode_created: false,
    ids_prepared: false,
    list_prepared: false,
    rawdah_added: false
  });

  const [flightFormData, setFlightFormData] = useState({
    outbound: {
      raw_text: '', airline: '', flight_number: '', route: '',
      departure_date: '', departure_time: '', arrival_time: '', description: '', reference_code: ''
    },
    inbound: {
      raw_text: '', airline: '', flight_number: '', route: '',
      departure_date: '', departure_time: '', arrival_time: '', description: '', reference_code: ''
    }
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<number | null>(null);
  const [monthFilter, setMonthFilter] = useState('');
  const [supervisorFilter, setSupervisorFilter] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingTripId(null);
    setFormData({ 
      name: '', 
      month_gregorian: '', 
      month_hijri: '', 
      supervisor1_id: '', 
      supervisor2_id: '', 
      notes: '',
      visa_issued: false,
      flight_added: false,
      barcode_created: false,
      ids_prepared: false,
      list_prepared: false,
      rawdah_added: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (trip: any) => {
    setIsEditMode(true);
    setEditingTripId(trip.id);
    setFormData({
      name: trip.name,
      month_gregorian: trip.month_gregorian || '',
      month_hijri: trip.month_hijri || '',
      supervisor1_id: trip.supervisor1_id || '',
      supervisor2_id: trip.supervisor2_id || '',
      notes: trip.notes || '',
      visa_issued: !!trip.visa_issued,
      flight_added: !!trip.flight_added,
      barcode_created: !!trip.barcode_created,
      ids_prepared: !!trip.ids_prepared,
      list_prepared: !!trip.list_prepared,
      rawdah_added: !!trip.rawdah_added
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setTripToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!tripToDelete) return;
    try {
      await fetch(`/api/trips/${tripToDelete}`, { method: 'DELETE' });
      setIsDeleteModalOpen(false);
      setTripToDelete(null);
      refreshTrips();
      refreshStats();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditMode ? `/api/trips/${editingTripId}` : '/api/trips';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        supervisor1_id: formData.supervisor1_id || null,
        supervisor2_id: formData.supervisor2_id || null
      };

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setIsModalOpen(false);
      refreshTrips();
      refreshStats();
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

  const handleFlightRawTextChange = (text: string, type: 'outbound' | 'inbound') => {
    const parsed = parseFlightText(text);
    if (parsed) {
      setFlightFormData({
        ...flightFormData,
        [type]: {
          ...flightFormData[type],
          raw_text: text,
          airline: parsed.airline,
          flight_number: parsed.flightNumber,
          route: parsed.route,
          departure_date: parsed.date,
          departure_time: parsed.depTime,
          arrival_time: parsed.arrTime,
          description: parsed.description
        }
      });
    } else {
      setFlightFormData({
        ...flightFormData,
        [type]: { ...flightFormData[type], raw_text: text }
      });
    }
  };

  const handleFlightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip) return;
    try {
      await fetch('/api/flights/unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          trip_id: selectedTrip.id,
          outbound: flightFormData.outbound,
          inbound: flightFormData.inbound
        })
      });
      setIsFlightModalOpen(false);
      fetchTripDetails(selectedTrip.id);
      refreshTrips();
      refreshStats();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trip.month_gregorian && trip.month_gregorian.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (trip.month_hijri && trip.month_hijri.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesMonth = monthFilter === '' || 
      (trip.month_gregorian && trip.month_gregorian === monthFilter) ||
      (trip.month_hijri && trip.month_hijri === monthFilter);
    
    const matchesSupervisor = supervisorFilter === '' || 
      trip.supervisor1_id?.toString() === supervisorFilter || 
      trip.supervisor2_id?.toString() === supervisorFilter;

    return matchesSearch && matchesMonth && matchesSupervisor;
  });

  const exportAllTripsToExcel = () => {
    const data = trips.map(t => ({
      'اسم الرحلة': t.name,
      'الشهر الميلادي': t.month_gregorian,
      'الشهر الهجري': t.month_hijri,
      'المشرف 1': t.supervisor1_name || '---',
      'المشرف 2': t.supervisor2_name || '---',
      'عدد الرجال': t.men_count_calc || 0,
      'عدد النساء': t.women_count_calc || 0,
      'عدد الأطفال': t.children_count_calc || 0,
      'عدد الرضع': t.infants_count_calc || 0,
      'إجمالي المعتمرين': (t.men_count_calc || 0) + (t.women_count_calc || 0) + (t.children_count_calc || 0) + (t.infants_count_calc || 0),
      'تاريخ الإنشاء': new Date(t.created_at).toLocaleDateString('ar-EG'),
      'ملاحظات': t.notes
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الرحلات");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, `جميع_الرحلات_${new Date().toLocaleDateString()}.xlsx`);
  };

  const uniqueMonths = Array.from(new Set(trips.flatMap(t => [t.month_gregorian, t.month_hijri]).filter(Boolean)));

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('trips')}</h2>
          <p className="text-slate-500">إدارة وتنظيم رحلات العمرة</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={exportAllTripsToExcel}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={18} />
            تصدير الكل (Excel)
          </button>
          <button 
            onClick={openAddModal}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            {t('add_trip')}
          </button>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="admin-card p-4 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2 text-slate-500">
          <Filter size={18} />
          <span className="text-sm font-bold">تصفية:</span>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <select 
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="input-field py-2 text-sm"
          >
            <option value="">كل الشهور</option>
            {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <select 
            value={supervisorFilter}
            onChange={(e) => setSupervisorFilter(e.target.value)}
            className="input-field py-2 text-sm"
          >
            <option value="">كل المشرفين</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        {(monthFilter || supervisorFilter) && (
          <button 
            onClick={() => { setMonthFilter(''); setSupervisorFilter(''); }}
            className="text-sm text-rose-500 font-bold hover:underline"
          >
            إعادة تعيين
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTrips.map((trip) => (
          <motion.div
            key={trip.id}
            whileHover={{ y: -5 }}
            className="admin-card p-6 cursor-pointer group relative"
            onClick={() => fetchTripDetails(trip.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <Plane size={24} />
              </div>
              <div className="flex gap-2">
                {trip.visa_issued ? (
                  <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-[10px] font-bold">تأشيرات</span>
                ) : (
                  <span className="px-2 py-1 rounded bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 text-[10px] font-bold">تأشيرات</span>
                )}
                {trip.flight_added ? (
                  <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] font-bold">طيران</span>
                ) : (
                  <span className="px-2 py-1 rounded bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 text-[10px] font-bold">طيران</span>
                )}
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{trip.name}</h3>
            <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{trip.month_gregorian} / {trip.month_hijri}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} />
                <span>{trip.pilgrim_count} معتمر</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-medium text-slate-400">تم الإنشاء: {new Date(trip.created_at).toLocaleDateString('ar-EG')}</span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(trip);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  title="تعديل الرحلة"
                >
                  <Plus size={18} className="rotate-45" />
                </button>
                {user.role === 'Admin' && (
                  <button 
                    onClick={(e) => handleDeleteClick(e, trip.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                    title="حذف الرحلة"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Trip Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-lg p-8 rounded-2xl shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isEditMode ? 'تعديل الرحلة' : t('add_trip')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('trip_name')}</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  placeholder="مثال: رحلة شهر رمضان 2024"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('month_gregorian')}</label>
                  <input 
                    type="text" 
                    value={formData.month_gregorian}
                    onChange={(e) => setFormData({...formData, month_gregorian: e.target.value})}
                    className="input-field"
                    placeholder="فبراير 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('month_hijri')}</label>
                  <input 
                    type="text" 
                    value={formData.month_hijri}
                    onChange={(e) => setFormData({...formData, month_hijri: e.target.value})}
                    className="input-field"
                    placeholder="شعبان 1445"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">المشرف 1</label>
                  <select 
                    value={formData.supervisor1_id}
                    onChange={(e) => setFormData({...formData, supervisor1_id: e.target.value})}
                    className="input-field"
                  >
                    <option value="">اختر مشرف</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">المشرف 2</label>
                  <select 
                    value={formData.supervisor2_id}
                    onChange={(e) => setFormData({...formData, supervisor2_id: e.target.value})}
                    className="input-field"
                  >
                    <option value="">اختر مشرف</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('notes')}</label>
                <textarea 
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="input-field"
                  placeholder="أي ملاحظات إضافية عن الرحلة..."
                />
              </div>
              <div className="space-y-3 py-2 border-t border-slate-100 dark:border-slate-800 mt-4">
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">مراحل تجهيز الرحلة:</p>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.flight_added}
                      onChange={(e) => setFormData({...formData, flight_added: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">تم إضافة روت الطيران</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.visa_issued}
                      onChange={(e) => setFormData({...formData, visa_issued: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">تم إصدار التأشيرات</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.barcode_created}
                      onChange={(e) => setFormData({...formData, barcode_created: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">تم إصدار الباركود</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.ids_prepared}
                      onChange={(e) => setFormData({...formData, ids_prepared: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">تم إصدار ID</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.list_prepared}
                      onChange={(e) => setFormData({...formData, list_prepared: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">تم تجهيز كشف الرحلة</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.rawdah_added}
                      onChange={(e) => setFormData({...formData, rawdah_added: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">تم إضافة بيانات الروضة</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button 
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {t('save')}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 btn-secondary"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl"
          >
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedTrip.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-slate-500 dark:text-slate-400">{selectedTrip.month_gregorian} / {selectedTrip.month_hijri}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedTrip.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 
                    selectedTrip.status === 'Completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  }`}>
                    {selectedTrip.status === 'Confirmed' ? 'مؤكدة' : selectedTrip.status === 'Completed' ? 'مكتملة' : 'مسودة'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {selectedTrip.status === 'Draft' && (
                  <button 
                    onClick={async () => {
                      try {
                        await fetch(`/api/trips/${selectedTrip.id}/confirm`, { method: 'POST' });
                        fetchTripDetails(selectedTrip.id);
                        refreshTrips();
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    تأكيد الرحلة
                  </button>
                )}
                <button 
                  onClick={() => setSelectedTrip(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-slate-100 dark:border-slate-800 px-8">
              <button 
                onClick={() => setActiveTab('details')}
                className={`px-6 py-4 font-bold transition-all border-b-2 ${activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
              >
                التفاصيل
              </button>
              <button 
                onClick={() => setActiveTab('pilgrims')}
                className={`px-6 py-4 font-bold transition-all border-b-2 ${activeTab === 'pilgrims' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
              >
                المعتمرين
              </button>
              <button 
                onClick={() => setActiveTab('housing')}
                className={`px-6 py-4 font-bold transition-all border-b-2 ${activeTab === 'housing' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
              >
                التسكين
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              {activeTab === 'details' && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-center">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">{t('men')}</p>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{selectedTrip.men_count_calc || 0}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-900/30 text-center">
                      <p className="text-xs text-pink-600 dark:text-pink-400 font-bold mb-1">{t('women')}</p>
                      <p className="text-2xl font-bold text-pink-800 dark:text-pink-200">{selectedTrip.women_count_calc || 0}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-center">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-1">{t('children')}</p>
                      <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{selectedTrip.children_count_calc || 0}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-900/30 text-center">
                      <p className="text-xs text-violet-600 dark:text-violet-400 font-bold mb-1">{t('infants')}</p>
                      <p className="text-2xl font-bold text-violet-800 dark:text-violet-200">{selectedTrip.infants_count_calc || 0}</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">بيانات الطيران</h4>
                      <button 
                        onClick={() => setIsFlightModalOpen(true)}
                        className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline"
                      >
                        <Plus size={16} />
                        {selectedTrip.flights?.length > 0 ? 'إضافة رحلة أخرى' : 'إضافة بيانات الطيران'}
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {selectedTrip.flights?.map((flight: any) => (
                        <div key={flight.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                                <Plane size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{flight.airline} {flight.flight_number}</p>
                                <p className="text-xs text-slate-500">{flight.route}</p>
                              </div>
                            </div>
                            <div className="px-2 py-1 rounded bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold shadow-sm border border-slate-100 dark:border-slate-600">
                              REF: {flight.reference_code || '---'}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-blue-500" />
                              <span>{flight.departure_date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-blue-500" />
                              <span>{flight.departure_time} - {flight.arrival_time}</span>
                            </div>
                          </div>
                          <p className="mt-3 text-xs text-blue-800 dark:text-blue-300 font-medium">{flight.description}</p>
                        </div>
                      ))}
                      {(!selectedTrip.flights || selectedTrip.flights.length === 0) && (
                        <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-sm">
                          لا توجد بيانات طيران مسجلة لهذه الرحلة
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'pilgrims' && (
                <>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">قائمة المعتمرين ({selectedTrip.pilgrims?.length || 0})</h4>
                  <div className="space-y-2">
                    {selectedTrip.pilgrims?.map((p: any) => (
                      <div key={p.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{p.full_name}</p>
                          <p className="text-xs text-slate-500">المندوب: {p.agent_name || 'غير محدد'}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.gender === 'Male' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                          }`}>
                            {p.gender === 'Male' ? 'ذكر' : 'أنثى'}
                          </span>
                          {p.passport_type === 'Physical' ? (
                            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[10px] font-bold">جواز جلد</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-[10px] font-bold">واتساب</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!selectedTrip.pilgrims || selectedTrip.pilgrims.length === 0) && (
                      <div className="text-center py-12 text-slate-400 italic">لا يوجد معتمرين في هذه الرحلة بعد</div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'housing' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">توزيع الغرف</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(
                      selectedTrip.pilgrims?.reduce((acc: any, p: any) => {
                        const roomId = p.room_id || 'unassigned';
                        if (!acc[roomId]) acc[roomId] = [];
                        acc[roomId].push(p);
                        return acc;
                      }, {}) || {}
                    ).map(([roomId, roomPilgrims]: [string, any]) => (
                      <div key={roomId} className={`p-4 rounded-2xl border transition-all ${roomId === 'unassigned' ? 'bg-slate-50 dark:bg-slate-800/30 border-dashed border-slate-300 dark:border-slate-700' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md'}`}>
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="font-bold text-slate-700 dark:text-slate-200">
                            {roomId === 'unassigned' ? 'غير مسكنين' : `غرفة #${roomId}`}
                          </h5>
                          {roomId !== 'unassigned' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                              {roomPilgrims[0].room_type}
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          {roomPilgrims.map((p: any) => (
                            <div key={p.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <div className={`w-2 h-2 rounded-full ${p.gender === 'Male' ? 'bg-blue-400' : 'bg-pink-400'}`} />
                              <span>{p.full_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      {/* Add Flight Modal (Unified) */}
      {isFlightModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">تحديث بيانات الطيران (ذهاب وعودة)</h3>
              <button onClick={() => setIsFlightModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleFlightSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Outbound */}
                <div className="space-y-4">
                  <h4 className="font-bold text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-2">رحلة الذهاب</h4>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">نص رحلة الذهاب</label>
                    <textarea 
                      required
                      rows={2}
                      value={flightFormData.outbound.raw_text}
                      onChange={(e) => handleFlightRawTextChange(e.target.value, 'outbound')}
                      placeholder="مثال: SM 477 Y 11FEB 4 CAIJED DK1 1040 1345 11FEB"
                      className="input-field font-mono text-xs"
                    />
                  </div>
                  {flightFormData.outbound.description && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-[10px] text-emerald-800 dark:text-emerald-300">
                      {flightFormData.outbound.description}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Reference Code"
                      value={flightFormData.outbound.reference_code}
                      onChange={(e) => setFlightFormData({
                        ...flightFormData, 
                        outbound: {...flightFormData.outbound, reference_code: e.target.value}
                      })}
                      className="input-field text-sm"
                    />
                    <input 
                      type="text" 
                      placeholder="رقم الرحلة"
                      value={flightFormData.outbound.flight_number}
                      readOnly
                      className="input-field text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-500"
                    />
                  </div>
                </div>

                {/* Inbound */}
                <div className="space-y-4">
                  <h4 className="font-bold text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-800 pb-2">رحلة العودة</h4>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">نص رحلة العودة</label>
                    <textarea 
                      required
                      rows={2}
                      value={flightFormData.inbound.raw_text}
                      onChange={(e) => handleFlightRawTextChange(e.target.value, 'inbound')}
                      placeholder="مثال: SM 478 Y 20FEB 4 JEDCAI DK1 1500 1800 20FEB"
                      className="input-field font-mono text-xs"
                    />
                  </div>
                  {flightFormData.inbound.description && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-[10px] text-emerald-800 dark:text-emerald-300">
                      {flightFormData.inbound.description}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Reference Code"
                      value={flightFormData.inbound.reference_code}
                      onChange={(e) => setFlightFormData({
                        ...flightFormData, 
                        inbound: {...flightFormData.inbound, reference_code: e.target.value}
                      })}
                      className="input-field text-sm"
                    />
                    <input 
                      type="text" 
                      placeholder="رقم الرحلة"
                      value={flightFormData.inbound.flight_number}
                      readOnly
                      className="input-field text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button 
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  حفظ البيانات
                </button>
                <button 
                  type="button"
                  onClick={() => setIsFlightModalOpen(false)}
                  className="flex-1 btn-secondary"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-md p-8 text-center rounded-2xl shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">تأكيد الحذف</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              هل أنت متأكد من حذف هذه الرحلة؟ لا يمكن التراجع عن هذا الإجراء، وسيتم حذف جميع البيانات المرتبطة بها نهائياً.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-sm hover:bg-rose-700 transition-all"
              >
                تأكيد الحذف
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
