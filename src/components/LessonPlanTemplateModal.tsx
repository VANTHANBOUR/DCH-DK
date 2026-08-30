import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OfficialTemplateView } from './OfficialTemplateView';
import { 
  X, 
  Printer, 
  Download, 
  Plus, 
  FileText, 
  Check, 
  Sparkles,
  Layers,
  Copy,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { INITIAL_LESSON_PLANS } from '../data/mockData';

interface LessonPlanTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: () => void;
}

export const LessonPlanTemplateModal: React.FC<LessonPlanTemplateModalProps> = ({
  isOpen,
  onClose,
  onUseTemplate,
}) => {
  const { showToast } = useApp();
  const [templateMode, setTemplateMode] = useState<'blank' | 'sample'>('blank');

  if (!isOpen) return null;

  const samplePlan = INITIAL_LESSON_PLANS[0];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDoc = () => {
    const isBlank = templateMode === 'blank';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Dewey Childcare House - Lesson Plan Template</title>
        <style>
          body { font-family: Calibri, Arial, sans-serif; margin: 40px; color: #000; }
          .header { text-align: center; margin-bottom: 25px; }
          .school-title { color: #006838; font-size: 24pt; font-weight: bold; text-transform: uppercase; margin: 0; font-family: Georgia, serif; }
          .doc-title { font-size: 18pt; font-weight: bold; text-decoration: underline; margin-top: 6px; }
          .meta-table { width: 100%; margin-bottom: 20px; font-size: 12pt; }
          .meta-table td { padding: 6px 0; }
          .dotted-line { border-bottom: 1px dotted #555; display: inline-block; min-width: 180px; }
          .section-title { font-weight: bold; font-size: 13pt; margin-top: 18px; margin-bottom: 8px; }
          .section-content { margin-left: 25px; font-size: 11pt; }
          table.session-table { width: 100%; border-collapse: collapse; border: 2px solid #000; margin-top: 8px; font-size: 10.5pt; }
          table.session-table th, table.session-table td { border: 1.5px solid #000; padding: 8px; text-align: left; vertical-align: top; }
          table.session-table th { background-color: #f2f2f2; font-weight: bold; }
          .duration-col { width: 12%; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="school-title">Dewey Childcare House</div>
          <div class="doc-title">Lesson Plan</div>
        </div>

        <table class="meta-table">
          <tr>
            <td width="50%"><strong>Date:</strong> ${isBlank ? '..................................................' : (samplePlan.planDate || samplePlan.startDate)}</td>
            <td width="50%"><strong>Week:</strong> ${isBlank ? '..................................................' : `Week ${samplePlan.weekNumber}`}</td>
          </tr>
          <tr>
            <td><strong>Class:</strong> ${isBlank ? '..................................................' : `${samplePlan.className} (${samplePlan.ageGroup})`}</td>
            <td><strong>Time:</strong> ${isBlank ? '.................... to ....................' : `${samplePlan.timeStart || '08:30 AM'} to ${samplePlan.timeEnd || '11:30 AM'}`}</td>
          </tr>
        </table>

        <div class="section-title">I. &nbsp;&nbsp; Warm up/ circle time:</div>
        <div class="section-content">
          ${isBlank ? '<p>........................................................................................................................................................</p><p>........................................................................................................................................................</p>' : `<p>${samplePlan.warmUpCircleTime || samplePlan.circleTimeActivities}</p>`}
        </div>

        <div class="section-title">II. &nbsp;&nbsp; 1<sup>st</sup> Session:</div>
        <div class="section-content">
          <p><strong>Subject:</strong> ${isBlank ? '..................................................' : (samplePlan.firstSession?.subject || 'Language & Trilingual Early Literacy')}</p>
          <table class="session-table">
            <thead>
              <tr>
                <th width="30%">Topic/Activity</th>
                <th width="30%">Objective(s)</th>
                <th width="28%">Materials/ sources</th>
                <th class="duration-col">Duration (mns)</th>
              </tr>
            </thead>
            <tbody>
              ${isBlank ? `
              <tr style="height: 80px;"><td></td><td></td><td></td><td class="duration-col"></td></tr>
              <tr style="height: 80px;"><td></td><td></td><td></td><td class="duration-col"></td></tr>
              ` : samplePlan.firstSession?.activities?.map(a => `
              <tr>
                <td><strong>${a.topicActivity}</strong></td>
                <td>${a.objectives}</td>
                <td>${a.materialsSources}</td>
                <td class="duration-col"><strong>${a.durationMins} mns</strong></td>
              </tr>
              `).join('') || ''}
            </tbody>
          </table>
        </div>

        <div class="section-title">III. &nbsp;&nbsp; 2<sup>nd</sup> Session:</div>
        <div class="section-content">
          <p><strong>Subject:</strong> ${isBlank ? '..................................................' : (samplePlan.secondSession?.subject || 'Sensory Discovery Science & Creative Play')}</p>
          <table class="session-table">
            <thead>
              <tr>
                <th width="30%">Topic/Activity</th>
                <th width="30%">Objective(s)</th>
                <th width="28%">Materials/ sources</th>
                <th class="duration-col">Duration (mns)</th>
              </tr>
            </thead>
            <tbody>
              ${isBlank ? `
              <tr style="height: 80px;"><td></td><td></td><td></td><td class="duration-col"></td></tr>
              <tr style="height: 80px;"><td></td><td></td><td></td><td class="duration-col"></td></tr>
              ` : samplePlan.secondSession?.activities?.map(a => `
              <tr>
                <td><strong>${a.topicActivity}</strong></td>
                <td>${a.objectives}</td>
                <td>${a.materialsSources}</td>
                <td class="duration-col"><strong>${a.durationMins} mns</strong></td>
              </tr>
              `).join('') || ''}
            </tbody>
          </table>
        </div>

        <div class="section-title">IV. &nbsp;&nbsp; Closing:</div>
        <div class="section-content">
          ${isBlank ? '<p>........................................................................................................................................................</p><p>........................................................................................................................................................</p>' : `<p>${samplePlan.closing || 'Review session highlights, tidy up learning areas, sing departure songs, and organize belongings for dismissal.'}</p>`}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `Dewey_Childcare_House_Lesson_Plan_Template_${isBlank ? 'Blank' : 'Sample'}.doc`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    showToast(`Downloaded official template in Word (.doc) format`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 via-[#006838] to-emerald-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                Official Lesson Plan Format Template
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 border border-emerald-400/40">
                  DCH Standard
                </span>
              </h2>
              <p className="text-xs text-emerald-200/90">
                Institutional 4-part structure (Warm up/Circle Time · 1st Session · 2nd Session · Closing)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setTemplateMode('blank')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                templateMode === 'blank'
                  ? 'bg-[#007A43] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Blank Printable Format</span>
            </button>
            <button
              onClick={() => setTemplateMode('sample')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                templateMode === 'sample'
                  ? 'bg-[#007A43] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Sample Lesson Plan View</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              title="Print official document format"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Template</span>
            </button>

            <button
              onClick={handleDownloadDoc}
              className="px-3 py-2 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              title="Download Word Document"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Export Word (.doc)</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onUseTemplate();
              }}
              className="px-4 py-2 bg-[#007A43] hover:bg-[#006838] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Create Plan with this Format</span>
            </button>
          </div>
        </div>

        {/* Template Preview Body */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 grow">
          <div className="max-w-3xl mx-auto">
            <OfficialTemplateView 
              plan={templateMode === 'sample' ? samplePlan : null}
              showDottedLinesIfBlank={true}
            />
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Dewey Childcare House · Official Early Childhood Curriculum Format</span>
          <span>Ready for A4/Letter Print & Digital Archiving</span>
        </div>
      </div>
    </div>
  );
};
