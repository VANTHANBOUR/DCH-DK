import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EarlyChildhoodAgeGroup, EarlyChildhoodDomain, LessonPlan, PlanAttachment } from '../types';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Trash2, 
  Sparkles, 
  Plus, 
  Check, 
  BookOpen, 
  Languages, 
  Palette, 
  Smile, 
  Layers, 
  Calendar,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LessonPlanEditorProps {
  initialPlan?: LessonPlan | null;
  onClose: () => void;
  onSaved?: () => void;
}

const DOMAIN_OPTIONS: EarlyChildhoodDomain[] = [
  'Language & Early Literacy',
  'Mathematics & Logic',
  'Sensory & Discovery Science',
  'Creative Arts & Music',
  'Physical & Motor Skills',
  'Social-Emotional Learning',
  'Khmer Language & Culture',
  'Mandarin Language Immersion',
];

export const LessonPlanEditor: React.FC<LessonPlanEditorProps> = ({
  initialPlan,
  onClose,
  onSaved,
}) => {
  const { currentUser, classrooms, createLessonPlan, updateLessonPlan, showToast } = useApp();

  // Form State
  const [classId, setClassId] = useState<string>(initialPlan?.classId || currentUser.assignedClassId || classrooms[0]?.id || '');
  const [weekNumber, setWeekNumber] = useState<number>(initialPlan?.weekNumber || 13);
  const [term, setTerm] = useState<string>(initialPlan?.term || 'Term 1 (Academic Year 2026)');
  const [startDate, setStartDate] = useState<string>(initialPlan?.startDate || '2026-09-08');
  const [endDate, setEndDate] = useState<string>(initialPlan?.endDate || '2026-09-12');
  const [themeTitle, setThemeTitle] = useState<string>(initialPlan?.themeTitle || '');
  const [themeDescription, setThemeDescription] = useState<string>(initialPlan?.themeDescription || '');
  const [domains, setDomains] = useState<EarlyChildhoodDomain[]>(
    initialPlan?.domains || ['Language & Early Literacy', 'Sensory & Discovery Science', 'Creative Arts & Music']
  );
  
  // Objectives
  const [learningObjectives, setLearningObjectives] = useState<string[]>(
    initialPlan?.learningObjectives || [
      'Engage in sensory exploration and name key theme items.',
      'Practice fine motor grip and cooperative center play.',
    ]
  );
  const [newObjectiveInput, setNewObjectiveInput] = useState('');

  // Circle Time & Activities
  const [circleTimeActivities, setCircleTimeActivities] = useState<string>(
    initialPlan?.circleTimeActivities || 'Welcome greeting song in 3 languages, interactive theme picture book, sound shaker rhythm game, daily weather check.'
  );
  const [outdoorSensoryPlay, setOutdoorSensoryPlay] = useState<string>(
    initialPlan?.outdoorSensoryPlay || 'Sensory obstacle path, parachute group games, chalk drawing station, and water basin play.'
  );
  const [assessmentMethods, setAssessmentMethods] = useState<string>(
    initialPlan?.assessmentMethods || 'Anecdotal notes, checklist of 3-language vocabulary recognition during circle time, photo portfolio evidence.'
  );

  // Learning Centers
  const [learningCenters, setLearningCenters] = useState(
    initialPlan?.learningCenters || [
      {
        id: 'lc_1',
        centerName: 'Sensory & Discovery Station',
        activityDescription: 'Water/sand table with theme models and scoop tools.',
        materials: 'Sensory bin, scoops, magnifiers, sorting bowls.',
      },
      {
        id: 'lc_2',
        centerName: 'Creative Arts Table',
        activityDescription: 'Theme craft using non-toxic washable paints and collage materials.',
        materials: 'Paper plates, tempera paints, safe glue, textured paper.',
      },
      {
        id: 'lc_3',
        centerName: 'Trilingual Literacy Nook',
        activityDescription: 'Flashcard matching in English, Khmer, and Chinese.',
        materials: 'Bilingual picture cards, wooden stylus, sand tracing trays.',
      },
    ]
  );

  // Trilingual Focus
  const [englishVocab, setEnglishVocab] = useState<string>(
    initialPlan?.trilingualFocus?.englishVocab?.join(', ') || 'Sun, Tree, Flower, Happy, Yellow'
  );
  const [khmerVocab, setKhmerVocab] = useState<string>(
    initialPlan?.trilingualFocus?.khmerVocab?.join(', ') || 'ព្រះអាទិត្យ (Preah A-tit), ដើមឈើ (Daeum Chheu), ផ្កា (Pka)'
  );
  const [chineseVocab, setChineseVocab] = useState<string>(
    initialPlan?.trilingualFocus?.chineseVocab?.join(', ') || '太阳 (Tàiyáng), 树 (Shù), 花 (Huā)'
  );
  const [songOrRhyme, setSongOrRhyme] = useState<string>(
    initialPlan?.trilingualFocus?.songOrRhyme || '"You Are My Sunshine" & Khmer greeting song "ជម្រាបសួរកូនៗ"'
  );
  const [storyBook, setStoryBook] = useState<string>(
    initialPlan?.trilingualFocus?.storyBook || '"The Tiny Seed" by Eric Carle (Trilingual Edition)'
  );

  // Materials
  const [materials, setMaterials] = useState<string>(
    initialPlan?.materialsAndSupplies?.join('\n') || 'Non-toxic paint\nCardstock paper\nSensory bin materials\nFlashcards'
  );

  // Attachments
  const [attachments, setAttachments] = useState<PlanAttachment[]>(
    initialPlan?.attachments || [
      {
        id: 'att_init',
        name: 'Weekly_EarlyChildhood_Curriculum_Schedule.pdf',
        size: '1.4 MB',
        type: 'pdf',
        uploadedAt: new Date().toISOString().substring(0, 10),
      },
    ]
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const selectedClass = classrooms.find(c => c.id === classId) || classrooms[0];

  const toggleDomain = (domain: EarlyChildhoodDomain) => {
    setDomains(prev =>
      prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
    );
  };

  const addObjective = () => {
    if (newObjectiveInput.trim()) {
      setLearningObjectives(prev => [...prev, newObjectiveInput.trim()]);
      setNewObjectiveInput('');
    }
  };

  const removeObjective = (index: number) => {
    setLearningObjectives(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: PlanAttachment[] = Array.from(files).map((file: File, idx: number) => {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      let type: PlanAttachment['type'] = 'pdf';
      if (['doc', 'docx'].includes(extension)) type = 'docx';
      else if (['jpg', 'jpeg', 'png', 'webp'].includes(extension)) type = 'image';
      else if (['xls', 'xlsx'].includes(extension)) type = 'xlsx';
      else if (['ppt', 'pptx'].includes(extension)) type = 'pptx';

      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;

      return {
        id: `att_${Date.now()}_${idx}`,
        name: file.name,
        size: sizeStr,
        type,
        uploadedAt: new Date().toISOString().substring(0, 16).replace('T', ' '),
      };
    });

    setAttachments(prev => [...prev, ...newAttachments]);
    showToast(`Attached ${newAttachments.length} file(s) to lesson plan`, 'success');
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // AI Early Childhood Curriculum Assistant Generator
  const handleGenerateAiSuggestions = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const themes = [
        {
          title: 'Garden Wonders: Flowers, Little Bugs & Soil Discovery',
          description: 'A tactile week of soil textures, observing live safe earthworms in terrariums, petal symmetry, and trilingual garden songs.',
          eng: 'Flower, Butterfly, Soil, Leaf, Green',
          khm: 'ផ្កា (Pka), មេអំបៅ (Me-Ambau), ដី (Dei), ស្លឹកឈើ (Sloek-Chheu)',
          chi: '花 (Huā), 蝴蝶 (Húdié), 泥土 (Nítǔ), 树叶 (Shùyè)',
          song: '"The Caterpillar Crawls" / របាំមេអំបៅ / 《蝴蝶飞飞》',
          book: '"The Very Hungry Caterpillar" & "Garden Friends"',
          objectives: [
            'Observe soil moisture and plant seeds in biodegradable pots.',
            'Identify 4 garden creatures in English, Khmer, and Mandarin.',
            'Develop sensory regulation through gentle tactile dirt and seed sorting.',
          ],
        },
        {
          title: 'Rainy Day Exploration: Clouds, Rainbows & Water Flow',
          description: 'Exploring precipitation physics with sponge water clouds, colored bubble foam rainbows, and splash sound rhythms.',
          eng: 'Rain, Cloud, Rainbow, Umbrella, Blue',
          khm: 'ភ្លៀង (Phlieng), ពពក (Po-pok), ឥន្ទធនូ (Enthe-nu), ឆ័ត្រ (Chhat)',
          chi: '下雨 (Xiàyǔ), 云 (Yún), 彩虹 (Cǎihóng), 雨伞 (Yǔsǎn)',
          song: '"Rain Rain Go Away" / ភ្លៀងធ្លាក់ពីលើមេឃ / 《大雨小雨》',
          book: '"Worm Weather" by Jean Taft & Trilingual Weather Readers',
          objectives: [
            'Simulate rain density using shaving cream and food dye in water cups.',
            'Practice color mixing to observe how primary colors form a rainbow.',
            'Dress up in play raincoats and boots for cooperative indoor puddle stepping.',
          ],
        },
      ];

      const picked = themes[Math.floor(Math.random() * themes.length)];
      setThemeTitle(picked.title);
      setThemeDescription(picked.description);
      setEnglishVocab(picked.eng);
      setKhmerVocab(picked.khm);
      setChineseVocab(picked.chi);
      setSongOrRhyme(picked.song);
      setStoryBook(picked.book);
      setLearningObjectives(picked.objectives);
      setIsAiGenerating(false);
      showToast('AI Early Childhood suggestions loaded into lesson plan!', 'success');
    }, 800);
  };

  const handleSave = (status: 'draft' | 'submitted') => {
    if (!themeTitle.trim()) {
      showToast('Please provide a Theme Title for this lesson plan', 'warning');
      return;
    }

    const payload = {
      teacherId: initialPlan?.teacherId || currentUser.id,
      teacherName: initialPlan?.teacherName || currentUser.name,
      teacherAvatar: initialPlan?.teacherAvatar || currentUser.avatar,
      teacherEmail: initialPlan?.teacherEmail || currentUser.email,
      classId: selectedClass.id,
      className: selectedClass.name,
      ageGroup: selectedClass.ageGroup,
      weekNumber: Number(weekNumber),
      term,
      startDate,
      endDate,
      themeTitle: themeTitle.trim(),
      themeDescription: themeDescription.trim(),
      domains,
      learningObjectives,
      circleTimeActivities,
      learningCenters,
      outdoorSensoryPlay,
      trilingualFocus: {
        englishVocab: englishVocab.split(',').map(s => s.trim()).filter(Boolean),
        khmerVocab: khmerVocab.split(',').map(s => s.trim()).filter(Boolean),
        chineseVocab: chineseVocab.split(',').map(s => s.trim()).filter(Boolean),
        songOrRhyme,
        storyBook,
      },
      assessmentMethods,
      materialsAndSupplies: materials.split('\n').map(s => s.trim()).filter(Boolean),
      attachments,
      status,
      submittedAt: status === 'submitted' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined,
    };

    if (initialPlan) {
      updateLessonPlan(initialPlan.id, payload);
    } else {
      createLessonPlan(payload);
    }

    if (status === 'submitted') {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#007A43', '#F59E0B', '#10B981', '#ffffff'],
      });
    }

    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 via-[#007A43] to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-xs">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {initialPlan ? 'Edit Lesson Plan' : 'Create & Upload Early Childhood Lesson Plan'}
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                Dewey Childcare House · Trilingual Kindergarten Curriculum
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* AI Helper Banner */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200/70 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-800 rounded-xl">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  AI Early Childhood Curriculum Spark
                </p>
                <p className="text-[11px] text-slate-600">
                  Need ideas for sensory bins, trilingual vocabulary, and circle time songs?
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGenerateAiSuggestions}
              disabled={isAiGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              {isAiGenerating ? 'Generating Ideas...' : '✨ Generate Play-Based Ideas'}
            </button>
          </div>

          {/* Section 1: Target Classroom & Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200/70 rounded-2xl">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Classroom & Level *
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {classrooms.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.ageGroup})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Week Number *
              </label>
              <input
                type="number"
                min="1"
                max="40"
                value={weekNumber}
                onChange={(e) => setWeekNumber(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 2: Thematic Unit Title & Description */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between mb-1">
                <span>Thematic Unit Title *</span>
                <span className="text-[10px] text-slate-400 font-normal">e.g. Under the Sea, Khmer New Year Traditions, Outer Space</span>
              </label>
              <input
                type="text"
                value={themeTitle}
                onChange={(e) => setThemeTitle(e.target.value)}
                placeholder="Enter engaging thematic title..."
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Weekly Pedagogical Overview & Big Idea
              </label>
              <textarea
                rows={2}
                value={themeDescription}
                onChange={(e) => setThemeDescription(e.target.value)}
                placeholder="Brief summary of inquiry questions, core concept, and child-led play goals..."
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 3: Curriculum Domains */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-2">
              Early Childhood Curriculum Domains Covered
            </label>
            <div className="flex flex-wrap gap-2">
              {DOMAIN_OPTIONS.map((domain) => {
                const isChecked = domains.includes(domain);
                return (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => toggleDomain(domain)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isChecked
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-400 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isChecked ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{domain}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Trilingual Learning Matrix (Brand Requirement: English, Khmer, Chinese) */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide">
                Trilingual Immersion Focus (English · Khmer · Chinese)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-emerald-900 block mb-1">
                  🇬🇧 English Vocabulary (comma-separated)
                </label>
                <input
                  type="text"
                  value={englishVocab}
                  onChange={(e) => setEnglishVocab(e.target.value)}
                  placeholder="Fish, Ocean, Wave, Blue"
                  className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-800 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-emerald-900 block mb-1">
                  🇰🇭 Khmer Vocabulary (with Phonetics)
                </label>
                <input
                  type="text"
                  value={khmerVocab}
                  onChange={(e) => setKhmerVocab(e.target.value)}
                  placeholder="ត្រី (Trei), សមុទ្រ (Samut)"
                  className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-800 focus:outline-emerald-600 font-['Battambang',sans-serif]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-emerald-900 block mb-1">
                  🇨🇳 Mandarin Vocabulary (with Pinyin)
                </label>
                <input
                  type="text"
                  value={chineseVocab}
                  onChange={(e) => setChineseVocab(e.target.value)}
                  placeholder="鱼 (Yú), 大海 (Dàhǎi)"
                  className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-800 focus:outline-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  🎵 Circle Time Songs & Rhymes
                </label>
                <input
                  type="text"
                  value={songOrRhyme}
                  onChange={(e) => setSongOrRhyme(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  📖 Featured Trilingual Storybook
                </label>
                <input
                  type="text"
                  value={storyBook}
                  onChange={(e) => setStoryBook(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Learning Objectives */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              Key Learning Milestones & Objectives
            </label>
            <div className="space-y-1.5 mb-2">
              {learningObjectives.map((obj, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="flex-1">{obj}</span>
                  <button
                    type="button"
                    onClick={() => removeObjective(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newObjectiveInput}
                onChange={(e) => setNewObjectiveInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                placeholder="Type learning objective and press Add..."
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-emerald-500"
              />
              <button
                type="button"
                onClick={addObjective}
                className="px-4 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs rounded-xl border border-emerald-200"
              >
                Add
              </button>
            </div>
          </div>

          {/* Section 6: Daily Flow (Circle Time, Learning Centers, Outdoor Play) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                ☀️ Circle Time & Morning Greeting
              </label>
              <textarea
                rows={3}
                value={circleTimeActivities}
                onChange={(e) => setCircleTimeActivities(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                🏃 Outdoor Play & Gross Motor Activity
              </label>
              <textarea
                rows={3}
                value={outdoorSensoryPlay}
                onChange={(e) => setOutdoorSensoryPlay(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Section 7: File Attachment Upload Area (Brand Feature) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-emerald-700" />
                <span>Upload Lesson Plan Document & Worksheets</span>
              </label>
              <span className="text-[11px] text-slate-500">Supports PDF, DOCX, XLSX, Images</span>
            </div>

            {/* Drag & Drop File Upload Container */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) {
                  const simulatedEvent = { target: { files: e.dataTransfer.files } } as any;
                  handleFileUpload(simulatedEvent);
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/80 scale-[1.01]'
                  : 'border-slate-300 hover:border-emerald-400 bg-slate-50/60'
              }`}
            >
              <input
                type="file"
                id="file-upload-input"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="file-upload-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-emerald-700 hover:underline">
                    Click to browse files
                  </span>{' '}
                  or drag and drop your lesson plan files here
                </div>
                <p className="text-[10px] text-slate-400">
                  e.g. Weekly_PreK_Ocean_Theme.pdf, Trilingual_Flashcard_Printables.docx
                </p>
              </label>
            </div>

            {/* Uploaded File List Chips */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Attached Documents ({attachments.length}):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachments.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-400">{file.size} · Uploaded</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(file.id)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSave('draft')}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl transition-all shadow-2xs"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave('submitted')}
              className="flex items-center gap-2 px-5 py-2 bg-[#007A43] hover:bg-[#006338] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <Check className="w-4 h-4 text-amber-300" />
              <span>Submit to Principal for Review</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
