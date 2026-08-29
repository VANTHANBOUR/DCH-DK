import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LessonPlan } from '../types';
import { BrandLogo, DCHShield } from './BrandLogo';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Send, 
  MessageSquare, 
  Languages, 
  Sparkles, 
  Edit3, 
  ShieldCheck,
  Star,
  Check,
  Trash2,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LessonPlanDetailModalProps {
  plan: LessonPlan;
  onClose: () => void;
  onEdit: () => void;
}

export const LessonPlanDetailModal: React.FC<LessonPlanDetailModalProps> = ({
  plan,
  onClose,
  onEdit,
}) => {
  const { currentUser, adminReviewPlan, deleteLessonPlan, showToast } = useApp();

  // Review Form State
  const [adminComment, setAdminComment] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rubricScores, setRubricScores] = useState({
    curriculumAlignment: 5,
    trilingualIntegration: 5,
    sensorySafety: 5,
    differentiation: 5,
  });

  const isAcademicAuthority = currentUser.role === 'admin' || currentUser.role === 'academic_officer';
  const isPlanOwner = currentUser.role === 'teacher' && currentUser.id === plan.teacherId;
  const canDelete = isAcademicAuthority || isPlanOwner;

  const getStatusBadge = (status: LessonPlan['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-extrabold tracking-wide uppercase">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Approved
          </span>
        );
      case 'revision_requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-extrabold tracking-wide uppercase">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            Revision Requested
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-900 border border-blue-300 rounded-full text-xs font-extrabold tracking-wide uppercase">
            <Clock className="w-3.5 h-3.5 text-blue-700" />
            Submitted · Pending Review
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-900 border border-purple-300 rounded-full text-xs font-extrabold tracking-wide uppercase">
            <Clock className="w-3.5 h-3.5 text-purple-700" />
            Under Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-full text-xs font-extrabold tracking-wide uppercase">
            Draft
          </span>
        );
    }
  };

  const handleAdminAction = (action: 'approved' | 'revision_requested' | 'comment_only') => {
    if (action === 'revision_requested' && !adminComment.trim()) {
      showToast('Please provide feedback notes explaining what revisions are needed.', 'warning');
      return;
    }

    const defaultComment = action === 'approved' 
      ? 'Lesson plan reviewed and officially approved for classroom execution.' 
      : adminComment;

    adminReviewPlan(plan.id, action, adminComment.trim() || defaultComment, rubricScores);

    if (action === 'approved') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#007A43', '#F59E0B', '#10B981'],
      });
    }

    setAdminComment('');
  };

  const handleDeletePlan = () => {
    deleteLessonPlan(plan.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  const simulateDownload = (filename: string) => {
    showToast(`Downloading "${filename}"...`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-h-none print:rounded-none">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Lesson Plan Dossier
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-300 font-medium">
              Week {plan.weekNumber} · {plan.className}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isPlanOwner && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Edit Plan</span>
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-900/40 hover:bg-rose-800 text-rose-200 text-xs font-bold rounded-xl transition-colors"
                title="Delete this lesson plan"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              title="Print official letterhead lesson plan"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 print:p-6 print:overflow-visible">
          {/* Brand Letterhead Header */}
          <div className="border-b-2 border-[#007A43] pb-4">
            <BrandLogo variant="full-letterhead" />
          </div>

          {/* Document Meta Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
            <div className="flex items-center gap-3.5">
              <img
                src={plan.teacherAvatar}
                alt={plan.teacherName}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30"
              />
              <div>
                <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">
                  Lead Educator Submission
                </p>
                <h3 className="text-base font-extrabold text-slate-900">{plan.teacherName}</h3>
                <p className="text-xs text-slate-600 font-medium">
                  {plan.className} · {plan.ageGroup}
                </p>
              </div>
            </div>

            <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-1">
              {getStatusBadge(plan.status)}
              <span className="text-[11px] text-slate-500 font-medium">
                {plan.term} · Week {plan.weekNumber} ({plan.startDate} to {plan.endDate})
              </span>
            </div>
          </div>

          {/* Thematic Unit Banner */}
          <div className="p-5 bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#007A43]">
              Thematic Curriculum Unit
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {plan.themeTitle}
            </h2>
            {plan.themeDescription && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                {plan.themeDescription}
              </p>
            )}

            {/* Domains */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {plan.domains.map((dom, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-emerald-100/70 text-[#006838] border border-emerald-200 rounded-lg text-[11px] font-bold"
                >
                  {dom}
                </span>
              ))}
            </div>
          </div>

          {/* Trilingual Matrix Card */}
          <div className="p-5 bg-emerald-50/40 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-emerald-700" />
              <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                Trilingual Early Childhood Focus (English · Khmer · Chinese)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                <p className="text-[11px] font-extrabold text-blue-700 uppercase mb-1.5">
                  🇬🇧 English Vocabulary
                </p>
                <div className="flex flex-wrap gap-1">
                  {plan.trilingualFocus.englishVocab.map((w, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-900 rounded text-xs font-semibold">
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                <p className="text-[11px] font-extrabold text-emerald-700 uppercase mb-1.5 font-['Battambang']">
                  🇰🇭 Khmer Vocabulary & Phonics
                </p>
                <div className="flex flex-wrap gap-1">
                  {plan.trilingualFocus.khmerVocab.map((w, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-900 rounded text-xs font-bold font-['Battambang']">
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                <p className="text-[11px] font-extrabold text-amber-700 uppercase mb-1.5">
                  🇨🇳 Mandarin Immersion
                </p>
                <div className="flex flex-wrap gap-1">
                  {plan.trilingualFocus.chineseVocab.map((w, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-amber-50 text-amber-900 rounded text-xs font-semibold">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-white/90 p-3 rounded-xl border border-emerald-100">
                <span className="font-bold text-slate-700 block mb-0.5">🎵 Songs & Circle Rhymes:</span>
                <span className="text-slate-800">{plan.trilingualFocus.songOrRhyme}</span>
              </div>
              <div className="bg-white/90 p-3 rounded-xl border border-emerald-100">
                <span className="font-bold text-slate-700 block mb-0.5">📖 Featured Literature:</span>
                <span className="text-slate-800">{plan.trilingualFocus.storyBook}</span>
              </div>
            </div>
          </div>

          {/* Objectives */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Learning Milestones & Objectives
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plan.learningObjectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-xs text-slate-800 font-medium leading-relaxed">{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Kindergarten Stations & Centers */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Learning Centers & Activity Stations
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plan.learningCenters.map((center) => (
                <div key={center.id} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-[#007A43]">{center.centerName}</h5>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {center.activityDescription}
                  </p>
                  {center.materials && (
                    <p className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                      <span className="font-bold text-slate-600">Supplies:</span> {center.materials}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Circle Time & Outdoor Play */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50/50 border border-amber-200/70 rounded-2xl">
              <h4 className="text-xs font-bold text-amber-900 uppercase mb-1">
                ☀️ Circle Time & Morning Greeting
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">{plan.circleTimeActivities}</p>
            </div>

            <div className="p-4 bg-emerald-50/50 border border-emerald-200/70 rounded-2xl">
              <h4 className="text-xs font-bold text-emerald-900 uppercase mb-1">
                🏃 Outdoor Play & Gross Motor
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">{plan.outdoorSensoryPlay}</p>
            </div>
          </div>

          {/* Attached Files & Documents */}
          {plan.attachments && plan.attachments.length > 0 && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Attached Documents & Worksheets ({plan.attachments.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {plan.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{att.name}</p>
                        <p className="text-[10px] text-slate-500">{att.size} · {att.uploadedAt}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => simulateDownload(att.name)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review & Feedback History Log */}
          {plan.feedbackHistory && plan.feedbackHistory.length > 0 && (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <span>Academic Director & Principal Feedback Log</span>
              </h4>
              <div className="space-y-2.5">
                {plan.feedbackHistory.map((fb) => (
                  <div key={fb.id} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span className="text-xs font-bold text-slate-900">{fb.reviewerName}</span>
                        <span className="text-[10px] text-slate-500 font-medium">({fb.reviewerRole})</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{fb.date}</span>
                    </div>
                    <p className="text-xs text-slate-700 italic">"{fb.comment}"</p>
                    {fb.rubricScores && (
                      <div className="flex flex-wrap gap-3 pt-1 text-[11px] font-semibold text-emerald-900 border-t border-slate-100">
                        <span>Curriculum: {fb.rubricScores.curriculumAlignment}/5 ⭐</span>
                        <span>Trilingual: {fb.rubricScores.trilingualIntegration}/5 ⭐</span>
                        <span>Safety: {fb.rubricScores.sensorySafety}/5 ⭐</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACADEMIC OFFICER & ADMIN ONLY: Evaluation & Approval Panel */}
          {isAcademicAuthority && (
            <div className="p-5 bg-gradient-to-br from-emerald-50/80 to-blue-50/80 border-2 border-emerald-300 rounded-2xl space-y-4 print:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentUser.role === 'admin' ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-800" />
                  ) : (
                    <Award className="w-5 h-5 text-blue-800" />
                  )}
                  <h4 className="text-sm font-black text-emerald-950 uppercase tracking-wide">
                    {currentUser.role === 'admin' ? 'Principal & Academic Review Panel' : 'Academic Officer Quality & Approval Panel'}
                  </h4>
                </div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  currentUser.role === 'admin'
                    ? 'text-amber-800 bg-amber-100 border-amber-300'
                    : 'text-blue-800 bg-blue-100 border-blue-300'
                }`}>
                  {currentUser.role === 'admin' ? '👑 Principal Authority' : '🎓 Academic Officer Authority'}
                </span>
              </div>

              {/* Rubric Rating Sliders */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-emerald-200">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    Curriculum Alignment: {rubricScores.curriculumAlignment}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={rubricScores.curriculumAlignment}
                    onChange={(e) => setRubricScores({ ...rubricScores, curriculumAlignment: parseInt(e.target.value) })}
                    className="w-full accent-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    Trilingual Immersion: {rubricScores.trilingualIntegration}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={rubricScores.trilingualIntegration}
                    onChange={(e) => setRubricScores({ ...rubricScores, trilingualIntegration: parseInt(e.target.value) })}
                    className="w-full accent-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    Sensory & Play Safety: {rubricScores.sensorySafety}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={rubricScores.sensorySafety}
                    onChange={(e) => setRubricScores({ ...rubricScores, sensorySafety: parseInt(e.target.value) })}
                    className="w-full accent-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    Differentiation: {rubricScores.differentiation}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={rubricScores.differentiation}
                    onChange={(e) => setRubricScores({ ...rubricScores, differentiation: parseInt(e.target.value) })}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              {/* Feedback notes */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Written Feedback / Directives to Lead Teacher
                </label>
                <textarea
                  rows={2}
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Enter specific commendations, safety adjustments, or required additions..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-emerald-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Plan</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdminAction('comment_only')}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors shadow-2xs"
                  >
                    Post Note Only
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdminAction('revision_requested')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    ⚠️ Request Revisions
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdminAction('approved')}
                    className="flex items-center gap-1.5 px-5 py-2 bg-[#007A43] hover:bg-[#006338] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
                  >
                    <Check className="w-4 h-4 text-amber-300" />
                    <span>Approve Lesson Plan</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Letterhead Footer */}
          <div className="pt-4 border-t border-slate-200 text-center space-y-1">
            <p className="text-[11px] text-slate-500 font-semibold">
              Dewey Childcare House · Early Childhood Trilingual Academic Excellence · Phnom Penh, Cambodia
            </p>
            <p className="text-[10px] text-slate-400">
              Approved records are archived permanently in the DCH Academic Management Information System.
            </p>
          </div>
        </div>

        {/* Modal Bottom Close */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Lesson Plan</h3>
                <p className="text-xs text-slate-500">Irreversible Action</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">"{plan.themeTitle}"</strong> (Week {plan.weekNumber} · {plan.className})?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePlan}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
