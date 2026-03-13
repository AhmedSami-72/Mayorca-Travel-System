import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, UserRound, Phone, Users, Trash2, AlertCircle, Pencil, X, Calendar, MapPin, Download, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../contexts/AppContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function Agents() {
  const { t } = useTranslation();
  const { agents, refreshAgents, refreshStats, searchQuery, user } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<number | null>(null);
  const [isPilgrimsModalOpen, setIsPilgrimsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [agentPilgrims, setAgentPilgrims] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<number | null>(null);

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingAgentId(null);
    setFormData({ name: '', phone: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (agent: any) => {
    setIsEditMode(true);
    setEditingAgentId(agent.id);
    setFormData({ name: agent.name, phone: agent.phone || '' });
    setIsModalOpen(true);
  };

  const fetchAgentPilgrims = async (agent: any) => {
    try {
      const res = await fetch(`/api/agents/${agent.id}/pilgrims`);
      const data = await res.json();
      setAgentPilgrims(data);
      setSelectedAgent(agent);
      setIsPilgrimsModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteClick = (id: number) => {
    setAgentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!agentToDelete) return;
    try {
      await fetch(`/api/agents/${agentToDelete}`, { method: 'DELETE' });
      setIsDeleteModalOpen(false);
      setAgentToDelete(null);
      refreshAgents();
      refreshStats();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditMode ? `/api/agents/${editingAgentId}` : '/api/agents';
      const method = isEditMode ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      refreshAgents();
      refreshStats();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (agent.phone && agent.phone.includes(searchQuery))
  );

  const exportAgentsToExcel = () => {
    const data = filteredAgents.map(a => ({
      'الاسم': a.name,
      'رقم الهاتف': a.phone || '---',
      'عدد المعتمرين': a.pilgrim_count,
      'تاريخ الانضمام': new Date(a.created_at).toLocaleDateString('ar-EG')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المناديب");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, `قائمة_المناديب_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('agents')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">إدارة المناديب والوكلاء المسؤولين عن المعتمرين</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportAgentsToExcel}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={18} />
            تصدير (Excel)
          </button>
          <button 
            onClick={openAddModal}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} />
            {t('add_agent')}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <motion.div
            key={agent.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="admin-card p-5 flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <UserRound size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{agent.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <Calendar size={12} />
                    منذ: {new Date(agent.created_at).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => openEditModal(agent)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                  title={t('edit')}
                >
                  <Pencil size={18} />
                </button>
                {user.role === 'Admin' && (
                  <button 
                    onClick={() => handleDeleteClick(agent.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                    title={t('delete')}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            {agent.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                <Phone size={14} className="text-slate-400" />
                <span>{agent.phone}</span>
              </div>
            )}
            
            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Users size={16} className="text-blue-500" />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{agent.pilgrim_count}</span>
                <span className="text-xs text-slate-500">معتمر</span>
              </div>
              <button 
                onClick={() => fetchAgentPilgrims(agent)}
                className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Eye size={14} />
                عرض القائمة
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Agent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="admin-card w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditMode ? 'تعديل بيانات المندوب' : t('add_agent')}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <UserRound size={16} className="text-blue-500" />
                  {t('full_name')}
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  placeholder="أدخل اسم المندوب الكامل"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Phone size={16} className="text-blue-500" />
                  رقم الهاتف
                </label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="input-field"
                  placeholder="أدخل رقم الهاتف (اختياري)"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  className="flex-1 btn-primary py-2.5"
                >
                  {t('save')}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 btn-secondary py-2.5"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Pilgrims Modal */}
      {isPilgrimsModalOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="admin-card w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">قائمة المعتمرين</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">المندوب: {selectedAgent.name}</p>
              </div>
              <button 
                onClick={() => setIsPilgrimsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {Object.entries(
                agentPilgrims.reduce((acc: any, p: any) => {
                  const tripName = p.trip_name || 'بدون رحلة';
                  if (!acc[tripName]) acc[tripName] = [];
                  acc[tripName].push(p);
                  return acc;
                }, {})
              ).map(([tripName, pilgrims]: [string, any]) => (
                <div key={tripName} className="space-y-3">
                  <div className="flex items-center gap-2 px-2">
                    <div className="h-4 w-1 bg-blue-600 rounded-full"></div>
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar size={16} className="text-blue-500" />
                      {tripName}
                      <span className="text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {pilgrims.length} معتمر
                      </span>
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {pilgrims.map((p: any) => (
                      <div key={p.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex justify-between items-center hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                            <UserRound size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{p.full_name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {p.gender === 'Male' ? 'ذكر' : 'أنثى'} • {
                                p.age_group === 'Adult' ? 'بالغ' : 
                                p.age_group === 'Child' ? 'طفل' : 'رضيع'
                              }
                            </p>
                          </div>
                        </div>
                        <div className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                          p.visa_type === 'Umrah' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 
                          p.visa_type === 'Tourism' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 
                          'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                        }`}>
                          {p.visa_type === 'Umrah' ? 'عمرة' : p.visa_type === 'Tourism' ? 'سياحة' : 'زيارة'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {agentPilgrims.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Users size={32} />
                  </div>
                  <p className="text-slate-400 italic">لا يوجد معتمرين مرتبطين بهذا المندوب</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end">
              <button 
                onClick={() => setIsPilgrimsModalOpen(false)}
                className="btn-secondary px-6"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="admin-card w-full max-w-sm p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">تأكيد الحذف</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              هل أنت متأكد من حذف هذا المندوب؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={confirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-lg font-bold transition-all"
              >
                تأكيد الحذف
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 btn-secondary py-2.5"
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
