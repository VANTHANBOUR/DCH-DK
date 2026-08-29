import React from 'react';
import { BrandLogo, DCHShield } from './BrandLogo';
import { X, Sparkles, Check, Download, Palette, Type, Shield, Layers } from 'lucide-react';

interface BrandGuidelinesModalProps {
  onClose: () => void;
}

export const BrandGuidelinesModal: React.FC<BrandGuidelinesModalProps> = ({ onClose }) => {
  const COLOR_PALETTE = [
    {
      name: 'DCH Forest Emerald Green',
      khmerName: 'ពណ៌បៃតងព្រៃឌូវី',
      hex: '#007A43',
      rgb: 'RGB(0, 122, 67)',
      usage: 'Primary brand identity, headers, main shield half, active buttons, borders',
      textColor: 'text-white',
    },
    {
      name: 'DCH Deep Evergreen',
      khmerName: 'ពណ៌បៃតងចាស់',
      hex: '#006338',
      rgb: 'RGB(0, 99, 56)',
      usage: 'Typography dark headlines, button hover states, shield left fill',
      textColor: 'text-white',
    },
    {
      name: 'DCH Bright Amber Gold',
      khmerName: 'ពណ៌ទឹកក្រូចមាស',
      hex: '#E68A00',
      rgb: 'RGB(230, 138, 0)',
      usage: 'Shield inner stroke, graduation cap tassel, highlights, badges, ribbons',
      textColor: 'text-white',
    },
    {
      name: 'DCH Warm Honey Gold',
      khmerName: 'ពណ៌មាសស្រាល',
      hex: '#F59E0B',
      rgb: 'RGB(245, 158, 11)',
      usage: 'Notification dots, sparkles, warning tags, secondary accents',
      textColor: 'text-slate-900',
    },
    {
      name: 'DCH Mint Sage Tint',
      khmerName: 'ពណ៌បៃតងខ្ចីស្រាល',
      hex: '#E6F5ED',
      rgb: 'RGB(230, 245, 237)',
      usage: 'Card backgrounds, highlight containers, table zebra stripes',
      textColor: 'text-emerald-950',
    },
    {
      name: 'DCH Crisp Ivory White',
      khmerName: 'ពណ៌សបរិសុទ្ធ',
      hex: '#FFFFFF',
      rgb: 'RGB(255, 255, 255)',
      usage: 'Canvas background, letterhead paper, card bodies, shield right half',
      textColor: 'text-slate-900',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#006338] to-[#007A43] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                Dewey Childcare House (DCH) · Brand & Letterhead Guidelines
              </h2>
              <p className="text-xs text-emerald-100 font-medium font-['Battambang']">
                គោលការណ៍ណែនាំអត្តសញ្ញាណម៉ាក និងក្បាលសំបុត្រផ្លូវការ
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Section 1: Official Letterhead Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#007A43]" />
                <span>Official Brand Letterhead (Master Banner)</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Vector Precision
              </span>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm">
              <BrandLogo variant="full-letterhead" />
            </div>
          </div>

          {/* Section 2: Color Palette Swatches */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#007A43]" />
              <span>Official Brand Color Palette</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {COLOR_PALETTE.map((color, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs bg-white flex flex-col justify-between"
                >
                  <div
                    className={`h-20 p-3 flex flex-col justify-between ${color.textColor}`}
                    style={{ backgroundColor: color.hex }}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                      {color.hex}
                    </span>
                    <span className="text-xs font-black">{color.name}</span>
                  </div>

                  <div className="p-3 space-y-1 bg-slate-50/50">
                    <p className="text-[11px] font-bold text-emerald-900 font-['Battambang']">
                      {color.khmerName}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {color.usage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Typography Guidelines */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-2">
              <Type className="w-4 h-4 text-emerald-700" />
              <span>Typography Pairing & Trilingual Fonts</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-emerald-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Khmer Headlines</span>
                <p className="text-base font-extrabold text-[#007A43] font-['Battambang']">
                  ឌូវី ឆាល់ឃែរ៍ ហោស៍
                </p>
                <p className="text-[11px] text-slate-500">Battambang / Kantumruy Pro (Bold)</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">English Display</span>
                <p className="text-sm font-black text-[#007A43] font-['Outfit'] uppercase tracking-wider">
                  DEWEY CHILDCARE HOUSE
                </p>
                <p className="text-[11px] text-slate-500">Outfit / Plus Jakarta Sans (Black)</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Khmer Subtitle</span>
                <p className="text-xs font-bold text-[#007A43] font-['Kantumruy_Pro']">
                  មត្តេយ្យសិក្សាអន្តរជាតិ ៣ ភាសា
                </p>
                <p className="text-[11px] text-slate-500">Kantumruy Pro (Medium / SemiBold)</p>
              </div>
            </div>
          </div>

          {/* Section 4: Shield Symbolism */}
          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl flex items-start gap-4">
            <DCHShield size={48} className="shrink-0" />
            <div className="space-y-1 text-xs text-slate-700">
              <h4 className="font-extrabold text-amber-950">The DCH Shield Symbolism:</h4>
              <p>
                • <strong>Left Emerald Half:</strong> Represents early childhood vitality, growth, natural discovery, and stability with DCH acronym.
              </p>
              <p>
                • <strong>Right Half:</strong> The open book and golden mortarboard symbolize trilingual academic foundation (English, Khmer, Chinese), curiosity, and continuous learning.
              </p>
              <p>
                • <strong>Gold Inner Stroke:</strong> Symbolizes warm childcare protection, excellence, and kindergarten milestones.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#007A43] hover:bg-[#006338] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
          >
            Close Guidelines
          </button>
        </div>
      </div>
    </div>
  );
};
