import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plane, 
  Users, 
  UserRound, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Search,
  Home,
  Zap,
  PlusCircle,
  X,
  ChevronRight,
  MapPin,
  Calendar,
  FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="admin-card p-6 flex items-center gap-6"
  >
    <div className={`p-4 rounded-xl ${color} text-white shadow-sm`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const { t } = useTranslation();
  const { stats, searchQuery, setSearchQuery, setActiveTab, trips } = useAppContext();
  const [missingDataType, setMissingDataType] = useState<string | null>(null);
  const [missingDataList, setMissingDataList] = useState<any[]>([]);
  const [isLoadingMissing, setIsLoadingMissing] = useState(false);

  const chartData = [
    { name: t('completed_trips'), value: stats.completedTrips, color: '#2563eb' },
    { name: t('incomplete_trips'), value: stats.incompleteTrips, color: '#f59e0b' },
  ];

  const quickActions = [
    { title: 'إضافة رحلة', icon: PlusCircle, color: 'text-blue-600', bg: 'bg-blue-50', path: 'trips' },
    { title: 'إضافة معتمر', icon: PlusCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', path: 'pilgrims' },
    { title: 'إضافة مندوب', icon: PlusCircle, color: 'text-violet-600', bg: 'bg-violet-50', path: 'agents' },
  ];

  const fetchMissingData = async (type: string) => {
    setIsLoadingMissing(true);
    setMissingDataType(type);
    try {
      const res = await fetch(`/api/pilgrims/missing/${type}`);
      const data = await res.json();
      setMissingDataList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMissing(false);
    }
  };

  const getTripStatus = (trip: any) => {
    const stages = [
      { key: 'flight_added', label: 'روت الطيران' },
      { key: 'visa_issued', label: 'إصدار التأشيرات' },
      { key: 'barcode_created', label: 'إصدار الباركود' },
      { key: 'ids_prepared', label: 'إصدار ID' },
      { key: 'list_prepared', label: 'كشف الرحلة' },
      { key: 'rawdah_added', label: 'بيانات الروضة' }
    ];

    const missing = stages.filter(s => !trip[s.key]);
    if (missing.length === 0) return { text: 'الرحلة مكتملة', color: 'text-emerald-600 bg-emerald-50' };
    return { text: `ناقص ${missing[0].label}`, color: 'text-orange-600 bg-orange-50' };
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('dashboard')}</h2>
          <p className="text-slate-500 dark:text-slate-400">مرحباً بك في نظام مايوركا لإدارة العمرة</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            className="input-field pr-12"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('total_trips')} 
          value={stats.totalTrips} 
          icon={Plane} 
          color="bg-blue-600" 
          delay={0.1}
        />
        <StatCard 
          title={t('total_pilgrims')} 
          value={stats.totalPilgrims} 
          icon={Users} 
          color="bg-emerald-600" 
          delay={0.2}
        />
        <StatCard 
          title={t('total_agents')} 
          value={stats.totalAgents} 
          icon={UserRound} 
          color="bg-violet-600" 
          delay={0.3}
        />
        <StatCard 
          title="الغرف المستخدمة" 
          value={stats.occupiedRooms || 0} 
          icon={Home} 
          color="bg-orange-600" 
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="admin-card p-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              إحصائيات الرحلات
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="admin-card p-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Plane size={18} className="text-blue-600" />
              حالة الرحلات الحالية
            </h3>
            <div className="space-y-4">
              {trips.slice(0, 5).map((trip: any) => {
                const status = getTripStatus(trip);
                return (
                  <div key={trip.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                        <Plane size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{trip.name}</p>
                        <p className="text-xs text-slate-500">{trip.month_gregorian}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                      {status.text}
                    </div>
                  </div>
                );
              })}
              {trips.length === 0 && (
                <p className="text-center py-8 text-slate-400 italic">لا توجد رحلات مسجلة</p>
              )}
              {trips.length > 5 && (
                <button 
                  onClick={() => setActiveTab('trips')}
                  className="w-full py-2 text-sm text-blue-600 font-bold hover:bg-blue-50 rounded-lg transition-colors"
                >
                  عرض جميع الرحلات
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="admin-card p-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <AlertCircle size={18} className="text-orange-600" />
              البيانات الناقصة
            </h3>
            <div className="space-y-3">
              {[
                { type: 'agent', label: 'معتمر بدون مندوب', count: stats.missingData?.agent || 0, color: 'text-orange-600 bg-orange-50' },
                { type: 'room', label: 'معتمر بدون غرفة', count: stats.missingData?.room || 0, color: 'text-rose-600 bg-rose-50' },
                { type: 'passport', label: 'معتمر بدون رقم جواز', count: stats.missingData?.passport || 0, color: 'text-amber-600 bg-amber-50' },
                { type: 'trip', label: 'معتمر بدون رحلة', count: stats.missingData?.trip || 0, color: 'text-slate-600 bg-slate-50' }
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => fetchMissingData(item.type)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all ${item.color} bg-opacity-50`}
                >
                  <span className="font-bold text-sm">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black">{item.count}</span>
                    <ChevronRight size={16} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="admin-card p-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Zap size={18} className="text-yellow-500" />
              إجراءات سريعة
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(action.path)}
                  className={`flex items-center gap-3 p-4 rounded-xl ${action.bg} ${action.color} font-bold hover:scale-[1.02] transition-all text-sm`}
                >
                  <action.icon size={18} />
                  {action.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Missing Data Modal */}
      <AnimatePresence>
        {missingDataType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {missingDataType === 'agent' ? 'معتمرون بدون مندوب' : 
                   missingDataType === 'room' ? 'معتمرون بدون غرفة' : 
                   missingDataType === 'passport' ? 'معتمرون بدون رقم جواز' : 'معتمرون بدون رحلة'}
                </h3>
                <button onClick={() => setMissingDataType(null)} className="p-2 text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isLoadingMissing ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  missingDataList.map((p: any) => (
                    <div key={p.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                          <UserRound size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{p.full_name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin size={12} /> {p.trip_name || 'بدون رحلة'}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <UserRound size={12} /> {p.agent_name || 'بدون مندوب'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setMissingDataType(null);
                          setActiveTab('pilgrims');
                        }}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  ))
                )}
                {!isLoadingMissing && missingDataList.length === 0 && (
                  <p className="text-center py-12 text-slate-400 italic">لا توجد بيانات مطابقة</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
