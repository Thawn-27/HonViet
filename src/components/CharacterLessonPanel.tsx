import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Circle, PenTool, Sparkles } from 'lucide-react';
import type { HanNomChar, Monument } from '../data/hanNomData';
import { TracingCanvas } from './TracingCanvas';

interface CharacterLessonPanelProps {
  charData: HanNomChar;
  monument: Monument;
  isMastered: boolean;
  onToggleMastered: (charId: string) => void;
  onJumpToPractice: () => void;
}

export const CharacterLessonPanel: React.FC<CharacterLessonPanelProps> = ({
  charData,
  monument,
  isMastered,
  onToggleMastered,
  onJumpToPractice,
}) => {
  const [activeTab, setActiveTab] = useState<'lesson' | 'write'>('lesson');
  const hotspot = monument.hotspots.find((h) => h.charId === charData.id);

  const cx = hotspot ? hotspot.x + hotspot.w / 2 : 50;
  const cy = hotspot ? hotspot.y + hotspot.h / 2 : 50;
  const cropWidthPct = hotspot ? Math.min(2200, Math.max(350, (100 / hotspot.w) * 78)) : 200;

  const difficultyLabel =
    charData.difficulty === 'co_ban'
      ? 'Cơ bản'
      : charData.difficulty === 'thong_dung'
      ? 'Thông dụng'
      : 'Chuyên sâu';

  return (
    <div className="bg-white border border-[#DDD9D0] rounded-xl p-5 sm:p-6 space-y-5">
      {/* Header row: Specimen + Reading + Mastered action */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#DDD9D0]">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl border border-[#DDD9D0] han-grid-bg flex items-center justify-center shrink-0">
            <span className="font-han text-5xl text-[#18181B] leading-none">{charData.char}</span>
          </div>

          {/* Magnified real photo crop from monument */}
          {hotspot && (
            <div
              className="w-20 h-20 rounded-xl border border-[#DDD9D0] bg-[#18181B] relative overflow-hidden shrink-0"
              title="Ảnh cắt trực tiếp từ di tích"
            >
              <img
                src={monument.imageUrl}
                alt={`Chữ ${charData.char} khắc trên ${monument.title}`}
                referrerPolicy="no-referrer"
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: `${cropWidthPct}%`,
                  height: 'auto',
                  maxWidth: 'none',
                  transform: `translate(-${cx}%, -${cy}%)`,
                }}
                className="select-none pointer-events-none"
              />
              <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-[#18181B]/75 text-[10px] text-white leading-none">
                Ảnh bia
              </span>
            </div>
          )}

          <div>
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <h3 className="text-2xl font-display font-semibold text-[#18181B]">
                {charData.hanViet}
              </h3>
              {charData.nomVernacular && (
                <span className="text-sm text-[#57534E]">({charData.nomVernacular})</span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#57534E]">
              <span>Bộ {charData.radical}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{charData.strokes} nét</span>
              <span aria-hidden="true">·</span>
              <span>{difficultyLabel}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleMastered(charData.id)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            isMastered
              ? 'bg-[#14532D] text-white border-[#14532D]'
              : 'bg-[#F8F7F4] text-[#18181B] border-[#DDD9D0] hover:bg-[#ECEAE4]'
          }`}
        >
          {isMastered ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <Circle className="w-3.5 h-3.5" />
          )}
          <span>{isMastered ? 'Đã thuộc chữ' : 'Đánh dấu đã thuộc'}</span>
        </button>
      </div>

      {/* Mode Switcher: Chiết tự & Nghĩa vs Tập viết */}
      <div className="flex items-center gap-1 p-1 bg-[#ECEAE4] rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('lesson')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'lesson'
              ? 'bg-white text-[#18181B] shadow-xs'
              : 'text-[#57534E] hover:text-[#18181B]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Chiết tự & Ngữ cảnh bia</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('write')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'write'
              ? 'bg-white text-[#18181B] shadow-xs'
              : 'text-[#57534E] hover:text-[#18181B]'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Tập tô nét chữ</span>
        </button>
      </div>

      {activeTab === 'lesson' ? (
        <div className="space-y-4">
          {/* Meaning & Stele context */}
          <dl className="divide-y divide-[#ECEAE4] text-sm">
            <div className="py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-1">
              <dt className="text-xs font-medium text-[#57534E]">Nghĩa cốt lõi</dt>
              <dd className="sm:col-span-2 text-[#18181B] font-medium">{charData.meaning}</dd>
            </div>
            <div className="py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-1">
              <dt className="text-xs font-medium text-[#57534E]">Vị trí trên bia quê</dt>
              <dd className="sm:col-span-2 text-[#3F3F46] leading-relaxed">
                {charData.steleUsage}
              </dd>
            </div>
            <div className="py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-1">
              <dt className="text-xs font-medium text-[#57534E]">Cấu tạo chữ</dt>
              <dd className="sm:col-span-2 text-[#18181B]">
                <span className="font-han text-base mr-1.5">{charData.radical}</span>
                <span className="text-xs text-[#57534E]">({charData.radicalMeaning})</span>
                <p className="mt-1 text-sm text-[#3F3F46]">{charData.decomposition}</p>
              </dd>
            </div>
          </dl>

          {/* Mnemonic box without left accent bar */}
          <div className="rounded-xl border border-[#DDD9D0] bg-[#F8F7F4] p-4">
            <div className="text-xs font-semibold text-[#1E3A5F] mb-1">Mẹo nhận mặt nhanh</div>
            <p className="text-sm text-[#27272A] leading-relaxed">{charData.mnemonic}</p>
          </div>

          {/* Compounds on steles */}
          <div>
            <div className="text-xs font-medium text-[#57534E] mb-2">
              Cụm từ thường gặp trên văn bia & hoành phi
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {charData.compounds.map((comp) => (
                <div
                  key={comp.han}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[#ECEAE4] bg-[#FCFBF9]"
                >
                  <span className="font-han text-2xl text-[#18181B] shrink-0">{comp.han}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#18181B] truncate">
                      {comp.reading}
                    </div>
                    <div className="text-xs text-[#57534E] truncate">{comp.meaning}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onJumpToPractice}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:bg-[#162C49] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Luyện thẻ nhớ bộ chữ này</span>
            </button>
          </div>
        </div>
      ) : (
        <TracingCanvas character={charData.char} reading={charData.hanViet} />
      )}
    </div>
  );
};
