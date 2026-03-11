import React from 'react';
import { motion } from 'motion/react';
import { 
  Plane, 
  Users, 
  UserRound, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Search
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="glass-card p-6 flex items-center gap-6"
  >
    <div className={`p-4 rounded-2xl ${color} text-white shadow-lg`}>
      <Icon size={28} />
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const { t } = useTranslation();
  const { stats } = useAppContext();

  const chartData = [
    { name: t('completed_trips'), value: stats.completedTrips, color: '#10b981' },
    { name: t('incomplete_trips'), value: stats.incompleteTrips, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{t('dashboard')}</h2>
          <p className="text-slate-500">مرحباً بك في نظام مايوركا لإدارة العمرة</p>
        </div>
        <div className="relative w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder={t('search_placeholder')}
            className="w-full pr-12 pl-4 py-3 glass-card focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('total_trips')} 
          value={stats.totalTrips} 
          icon={Plane} 
          color="bg-blue-500" 
          delay={0.1}
        />
        <StatCard 
          title={t('total_pilgrims')} 
          value={stats.totalPilgrims} 
          icon={Users} 
          color="bg-emerald-500" 
          delay={0.2}
        />
        <StatCard 
          title={t('total_agents')} 
          value={stats.totalAgents} 
          icon={UserRound} 
          color="bg-violet-500" 
          delay={0.3}
        />
        <StatCard 
          title={t('completed_trips')} 
          value={stats.completedTrips} 
          icon={CheckCircle2} 
          color="bg-orange-500" 
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            إحصائيات الرحلات
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <AlertCircle size={20} className="text-orange-500" />
            تنبيهات النظام
          </h3>
          <div className="space-y-4">
            {stats.incompleteTrips > 0 && (
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 flex items-start gap-4">
                <AlertCircle className="text-orange-500 shrink-0" size={20} />
                <div>
                  <p className="text-sm font-bold text-orange-800">بيانات ناقصة</p>
                  <p className="text-xs text-orange-600">يوجد {stats.incompleteTrips} رحلات لم يتم استكمال بيانات الطيران أو التأشيرات لها.</p>
                </div>
              </div>
            )}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-4">
              <CheckCircle2 className="text-blue-500 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-blue-800">النظام جاهز</p>
                <p className="text-xs text-blue-600">قاعدة البيانات تم تحديثها بنجاح.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
