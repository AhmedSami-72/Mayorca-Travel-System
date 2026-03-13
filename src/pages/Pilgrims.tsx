import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, User, FileText, CheckCircle2, AlertCircle, Trash2, Plane, UserRound, Eye, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../contexts/AppContext';

export default function Pilgrims() {
  const { t } = useTranslation();
  const { trips, agents, refreshStats, refreshTrips, refreshAgents, searchQuery, user } = useAppContext();
  const [pilgrims, setPilgrims] = useState([]);
  const [tripPilgrims, setTripPilgrims] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPilgrimId, setEditingPilgrimId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    passport_number: '',
    gender: 'Male',
    age_group: 'Adult',
    agent_id: '',
    trip_id: '',
    visa_type: 'Umrah',
    room_type: '',
    room_id: '',
    passport_type: 'Physical',
    passport_image: '',
    data_complete: false,
    notes: '',
    selectedCompanions: [] as number[],
    status: 'Registered'
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pilgrimToDelete, setPilgrimToDelete] = useState<number | null>(null);
  const [viewingPassport, setViewingPassport] = useState<string | null>(null);
  const [companionSearch, setCompanionSearch] = useState('');

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingPilgrimId(null);
    setFormData({
      full_name: '', phone: '', passport_number: '', gender: 'Male', age_group: 'Adult', agent_id: '', trip_id: '', visa_type: 'Umrah',
      room_type: '', room_id: '', passport_type: 'Physical',
      passport_image: '', data_complete: false, notes: '',
      selectedCompanions: [], status: 'Registered'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setIsEditMode(true);
    setEditingPilgrimId(p.id);
    
    // Find existing roommates
    const roommates = tripPilgrims
      .filter((tp: any) => tp.room_id === p.room_id && tp.room_id !== '' && tp.id !== p.id)
      .map((tp: any) => tp.id);

    setFormData({
      full_name: p.full_name,
      phone: p.phone || '',
      passport_number: p.passport_number || '',
      gender: p.gender || 'Male',
      age_group: p.age_group || 'Adult',
      agent_id: p.agent_id || '',
      trip_id: p.trip_id || '',
      visa_type: p.visa_type || 'Umrah',
      room_type: p.room_type || '',
      room_id: p.room_id || '',
      passport_type: p.passport_type || 'Physical',
      passport_image: p.passport_image || '',
      data_complete: !!p.data_complete,
      notes: p.notes || '',
      selectedCompanions: roommates,
      status: p.status || 'Registered'
    });
    setIsModalOpen(true);
  };

  const fetchPilgrims = async () => {
    try {
      const url = searchQuery ? `/api/pilgrims?search=${encodeURIComponent(searchQuery)}` : '/api/pilgrims';
      const res = await fetch(url);
      const data = await res.json();
      setPilgrims(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPilgrims();
  }, [searchQuery]);

  useEffect(() => {
    if (formData.trip_id) {
      fetch(`/api/pilgrims?trip_id=${formData.trip_id}`)
        .then(res => res.json())
        .then(data => setTripPilgrims(data.filter((p: any) => p.id !== editingPilgrimId)))
        .catch(console.error);
    } else {
      setTripPilgrims([]);
    }
  }, [formData.trip_id, editingPilgrimId]);

  const handleDeleteClick = (id: number) => {
    setPilgrimToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!pilgrimToDelete) return;
    try {
      await fetch(`/api/pilgrims/${pilgrimToDelete}`, { method: 'DELETE' });
      setIsDeleteModalOpen(false);
      setPilgrimToDelete(null);
      fetchPilgrims();
      refreshStats();
      refreshTrips();
      refreshAgents();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditMode ? `/api/pilgrims/${editingPilgrimId}` : '/api/pilgrims';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        agent_id: formData.agent_id || null,
        trip_id: formData.trip_id || null,
        companion_ids: formData.selectedCompanions,
        passport_image_exists: !!formData.passport_image
      };

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setIsModalOpen(false);
      fetchPilgrims();
      refreshStats();
      refreshTrips();
      refreshAgents();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('pilgrims')}</h2>
          <p className="text-slate-500">إدارة بيانات المعتمرين وجوازات السفر</p>
        </div>
        <button 
          onClick={openAddModal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          {t('add_pilgrim')}
        </button>
      </header>

      <div className="overflow-x-auto pb-4">
        <table className="w-full text-right border-separate border-spacing-y-3">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/80">
              <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 text-[11px] uppercase tracking-wider first:rounded-r-xl last:rounded-l-xl border-y border-slate-200 dark:border-slate-700 first:border-r last:border-l">{t('full_name')}</th>
              <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 text-[11px] uppercase tracking-wider border-y border-slate-200 dark:border-slate-700">رقم الجواز</th>
              <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 text-[11px] uppercase tracking-wider border-y border-slate-200 dark:border-slate-700">{t('agent')}</th>
              <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 text-[11px] uppercase tracking-wider border-y border-slate-200 dark:border-slate-700">{t('trips')}</th>
              <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 text-[11px] uppercase tracking-wider border-y border-slate-200 dark:border-slate-700">نوع الغرفة</th>
              <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 text-[11px] uppercase tracking-wider border-y border-slate-200 dark:border-slate-700">الحالة</th>
              <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 text-[11px] uppercase tracking-wider first:rounded-r-xl last:rounded-l-xl border-y border-slate-200 dark:border-slate-700 first:border-r last:border-l">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {pilgrims.map((p: any) => (
              <tr key={p.id} className="group transition-all duration-200">
                <td className="px-6 py-4 bg-white dark:bg-slate-900 first:rounded-r-xl last:rounded-l-xl border-y border-slate-100 dark:border-slate-800 first:border-r last:border-l group-hover:border-blue-200 dark:group-hover:border-blue-900 group-hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                      <User size={20} />
                    </div>
                    <div>
                      <span className="block font-bold text-slate-900 dark:text-white leading-tight">{p.full_name}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{p.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-900">
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">{p.passport_number || '---'}</span>
                </td>
                <td className="px-6 py-4 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-900">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                    <UserRound size={14} className="text-slate-300" />
                    {p.agent_name || '---'}
                  </div>
                </td>
                <td className="px-6 py-4 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-900">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                    <Plane size={14} className="text-slate-300" />
                    {p.trip_name || '---'}
                  </div>
                </td>
                <td className="px-6 py-4 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-900">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{p.room_type || '---'}</span>
                </td>
                <td className="px-6 py-4 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-900">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    p.status === 'Arrived' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 
                    p.status === 'Cancelled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' : 
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}>
                    {p.status === 'Arrived' ? 'وصل' : p.status === 'Cancelled' ? 'ملغي' : 'مسجل'}
                  </span>
                </td>
                <td className="px-6 py-4 bg-white dark:bg-slate-900 first:rounded-r-xl last:rounded-l-xl border-y border-slate-100 dark:border-slate-800 first:border-r last:border-l group-hover:border-blue-200 dark:group-hover:border-blue-900">
                  <div className="flex gap-1">
                    <button 
                      onClick={() => openEditModal(p)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                      title="تعديل"
                    >
                      <FileText size={18} />
                    </button>
                    {user.role === 'Admin' && (
                      <button 
                        onClick={() => handleDeleteClick(p.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                        title="حذف"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        {pilgrims.length === 0 && (
          <div className="text-center py-12 text-slate-400 italic">لا يوجد معتمرين مسجلين بعد</div>
        )}
      
      {/* Add/Edit Pilgrim Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl"
          >
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isEditMode ? 'تعديل بيانات المعتمر' : t('add_pilgrim')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('full_name')}</label>
                  <input 
                    required
                    type="text" 
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="input-field"
                    placeholder="الاسم الرباعي كما في جواز السفر"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('agent')}</label>
                  <select 
                    required
                    value={formData.agent_id}
                    onChange={(e) => setFormData({...formData, agent_id: e.target.value})}
                    className="input-field"
                  >
                    <option value="">اختر المندوب</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">رقم الهاتف</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="input-field"
                    placeholder="01xxxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">رقم الجواز</label>
                  <input 
                    type="text" 
                    value={formData.passport_number}
                    onChange={(e) => setFormData({...formData, passport_number: e.target.value})}
                    className="input-field"
                    placeholder="A00000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('passport_type')}</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, passport_type: 'Physical'})}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${
                        formData.passport_type === 'Physical' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      جلد
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, passport_type: 'WhatsApp'})}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${
                        formData.passport_type === 'WhatsApp' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      صورة
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">نوع التأشيرة</label>
                  <select 
                    value={formData.visa_type}
                    onChange={(e) => setFormData({...formData, visa_type: e.target.value})}
                    className="input-field"
                  >
                    <option value="Umrah">تأشيرة عمرة</option>
                    <option value="Tourism">تأشيرة سياحة</option>
                    <option value="Visit">تأشيرة زيارة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('trips')}</label>
                  <select 
                    required
                    value={formData.trip_id}
                    onChange={(e) => setFormData({...formData, trip_id: e.target.value})}
                    className="input-field"
                  >
                    <option value="">اختر الرحلة</option>
                    {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">نوع التسكين</label>
                  <select 
                    value={formData.room_type}
                    onChange={(e) => setFormData({...formData, room_type: e.target.value})}
                    className="input-field"
                  >
                    <option value="">تسكين عادي</option>
                    <option value="No Housing (Makkah)">بدون سكن (مكة)</option>
                    <option value="No Housing (Madinah)">بدون سكن (المدينة)</option>
                    <option value="No Housing (Both)">بدون سكن (الاثنين)</option>
                    <option value="Single">غرفة فردي</option>
                    <option value="Double">غرفة ثنائي</option>
                    <option value="Triple">غرفة ثلاثي</option>
                    <option value="Quad">غرفة رباعي</option>
                    <option value="Quint">غرفة خماسي</option>
                    <option value="Sext">غرفة سداسي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">رقم/اسم الغرفة</label>
                  <input 
                    type="text" 
                    value={formData.room_id}
                    onChange={(e) => setFormData({...formData, room_id: e.target.value})}
                    placeholder="مثال: 101"
                    className="input-field"
                  />
                </div>
              </div>

              {['Double', 'Triple', 'Quad', 'Quint', 'Sext'].includes(formData.room_type) && (
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-bold text-slate-800 dark:text-slate-200">المرافقين في الغرفة</label>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-[10px] font-bold rounded-full">
                        {formData.selectedCompanions.length} / {
                          formData.room_type === 'Double' ? 1 :
                          formData.room_type === 'Triple' ? 2 :
                          formData.room_type === 'Quad' ? 3 :
                          formData.room_type === 'Quint' ? 4 : 5
                        }
                      </span>
                    </div>
                    <div className="relative">
                      <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="بحث عن مرافق..."
                        value={companionSearch}
                        onChange={(e) => setCompanionSearch(e.target.value)}
                        className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pr-8 pl-3 py-1.5 w-40 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                    {tripPilgrims.length > 0 ? (
                      tripPilgrims
                        .filter((p: any) => p.id !== editingPilgrimId)
                        .filter((p: any) => !p.room_id || p.room_id === formData.room_id || formData.selectedCompanions.includes(p.id))
                        .filter((p: any) => p.full_name.toLowerCase().includes(companionSearch.toLowerCase()))
                        .map((p: any) => {
                          const isAssignedToOtherRoom = p.room_id && p.room_id !== formData.room_id;
                          const isSelected = formData.selectedCompanions.includes(p.id);
                          const maxCompanions = 
                            formData.room_type === 'Double' ? 1 :
                            formData.room_type === 'Triple' ? 2 :
                            formData.room_type === 'Quad' ? 3 :
                            formData.room_type === 'Quint' ? 4 : 5;
                          
                          const isDisabled = !isSelected && (formData.selectedCompanions.length >= maxCompanions || isAssignedToOtherRoom);

                          return (
                            <label 
                              key={p.id} 
                              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                isDisabled ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 border-transparent' : 'cursor-pointer hover:bg-white dark:hover:bg-slate-700 border-transparent hover:border-blue-200'
                              } ${isSelected ? 'bg-white dark:bg-slate-700 border-blue-500 shadow-sm' : ''}`}
                            >
                              <div className="flex items-center gap-3">
                                <input 
                                  type="checkbox"
                                  disabled={isDisabled}
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      if (!formData.room_id) {
                                        alert('يرجى إدخال رقم الغرفة أولاً');
                                        return;
                                      }
                                      setFormData({
                                        ...formData,
                                        selectedCompanions: [...formData.selectedCompanions, p.id]
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        selectedCompanions: formData.selectedCompanions.filter(id => id !== p.id)
                                      });
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.full_name}</span>
                              </div>
                              {isAssignedToOtherRoom && !isSelected && (
                                <span className="text-[10px] bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                                  غرفة #{p.room_id}
                                </span>
                              )}
                            </label>
                          );
                        })
                    ) : (
                      <p className="text-sm text-slate-400 italic text-center py-4">لا يوجد معتمرين آخرين في هذه الرحلة</p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">النوع</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="input-field"
                  >
                    <option value="Male">ذكر</option>
                    <option value="Female">أنثى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">الفئة العمرية</label>
                  <select 
                    value={formData.age_group}
                    onChange={(e) => setFormData({...formData, age_group: e.target.value})}
                    className="input-field"
                  >
                    <option value="Adult">بالغ</option>
                    <option value="Child">طفل</option>
                    <option value="Infant">رضيع</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">صورة الجواز</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({
                              ...formData, 
                              passport_image: reader.result as string
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="passport-upload"
                    />
                    <label 
                      htmlFor="passport-upload"
                      className="btn-secondary py-2 px-4 text-xs cursor-pointer flex items-center gap-2"
                    >
                      <Plus size={14} />
                      رفع صورة
                    </label>
                    {formData.passport_image && (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                        <img src={formData.passport_image} alt="Passport" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, passport_image: ''})}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} className="text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-end gap-6 pb-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.data_complete}
                      onChange={(e) => setFormData({...formData, data_complete: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{t('data_complete')}</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">حالة المعتمر</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="input-field"
                  >
                    <option value="Registered">مسجل</option>
                    <option value="Arrived">وصل</option>
                    <option value="Cancelled">ملغي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('notes')}</label>
                <textarea 
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="input-field"
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>

              <div className="flex gap-4 pt-8 border-t border-slate-200 dark:border-slate-700">
                <button 
                  type="submit"
                  className="flex-1 btn-primary py-3"
                >
                  {t('save')}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 btn-secondary py-3"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Passport Viewer Modal */}
      {viewingPassport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md" onClick={() => setViewingPassport(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl bg-white"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setViewingPassport(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
            >
              <Plus size={24} className="rotate-45" />
            </button>
            <img src={viewingPassport} alt="Passport View" className="max-w-full max-h-[90vh] object-contain" />
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
              هل أنت متأكد من حذف هذا المعتمر؟ لا يمكن التراجع عن هذا الإجراء.
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
