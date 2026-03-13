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
  const [selectedAgentId, setSelectedAgentId] = useState('');

  const exportToExcel = async () => {
    if (!selectedTripId) return;
    
    try {
      const res = await fetch(`/api/trips/${selectedTripId}`);
      const trip = await res.json();
      
      const data = trip.pilgrims.map((p: any, index: number) => ({
        'م': index + 1,
        'الاسم الكامل': p.full_name,
        'النوع': p.gender === 'Male' ? 'ذكر' : 'أنثى',
        'الفئة': p.age_group === 'Adult' ? 'بالغ' : p.age_group === 'Child' ? 'طفل' : 'رضيع',
        'المندوب': p.agent_name,
        'نوع الجواز': p.passport_type === 'Physical' ? 'جلد' : 'واتساب',
        'نوع التأشيرة': p.visa_type === 'Umrah' ? 'عمرة' : p.visa_type === 'Tourism' ? 'سياحة' : 'زيارة',
        'الغرفة': p.room_type ? `${p.room_type} (#${p.room_id})` : '---',
        'ملاحظات': p.notes || ''
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      
      // Add stats rows
      const statsStartRow = data.length + 2;
      XLSX.utils.sheet_add_aoa(ws, [
        [],
        ['إحصائيات الرحلة'],
        ['إجمالي المعتمرين', trip.pilgrim_count],
        ['رجال', trip.men_count_calc],
        ['نساء', trip.women_count_calc],
        ['أطفال', trip.children_count_calc],
        ['رضع', trip.infants_count_calc]
      ], { origin: `A${statsStartRow}` });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "المعتمرين");
      XLSX.writeFile(wb, `كشف_رحلة_${trip.name}.xlsx`);
    } catch (e) {
      console.error(e);
    }
  };

  const exportAgentToWord = async () => {
    if (!selectedAgentId) return;

    try {
      const res = await fetch(`/api/agents/${selectedAgentId}/pilgrims`);
      const pilgrims = await res.json();
      const agent = agents.find(a => a.id.toString() === selectedAgentId);

      const doc = new docx.Document({
        sections: [{
          properties: {
            page: { 
              margin: { top: 720, right: 720, bottom: 720, left: 720 },
              borders: {
                pageBorderTop: { style: docx.BorderStyle.DOUBLE, size: 24, space: 24, color: "000080" },
                pageBorderBottom: { style: docx.BorderStyle.DOUBLE, size: 24, space: 24, color: "000080" },
                pageBorderLeft: { style: docx.BorderStyle.DOUBLE, size: 24, space: 24, color: "000080" },
                pageBorderRight: { style: docx.BorderStyle.DOUBLE, size: 24, space: 24, color: "000080" },
              }
            },
          },
          children: [
            new docx.Paragraph({
              alignment: docx.AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new docx.TextRun({
                  text: "شركة مايوركا للسياحة",
                  bold: true,
                  size: 44,
                  font: "Arial",
                  color: "FF0000",
                  underline: { type: docx.UnderlineType.SINGLE, color: "FF0000" }
                }),
              ],
            }),
            new docx.Paragraph({
              alignment: docx.AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new docx.TextRun({
                  text: `كشف معتمري المندوب: ${agent?.name}`,
                  bold: true,
                  size: 32,
                  font: "Arial",
                  color: "FF0000",
                }),
              ],
              spacing: { before: 200, after: 400 },
            }),
            new docx.Table({
              width: { size: 100, type: docx.WidthType.PERCENTAGE },
              alignment: docx.AlignmentType.CENTER,
              borders: {
                top: { style: docx.BorderStyle.SINGLE, size: 12, color: "000000" },
                bottom: { style: docx.BorderStyle.SINGLE, size: 12, color: "000000" },
                left: { style: docx.BorderStyle.SINGLE, size: 12, color: "000000" },
                right: { style: docx.BorderStyle.SINGLE, size: 12, color: "000000" },
                insideHorizontal: { style: docx.BorderStyle.SINGLE, size: 8, color: "000000" },
                insideVertical: { style: docx.BorderStyle.SINGLE, size: 8, color: "000000" },
              },
              rows: [
                new docx.TableRow({
                  tableHeader: true,
                  children: [
                    new docx.TableCell({ 
                      width: { size: 5, type: docx.WidthType.PERCENTAGE },
                      children: [new docx.Paragraph({ text: "م", alignment: docx.AlignmentType.CENTER, bidirectional: true, children: [new docx.TextRun({ bold: true, size: 24 })] })], 
                      shading: { fill: "F2F2F2" },
                      verticalAlign: docx.VerticalAlign.CENTER
                    }),
                    new docx.TableCell({ 
                      width: { size: 45, type: docx.WidthType.PERCENTAGE },
                      children: [new docx.Paragraph({ text: "الاسم", alignment: docx.AlignmentType.CENTER, bidirectional: true, children: [new docx.TextRun({ bold: true, size: 24 })] })], 
                      shading: { fill: "F2F2F2" },
                      verticalAlign: docx.VerticalAlign.CENTER
                    }),
                    new docx.TableCell({ 
                      width: { size: 20, type: docx.WidthType.PERCENTAGE },
                      children: [new docx.Paragraph({ text: "الرحلة", alignment: docx.AlignmentType.CENTER, bidirectional: true, children: [new docx.TextRun({ bold: true, size: 24 })] })], 
                      shading: { fill: "F2F2F2" },
                      verticalAlign: docx.VerticalAlign.CENTER
                    }),
                    new docx.TableCell({ 
                      width: { size: 30, type: docx.WidthType.PERCENTAGE },
                      children: [new docx.Paragraph({ text: "الملاحظات", alignment: docx.AlignmentType.CENTER, bidirectional: true, children: [new docx.TextRun({ bold: true, size: 24 })] })], 
                      shading: { fill: "F2F2F2" },
                      verticalAlign: docx.VerticalAlign.CENTER
                    }),
                  ],
                }),
                ...pilgrims.map((p: any, index: number) => {
                  return new docx.TableRow({
                    children: [
                      new docx.TableCell({ 
                        children: [new docx.Paragraph({ text: (index + 1).toString(), alignment: docx.AlignmentType.CENTER, bidirectional: true, spacing: { before: 100, after: 100 } })],
                        verticalAlign: docx.VerticalAlign.CENTER
                      }),
                      new docx.TableCell({ 
                        children: [new docx.Paragraph({ text: p.full_name, alignment: docx.AlignmentType.RIGHT, bidirectional: true, spacing: { before: 100, after: 100 }, indent: { right: 100 } })],
                        verticalAlign: docx.VerticalAlign.CENTER
                      }),
                      new docx.TableCell({ 
                        children: [new docx.Paragraph({ text: p.trip_name || "---", alignment: docx.AlignmentType.CENTER, bidirectional: true, spacing: { before: 100, after: 100 } })],
                        verticalAlign: docx.VerticalAlign.CENTER
                      }),
                      new docx.TableCell({ 
                        children: [new docx.Paragraph({ text: p.notes || "", alignment: docx.AlignmentType.CENTER, bidirectional: true, spacing: { before: 100, after: 100 } })],
                        verticalAlign: docx.VerticalAlign.CENTER
                      }),
                    ],
                  });
                }),
              ],
            }),
            new docx.Paragraph({ text: "", spacing: { before: 400 } }),
            new docx.Paragraph({
              alignment: docx.AlignmentType.RIGHT,
              bidirectional: true,
              children: [
                new docx.TextRun({
                  text: "إحصائيات المندوب",
                  bold: true,
                  size: 28,
                  font: "Arial",
                  underline: { type: docx.UnderlineType.SINGLE }
                }),
              ],
            }),
            new docx.Paragraph({
              alignment: docx.AlignmentType.RIGHT,
              bidirectional: true,
              children: [
                new docx.TextRun({ text: `إجمالي المعتمرين: ${pilgrims.length}`, size: 24, font: "Arial" }),
              ],
              spacing: { before: 200 },
            }),
            new docx.Paragraph({
              alignment: docx.AlignmentType.RIGHT,
              bidirectional: true,
              children: [
                new docx.TextRun({ text: `رجال: ${pilgrims.filter((p: any) => p.gender === 'Male' && p.age_group === 'Adult').length}`, size: 24, font: "Arial" }),
              ],
            }),
            new docx.Paragraph({
              alignment: docx.AlignmentType.RIGHT,
              bidirectional: true,
              children: [
                new docx.TextRun({ text: `نساء: ${pilgrims.filter((p: any) => p.gender === 'Female' && p.age_group === 'Adult').length}`, size: 24, font: "Arial" }),
              ],
            }),
            new docx.Paragraph({
              alignment: docx.AlignmentType.RIGHT,
              bidirectional: true,
              children: [
                new docx.TextRun({ text: `أطفال: ${pilgrims.filter((p: any) => p.age_group === 'Child').length}`, size: 24, font: "Arial" }),
              ],
            }),
            new docx.Paragraph({
              alignment: docx.AlignmentType.RIGHT,
              bidirectional: true,
              children: [
                new docx.TextRun({ text: `رضع: ${pilgrims.filter((p: any) => p.gender === 'Infant' || p.age_group === 'Infant').length}`, size: 24, font: "Arial" }),
              ],
            }),
          ],
        }],
      });

      const blob = await docx.Packer.toBlob(doc);
      saveAs(blob, `كشف_مندوب_${agent?.name}.docx`);
    } catch (e) {
      console.error(e);
    }
  };

  const exportToWord = async () => {
    if (!selectedTripId) return;

    try {
      const res = await fetch(`/api/trips/${selectedTripId}`);
      const trip = await res.json();

      // Room color mapping (Professional Light Blue for rooms)
      const roomColors: { [key: string]: string } = {};
      const colors = ['D9EAF7', 'E8F4FD', 'CFE2F3', 'DEEBF7'];
      let colorIndex = 0;

      const pilgrims = [...trip.pilgrims].sort((a, b) => {
        if (!a.room_id && !b.room_id) return 0;
        if (!a.room_id) return 1;
        if (!b.room_id) return -1;
        return a.room_id.localeCompare(b.room_id, undefined, { numeric: true, sensitivity: 'base' });
      });
      
      // Add supervisors to the top if they exist
      const supervisors = [];
      if (trip.supervisor1_name) {
        supervisors.push({
          full_name: trip.supervisor1_name,
          agent_name: "المشرف",
          notes: "",
          isSupervisor: true,
          room_id: null
        });
      }
      if (trip.supervisor2_name) {
        supervisors.push({
          full_name: trip.supervisor2_name,
          agent_name: "المشرف",
          notes: "",
          isSupervisor: true,
          room_id: null
        });
      }

      const allRows = [...supervisors, ...pilgrims];

      const roomTypeArabic: { [key: string]: string } = {
        'Single': 'غرفة فردي',
        'Double': 'غرفة ثنائي',
        'Triple': 'غرفة ثلاثي',
        'Quad': 'غرفة رباعي',
        'Quint': 'غرفة خماسي',
        'Sext': 'غرفة سداسي',
        'No Housing (Makkah)': 'بدون سكن (مكة)',
        'No Housing (Madinah)': 'بدون سكن (المدينة)',
        'No Housing (Both)': 'بدون سكن (الاثنين)'
      };

      const doc = new docx.Document({
        sections: [{
          properties: {
            page: {
              margin: { top: 720, right: 720, bottom: 720, left: 720 },
              borders: {
                pageBorderTop: { style: docx.BorderStyle.DOUBLE, size: 24, space: 24, color: "000080" },
                pageBorderBottom: { style: docx.BorderStyle.DOUBLE, size: 24, space: 24, color: "000080" },
                pageBorderLeft: { style: docx.BorderStyle.DOUBLE, size: 24, space: 24, color: "000080" },
                pageBorderRight: { style: docx.BorderStyle.DOUBLE, size: 24, space: 24, color: "000080" },
              }
            },
          },
          children: [
            new docx.Paragraph({
              alignment: docx.AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new docx.TextRun({
                  text: "شركة مايوركا للسياحة",
                  bold: true,
                  size: 44,
                  font: "Arial",
                  color: "FF0000",
                  underline: { type: docx.UnderlineType.SINGLE, color: "FF0000" }
                }),
              ],
            }),
            new docx.Paragraph({
              alignment: docx.AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new docx.TextRun({
                  text: `كشف معتمري رحلة: ${trip.name}`,
                  bold: true,
                  size: 32,
                  font: "Arial",
                  color: "FF0000",
                }),
              ],
              spacing: { before: 200, after: 400 },
            }),
            new docx.Table({
              width: { size: 100, type: docx.WidthType.PERCENTAGE },
              alignment: docx.AlignmentType.CENTER,
              borders: {
                top: { style: docx.BorderStyle.SINGLE, size: 12, color: "000000" },
                bottom: { style: docx.BorderStyle.SINGLE, size: 12, color: "000000" },
                left: { style: docx.BorderStyle.SINGLE, size: 12, color: "000000" },
                right: { style: docx.BorderStyle.SINGLE, size: 12, color: "000000" },
                insideHorizontal: { style: docx.BorderStyle.SINGLE, size: 8, color: "000000" },
                insideVertical: { style: docx.BorderStyle.SINGLE, size: 8, color: "000000" },
              },
              rows: [
                new docx.TableRow({
                  tableHeader: true,
                  children: [
                    new docx.TableCell({ 
                      width: { size: 5, type: docx.WidthType.PERCENTAGE },
                      children: [new docx.Paragraph({ text: "م", alignment: docx.AlignmentType.CENTER, bidirectional: true, children: [new docx.TextRun({ bold: true, size: 24 })] })], 
                      shading: { fill: "F2F2F2" },
                      verticalAlign: docx.VerticalAlign.CENTER
                    }),
                    new docx.TableCell({ 
                      width: { size: 45, type: docx.WidthType.PERCENTAGE },
                      children: [new docx.Paragraph({ text: "الاسم", alignment: docx.AlignmentType.CENTER, bidirectional: true, children: [new docx.TextRun({ bold: true, size: 24 })] })], 
                      shading: { fill: "F2F2F2" },
                      verticalAlign: docx.VerticalAlign.CENTER
                    }),
                    new docx.TableCell({ 
                      width: { size: 20, type: docx.WidthType.PERCENTAGE },
                      children: [new docx.Paragraph({ text: "المندوب", alignment: docx.AlignmentType.CENTER, bidirectional: true, children: [new docx.TextRun({ bold: true, size: 24 })] })], 
                      shading: { fill: "F2F2F2" },
                      verticalAlign: docx.VerticalAlign.CENTER
                    }),
                    new docx.TableCell({ 
                      width: { size: 30, type: docx.WidthType.PERCENTAGE },
                      children: [new docx.Paragraph({ text: "ملاحظات", alignment: docx.AlignmentType.CENTER, bidirectional: true, children: [new docx.TextRun({ bold: true, size: 24 })] })], 
                      shading: { fill: "F2F2F2" },
                      verticalAlign: docx.VerticalAlign.CENTER
                    }),
                  ],
                }),
                ...allRows.map((p: any, index: number) => {
                  let shading = undefined;
                  if (p.room_id) {
                    if (!roomColors[p.room_id]) {
                      roomColors[p.room_id] = colors[colorIndex % colors.length];
                      colorIndex++;
                    }
                    shading = { fill: roomColors[p.room_id] };
                  }

                  let finalNotes = p.notes || "";
                  if (p.room_type && roomTypeArabic[p.room_type]) {
                    const typeText = roomTypeArabic[p.room_type];
                    finalNotes = `${typeText}${p.room_id ? ' #' + p.room_id : ''}${finalNotes ? ' - ' + finalNotes : ''}`;
                  }

                  // Vertical merging logic for Notes column
                  let vMerge = undefined;
                  if (p.room_id && !p.isSupervisor) {
                    const prevRow = allRows[index - 1];
                    const nextRow = allRows[index + 1];
                    
                    if (prevRow && prevRow.room_id === p.room_id) {
                      vMerge = docx.VerticalMergeType.CONTINUE;
                    } else if (nextRow && nextRow.room_id === p.room_id) {
                      vMerge = docx.VerticalMergeType.RESTART;
                    }
                  }

                  return new docx.TableRow({
                    children: [
                      new docx.TableCell({ 
                        children: [new docx.Paragraph({ text: (index + 1).toString(), alignment: docx.AlignmentType.CENTER, bidirectional: true, spacing: { before: 100, after: 100 } })],
                        shading: p.isSupervisor ? { fill: "F2F2F2" } : shading,
                        verticalAlign: docx.VerticalAlign.CENTER
                      }),
                      new docx.TableCell({ 
                        children: [new docx.Paragraph({ text: p.full_name, alignment: docx.AlignmentType.RIGHT, bidirectional: true, spacing: { before: 100, after: 100 }, indent: { right: 100 } })],
                        shading: p.isSupervisor ? { fill: "F2F2F2" } : shading,
                        verticalAlign: docx.VerticalAlign.CENTER
                      }),
                      new docx.TableCell({ 
                        children: [new docx.Paragraph({ text: p.agent_name || "---", alignment: docx.AlignmentType.CENTER, bidirectional: true, spacing: { before: 100, after: 100 } })],
                        shading: p.isSupervisor ? { fill: "F2F2F2" } : shading,
                        verticalAlign: docx.VerticalAlign.CENTER
                      }),
                      new docx.TableCell({ 
                        children: [new docx.Paragraph({ text: finalNotes, alignment: docx.AlignmentType.CENTER, bidirectional: true, spacing: { before: 100, after: 100 } })],
                        shading: p.isSupervisor ? { fill: "F2F2F2" } : shading,
                        verticalAlign: docx.VerticalAlign.CENTER,
                        verticalMerge: vMerge
                      }),
                    ],
                  });
                }),
              ],
            }),
            new docx.Paragraph({ text: "", spacing: { before: 400 } }),
            new docx.Paragraph({
              alignment: docx.AlignmentType.RIGHT,
              bidirectional: true,
              children: [
                new docx.TextRun({
                  text: "إحصائيات الرحلة",
                  bold: true,
                  size: 28,
                  font: "Arial",
                  underline: { type: docx.UnderlineType.SINGLE }
                }),
              ],
            }),
            new docx.Paragraph({
              alignment: docx.AlignmentType.RIGHT,
              bidirectional: true,
              children: [
                new docx.TextRun({ text: `إجمالي المعتمرين: ${trip.pilgrim_count}`, size: 24, font: "Arial" }),
              ],
              spacing: { before: 200 },
            }),
            new docx.Paragraph({
              alignment: docx.AlignmentType.RIGHT,
              bidirectional: true,
              children: [
                new docx.TextRun({ text: `رجال: ${trip.men_count_calc}`, size: 24, font: "Arial" }),
              ],
            }),
            new docx.Paragraph({
              alignment: docx.AlignmentType.RIGHT,
              bidirectional: true,
              children: [
                new docx.TextRun({ text: `نساء: ${trip.women_count_calc}`, size: 24, font: "Arial" }),
              ],
            }),
            new docx.Paragraph({
              alignment: docx.AlignmentType.RIGHT,
              bidirectional: true,
              children: [
                new docx.TextRun({ text: `أطفال: ${trip.children_count_calc}`, size: 24, font: "Arial" }),
              ],
            }),
            new docx.Paragraph({
              alignment: docx.AlignmentType.RIGHT,
              bidirectional: true,
              children: [
                new docx.TextRun({ text: `رضع: ${trip.infants_count_calc}`, size: 24, font: "Arial" }),
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
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{t('reports')}</h2>
        <p className="text-slate-500 dark:text-slate-400">استخراج التقارير والكشوفات بصيغ مختلفة</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="admin-card p-8">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <FileText size={20} className="text-blue-500" />
            كشف الرحلة
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">اختر الرحلة</label>
              <select 
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="input-field"
              >
                <option value="">اختر الرحلة</option>
                {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-3 pt-4">
              <button 
                onClick={exportToWord}
                disabled={!selectedTripId}
                className="w-full py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 text-blue-600 dark:text-blue-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
              >
                <FileIcon size={20} />
                {t('export_word')}
              </button>
              <button 
                onClick={exportToExcel}
                disabled={!selectedTripId}
                className="w-full py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
              >
                <TableIcon size={20} />
                {t('export_excel')}
              </button>
              <button 
                onClick={handlePrint}
                disabled={!selectedTripId}
                className="w-full py-4 rounded-2xl bg-blue-600 text-white flex items-center justify-center gap-3 font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                <Printer size={20} />
                {t('print')}
              </button>
            </div>
          </div>
        </div>

        <div className="admin-card p-8">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <UserRound size={20} className="text-violet-500" />
            كشف المندوب
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">اختر المندوب</label>
              <select 
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="input-field"
              >
                <option value="">اختر المندوب</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-3 pt-4">
              <button 
                onClick={exportAgentToWord}
                disabled={!selectedAgentId}
                className="w-full py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 text-violet-600 dark:text-violet-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
              >
                <FileIcon size={20} />
                تصدير كشف المندوب (Word)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
