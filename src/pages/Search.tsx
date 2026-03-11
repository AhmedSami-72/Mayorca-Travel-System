import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search as SearchIcon, User, Plane, UserRound, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function GlobalSearch() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/pilgrims?search=${encodeURIComponent(val)}`);
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="text-center">
        <h2 className="text-4xl font-bold text-slate-800 mb-2">{t('search')} الشامل</h2>
        <p className="text-slate-500">ابحث عن أي معتمر بالاسم الكامل أو جزء منه</p>
      </header>

      <div className="relative">
        <SearchIcon className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-500" size={28} />
        <input 
          type="text" 
          autoFocus
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="اكتب اسم المعتمر هنا..."
          className="w-full pr-16 pl-6 py-6 text-xl glass-card focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all shadow-2xl"
        />
      </div>

      <div className="space-y-4">
        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {results.map((p: any) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 flex items-center justify-between group hover:bg-white/50 transition-all"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <User size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{p.full_name}</h3>
                <div className="flex gap-4 mt-1">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Plane size={14} className="text-blue-400" />
                    <span>الرحلة: {p.trip_name || '---'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <UserRound size={14} className="text-violet-400" />
                    <span>المندوب: {p.agent_name || '---'}</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="p-3 rounded-xl bg-slate-100 text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <ArrowLeft size={20} />
            </button>
          </motion.div>
        ))}

        {query.length >= 2 && results.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-400 italic">
            لا توجد نتائج تطابق بحثك
          </div>
        )}
      </div>
    </div>
  );
}
