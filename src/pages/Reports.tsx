import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Printer, Table as TableIcon, File as FileIcon, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../contexts/AppContext';
import * as docx from 'docx';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import printJS from 'print-js';

export default function Reports() {
  const { t } = useTranslation();
  const { trips, agents } = useAppContext();
  const [selectedTripId, setSelectedTripId] = useState('');

  const exportToExcel = async () => {
    if (!selectedTripId) return;
    
    try {
      const res = await fetch(`/api/trips/${selectedTripId}`);
      const trip = await res.json();
      
      const data = trip.pilgrims.map((p: any, index: number) => ({
        'م': index + 1,
        'الاسم الكامل': p.full_name,
        'المندوب': p.agent_name,
        'نوع الجواز': p.passport_type === 'Physical' ? 'جلد' : 'واتساب',
        'ملاحظات': p.notes || ''
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "المعتمرين");
      XLSX.writeFile(wb, `كشف_رحلة_${trip.name}.xlsx`);
    } catch (e) {
      console.error(e);
    }
  };

  const exportToWord = async () => {
    if (!selectedTripId) return;

    try {
      const res = await fetch(`/api/trips/${selectedTripId}`);
      const trip = await res.json();

      const doc = new docx.Document({
        sections: [{
          properties: {
            page: {
              margin: { top: 720, right: 720, bottom: 720, left: 720 },
            },
          },
          children: [
            new docx.Paragraph({
              alignment: docx.AlignmentType.CENTER,
              children: [
                new docx.TextRun({
                  text: "شركة مايوركا للسياحة",
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            new docx.Paragraph({
              alignment: docx.AlignmentType.CENTER,
              children: [
                new docx.TextRun({
                  text: `كشف معتمري رحلة: ${trip.name}`,
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { before: 400, after: 400 },
            }),
            new docx.Table({
              width: { size: 100, type: docx.WidthType.PERCENTAGE },
              rows: [
                new docx.TableRow({
                  children: [
                    new docx.TableCell({ children: [new docx.Paragraph({ text: "م", alignment: docx.AlignmentType.CENTER })] }),
                    new docx.TableCell({ children: [new docx.Paragraph({ text: "الاسم الكامل", alignment: docx.AlignmentType.CENTER })] }),
                    new docx.TableCell({ children: [new docx.Paragraph({ text: "المندوب", alignment: docx.AlignmentType.CENTER })] }),
                    new docx.TableCell({ children: [new docx.Paragraph({ text: "نوع الجواز", alignment: docx.AlignmentType.CENTER })] }),
                  ],
                }),
                ...trip.pilgrims.map((p: any, index: number) => 
                  new docx.TableRow({
                    children: [
                      new docx.TableCell({ children: [new docx.Paragraph({ text: (index + 1).toString(), alignment: docx.AlignmentType.CENTER })] }),
                      new docx.TableCell({ children: [new docx.Paragraph({ text: p.full_name, alignment: docx.AlignmentType.CENTER })] }),
                      new docx.TableCell({ children: [new docx.Paragraph({ text: p.agent_name || "---", alignment: docx.AlignmentType.CENTER })] }),
                      new docx.TableCell({ children: [new docx.Paragraph({ text: p.passport_type === 'Physical' ? 'جلد' : 'واتساب', alignment: docx.AlignmentType.CENTER })] }),
                    ],
                  })
                ),
              ],
            }),
          ],
        }],
      });

      const blob = await docx.Packer.toBlob(doc);
      saveAs(blob, `كشف_رحلة_${trip.name}.docx`);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = async () => {
    if (!selectedTripId) return;
    
    try {
      const res = await fetch(`/api/trips/${selectedTripId}`);
      const trip = await res.json();
      
      const printData = trip.pilgrims.map((p: any, index: number) => ({
        id: index + 1,
        name: p.full_name,
        agent: p.agent_name || '---',
        type: p.passport_type === 'Physical' ? 'جلد' : 'واتساب'
      }));

      printJS({
        printable: printData,
        properties: [
          { field: 'id', displayName: 'م' },
          { field: 'name', displayName: 'الاسم الكامل' },
          { field: 'agent', displayName: 'المندوب' },
          { field: 'type', displayName: 'نوع الجواز' }
        ],
        type: 'json',
        header: `<h2 style="text-align:center">شركة مايوركا للسياحة</h2><h3 style="text-align:center">كشف معتمري رحلة: ${trip.name}</h3>`,
        style: 'td { text-align: right; padding: 10px; border: 1px solid #ddd; } th { text-align: right; padding: 10px; background: #f5f5f5; border: 1px solid #ddd; } table { width: 100%; border-collapse: collapse; direction: rtl; }'
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">{t('reports')}</h2>
        <p className="text-slate-500">استخراج التقارير والكشوفات بصيغ مختلفة</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <FileText size={20} className="text-blue-500" />
            كشف الرحلة
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">اختر الرحلة</label>
              <select 
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl neumorph-inset focus:outline-none bg-transparent"
              >
                <option value="">اختر الرحلة</option>
                {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-3 pt-4">
              <button 
                onClick={exportToWord}
                disabled={!selectedTripId}
                className="w-full py-4 rounded-2xl bg-white/50 border border-white/20 flex items-center justify-center gap-3 text-blue-600 font-bold hover:bg-white/80 transition-all disabled:opacity-50"
              >
                <FileIcon size={20} />
                {t('export_word')}
              </button>
              <button 
                onClick={exportToExcel}
                disabled={!selectedTripId}
                className="w-full py-4 rounded-2xl bg-white/50 border border-white/20 flex items-center justify-center gap-3 text-emerald-600 font-bold hover:bg-white/80 transition-all disabled:opacity-50"
              >
                <TableIcon size={20} />
                {t('export_excel')}
              </button>
              <button 
                onClick={handlePrint}
                disabled={!selectedTripId}
                className="w-full py-4 rounded-2xl bg-blue-500 text-white flex items-center justify-center gap-3 font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 transition-all disabled:opacity-50"
              >
                <Printer size={20} />
                {t('print')}
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 opacity-50 cursor-not-allowed">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <UserRound size={20} className="text-violet-500" />
            كشف المندوب
          </h3>
          <p className="text-sm text-slate-500 italic">قريباً: استخراج كشوفات مخصصة لكل مندوب على حدة.</p>
        </div>
      </div>
    </div>
  );
}
