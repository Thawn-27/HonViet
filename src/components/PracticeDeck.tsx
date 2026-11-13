import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  RotateCw,
  Shuffle,
  XCircle,
} from 'lucide-react';
import type { HanNomChar, Monument } from '../data/hanNomData';

interface PracticeDeckProps {
  chars: HanNomChar[];
  monuments: Monument[];
  masteredIds: string[];
  onToggleMastered: (charId: string) => void;
  onOpenInLesson: (charId: string, monumentId: string) => void;
}

type PracticeMode = 'flashcard' | 'quiz';
type FilterScope = 'all' | 'unmastered' | 'mastered';
type SurfaceTexture = 'paper' | 'stone' | 'gold';

export const PracticeDeck: React.FC<PracticeDeckProps> = ({
  chars,
  monuments,
  masteredIds,
  onToggleMastered,
  onOpenInLesson,
}) => {
  const [mode, setMode] = useState<PracticeMode>('flashcard');
  const [scope, setScope] = useState<FilterScope>('all');
  const [surface, setSurface] = useState<SurfaceTexture>('stone');
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  // Quiz states
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [quizStats, setQuizStats] = useState({ correct: 0, total: 0, streak: 0 });

  const filteredDeck = useMemo(() => {
    const base = chars.filter((c) => {
      if (scope === 'mastered') return masteredIds.includes(c.id);
      if (scope === 'unmastered') return !masteredIds.includes(c.id);
      return true;
    });
    if (shuffleSeed === 0) return base;
    // Deterministic Fisher-Yates shuffle based on shuffleSeed
    const copy = [...base];
    let s = shuffleSeed;
    for (let i = copy.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [chars, masteredIds, scope, shuffleSeed]);

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [scope, shuffleSeed]);

  const safeIndex = filteredDeck.length > 0 ? index % filteredDeck.length : 0;
  const currentCard = filteredDeck[safeIndex];

  // Quiz question generation
  const quizDeck = useMemo(() => {
    const copy = [...chars];
    let s = shuffleSeed + 17;
    for (let i = copy.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [chars, shuffleSeed]);

  const quizTarget = quizDeck[quizIndex % quizDeck.length];
  const quizMonument = useMemo(
    () => monuments.find((m) => m.id === quizTarget.monumentIds[0]) || monuments[0],
    [monuments, quizTarget]
  );
  const quizHotspot = useMemo(
    () => quizMonument.hotspots.find((h) => h.charId === quizTarget.id),
    [quizMonument, quizTarget]
  );

  const quizOptions = useMemo(() => {
    const distractors = chars
      .filter((c) => c.id !== quizTarget.id)
      .sort((a, b) => {
        const ha = (a.hanViet.charCodeAt(0) * 31 + quizIndex * 13) % 97;
        const hb = (b.hanViet.charCodeAt(0) * 31 + quizIndex * 13) % 97;
        return ha - hb;
      })
      .slice(0, 3);
    const pool = [quizTarget, ...distractors];
    return pool.sort((a, b) => a.id.localeCompare(b.id));
  }, [chars, quizTarget, quizIndex]);

  const handleSelectQuizOption = (optionId: string) => {
    if (selectedAnswerId !== null) return;
    setSelectedAnswerId(optionId);
    const isCorrect = optionId === quizTarget.id;
    setQuizStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));
  };

  const handleNextQuiz = () => {
    setSelectedAnswerId(null);
    setQuizIndex((prev) => prev + 1);
  };

  const surfaceStyles: Record<SurfaceTexture, { container: string; glyph: string; label: string }> = {
    paper: {
      container: 'bg-[#FCFBF8] border-[#DDD9D0]',
      glyph: 'text-[#18181B]',
      label: 'Giấy dó mực tàu',
    },
    stone: {
      container: 'bg-[#2C3034] border-[#1F2327]',
      glyph: 'text-[#E7E5E4] drop-shadow-[0_2px_2px_rgba(0,0,0,0.85)]',
      label: 'Khắc chìm đá xanh',
    },
    gold: {
      container: 'bg-[#171210] border-[#443322]',
      glyph: 'text-[#EAB308] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]',
      label: 'Hoành phi thếp vàng',
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DDD9D0]">
        <div className="flex items-center gap-1 p-1 bg-[#ECEAE4] rounded-lg">
          <button
            type="button"
            onClick={() => setMode('flashcard')}
            className={`px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'flashcard'
                ? 'bg-white text-[#18181B] shadow-xs'
                : 'text-[#57534E] hover:text-[#18181B]'
            }`}
          >
            Lật thẻ ghi nhớ
          </button>
          <button
            type="button"
            onClick={() => setMode('quiz')}
            className={`px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'quiz'
                ? 'bg-white text-[#18181B] shadow-xs'
                : 'text-[#57534E] hover:text-[#18181B]'
            }`}
          >
            Nhận mặt chữ trên bia
          </button>
        </div>

        {mode === 'flashcard' ? (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-[#ECEAE4] rounded-lg">
              {(
                [
                  ['all', `Tất cả (${chars.length})`],
                  ['unmastered', `Cần ôn (${chars.length - masteredIds.length})`],
                  ['mastered', `Đã thuộc (${masteredIds.length})`],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setScope(key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                    scope === key
                      ? 'bg-white text-[#18181B] shadow-xs'
                      : 'text-[#57534E] hover:text-[#18181B]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShuffleSeed((s) => s + 1)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-[#DDD9D0] bg-white text-[#18181B] hover:bg-[#ECEAE4] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Xáo trộn</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-xs text-[#57534E] tabular-nums">
            <span>
              Đúng:{' '}
              <strong className="text-[#18181B] font-mono">
                {quizStats.correct}/{quizStats.total}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Chuỗi đúng liên tiếp:{' '}
              <strong className="text-[#1E3A5F] font-mono">{quizStats.streak}</strong>
            </span>
          </div>
        )}
      </div>

      {mode === 'flashcard' ? (
        filteredDeck.length === 0 ? (
          <div className="rounded-xl border border-[#DDD9D0] bg-white p-12 text-center space-y-3">
            <p className="text-base font-medium text-[#18181B]">
              {scope === 'unmastered'
                ? 'Bạn đã đánh dấu thuộc toàn bộ chữ trong bộ sưu tập.'
                : 'Chưa có chữ nào được đánh dấu đã thuộc.'}
            </p>
            <button
              type="button"
              onClick={() => setScope('all')}
              className="px-4 py-2 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:bg-[#162C49] transition-colors cursor-pointer"
            >
              Xem lại toàn bộ thẻ
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Flashcard Stage */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-[#57534E] font-mono tabular-nums">
                  Thẻ {safeIndex + 1} / {filteredDeck.length}
                </span>

                {/* Surface Material Switcher so learners practice stone/gold/paper */}
                <div className="flex items-center gap-1 p-1 bg-[#ECEAE4] rounded-lg">
                  {(['stone', 'gold', 'paper'] as SurfaceTexture[]).map((tex) => (
                    <button
                      key={tex}
                      type="button"
                      onClick={() => setSurface(tex)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        surface === tex
                          ? 'bg-white text-[#18181B] shadow-xs'
                          : 'text-[#57534E] hover:text-[#18181B]'
                      }`}
                    >
                      {surfaceStyles[tex].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card */}
              <div
                onClick={() => setFlipped((f) => !f)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setFlipped((f) => !f);
                  }
                }}
                aria-label="Lật thẻ học chữ Hán Nôm"
                className={`min-h-[340px] rounded-xl border p-8 flex flex-col justify-between transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] ${
                  flipped ? 'bg-white border-[#DDD9D0]' : surfaceStyles[surface].container
                }`}
              >
                {!flipped ? (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={surface === 'paper' ? 'text-[#57534E]' : 'text-[#A1A1AA]'}
                      >
                        {surfaceStyles[surface].label}
                      </span>
                      <span
                        className={surface === 'paper' ? 'text-[#57534E]' : 'text-[#A1A1AA]'}
                      >
                        Bộ {currentCard.radical} · {currentCard.strokes} nét
                      </span>
                    </div>

                    <div className="my-auto py-8 text-center">
                      <div
                        className={`font-han text-[116px] leading-none ${surfaceStyles[surface].glyph}`}
                      >
                        {currentCard.char}
                      </div>
                    </div>

                    <div
                      className={`flex items-center justify-center gap-1.5 text-xs ${
                        surface === 'paper' ? 'text-[#57534E]' : 'text-[#D4D4D8]'
                      }`}
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Nhấp vào thẻ để xem âm đọc và nghĩa</span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 my-auto">
                    <div className="flex items-baseline justify-between gap-4 border-b border-[#ECEAE4] pb-3">
                      <div className="flex items-baseline gap-3">
                        <span className="font-han text-4xl text-[#18181B]">
                          {currentCard.char}
                        </span>
                        <span className="text-2xl font-display font-semibold text-[#1E3A5F]">
                          {currentCard.hanViet}
                        </span>
                        {currentCard.nomVernacular && (
                          <span className="text-sm text-[#57534E]">
                            ({currentCard.nomVernacular})
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-[#57534E] tabular-nums">
                        {currentCard.strokes} nét
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-[#57534E]">Nghĩa</div>
                      <p className="text-base font-medium text-[#18181B] mt-0.5">
                        {currentCard.meaning}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-[#57534E]">
                        Mẹo chiết tự ({currentCard.decomposition})
                      </div>
                      <p className="text-sm text-[#3F3F46] mt-0.5 leading-relaxed">
                        {currentCard.mnemonic}
                      </p>
                    </div>

                    <div className="pt-1 flex flex-wrap gap-3 text-xs text-[#57534E]">
                      {currentCard.compounds.map((c) => (
                        <span key={c.han}>
                          <strong className="font-han text-sm text-[#18181B] mr-1">
                            {c.han}
                          </strong>
                          {c.reading} ({c.meaning})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation & Mastery Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFlipped(false);
                      setIndex((i) => (i - 1 + filteredDeck.length) % filteredDeck.length);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[#DDD9D0] bg-white text-xs font-medium text-[#18181B] hover:bg-[#ECEAE4] transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Thẻ trước</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFlipped(false);
                      setIndex((i) => (i + 1) % filteredDeck.length);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[#DDD9D0] bg-white text-xs font-medium text-[#18181B] hover:bg-[#ECEAE4] transition-colors cursor-pointer"
                  >
                    <span>Thẻ tiếp</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onToggleMastered(currentCard.id);
                      setFlipped(false);
                      setIndex((i) => (i + 1) % filteredDeck.length);
                    }}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      masteredIds.includes(currentCard.id)
                        ? 'bg-[#ECEAE4] text-[#18181B] border border-[#DDD9D0] hover:bg-[#E2DFD7]'
                        : 'bg-[#14532D] text-white hover:bg-[#166534]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {masteredIds.includes(currentCard.id)
                        ? 'Bỏ đánh dấu đã thuộc'
                        : 'Đã thuộc, sang chữ mới'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Companion Context Panel */}
            <div className="lg:col-span-5 bg-white border border-[#DDD9D0] rounded-xl p-5 space-y-4">
              <div className="text-xs font-medium text-[#57534E]">
                Xuất hiện trên văn bia địa phương
              </div>
              <div className="space-y-3">
                {currentCard.monumentIds.map((mid) => {
                  const mon = monuments.find((m) => m.id === mid);
                  if (!mon) return null;
                  return (
                    <div
                      key={mid}
                      className="p-3.5 rounded-lg border border-[#ECEAE4] bg-[#F8F7F4] space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-[#18181B]">{mon.title}</div>
                          <div className="text-xs text-[#57534E] mt-0.5">
                            {mon.typeLabel} · {mon.location}
                          </div>
                        </div>
                        <span className="font-han text-lg text-[#1E3A5F] shrink-0">
                          {mon.hanTitle.slice(0, 4)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenInLesson(currentCard.id, mon.id)}
                        className="text-xs font-medium text-[#1E3A5F] hover:underline cursor-pointer"
                      >
                        Xem vị trí chữ {currentCard.char} trên ảnh bia thật →
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-[#ECEAE4] text-xs text-[#57534E] leading-relaxed">
                Mẹo luyện đọc thực tế: Hãy chuyển qua lại giữa chế độ{' '}
                <strong className="text-[#18181B]">Khắc chìm đá xanh</strong> và{' '}
                <strong className="text-[#18181B]">Hoành phi thếp vàng</strong> để quen mắt khi đi
                thăm đình chùa ở quê.
              </div>
            </div>
          </div>
        )
      ) : (
        /* Recognition Quiz Mode */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-white border border-[#DDD9D0] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-[#57534E]">
              <span>Câu hỏi nhận mặt chữ từ hiện vật</span>
              <span className="font-mono">{quizMonument.accessionCode}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              {/* Real monument crop */}
              <div className="aspect-square rounded-xl border border-[#DDD9D0] bg-[#18181B] relative overflow-hidden">
                {quizHotspot ? (
                  <img
                    src={quizMonument.imageUrl}
                    alt="Chữ cần nhận diện trên văn bia"
                    referrerPolicy="no-referrer"
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: `${Math.min(2200, Math.max(350, (100 / quizHotspot.w) * 78))}%`,
                      height: 'auto',
                      maxWidth: 'none',
                      transform: `translate(-${quizHotspot.x + quizHotspot.w / 2}%, -${
                        quizHotspot.y + quizHotspot.h / 2
                      }%)`,
                    }}
                    className="select-none pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-han text-6xl text-[#E7E5E4]">
                    {quizTarget.char}
                  </div>
                )}
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#18181B]/80 text-[11px] text-white">
                  Ảnh chụp trên bia
                </span>
              </div>

              {/* Clean Khải thư reference */}
              <div className="aspect-square rounded-xl border border-[#DDD9D0] han-grid-bg flex flex-col items-center justify-center p-4">
                <span className="font-han text-[88px] leading-none text-[#18181B]">
                  {quizTarget.char}
                </span>
                <span className="text-[11px] text-[#57534E] mt-2">
                  Bộ {quizTarget.radical} · {quizTarget.strokes} nét
                </span>
              </div>
            </div>

            <p className="text-xs text-[#57534E]">
              Trích từ: <strong className="text-[#18181B]">{quizMonument.title}</strong>
            </p>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white border border-[#DDD9D0] rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#18181B]">
                <HelpCircle className="w-4 h-4 text-[#1E3A5F]" />
                <span>Chữ này đọc là gì và mang nghĩa nào?</span>
              </div>

              <div className="space-y-2.5">
                {quizOptions.map((opt) => {
                  const isChosen = selectedAnswerId === opt.id;
                  const isTarget = opt.id === quizTarget.id;
                  const showResult = selectedAnswerId !== null;

                  let buttonStyle =
                    'bg-[#F8F7F4] border-[#DDD9D0] text-[#18181B] hover:border-[#1E3A5F] hover:bg-white';
                  if (showResult) {
                    if (isTarget) {
                      buttonStyle = 'bg-[#ECFDF5] border-[#059669] text-[#065F46]';
                    } else if (isChosen && !isTarget) {
                      buttonStyle = 'bg-[#FEF2F2] border-[#DC2626] text-[#991B1B]';
                    } else {
                      buttonStyle = 'bg-[#F8F7F4] border-[#ECEAE4] text-[#71717A] opacity-75';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={showResult}
                      onClick={() => handleSelectQuizOption(opt.id)}
                      className={`w-full text-left p-3.5 rounded-lg border transition-colors flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default ${buttonStyle}`}
                    >
                      <div>
                        <span className="font-semibold text-sm">{opt.hanViet}</span>
                        <span className="text-xs ml-2 opacity-90">— {opt.meaning}</span>
                      </div>
                      {showResult && isTarget && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Đúng</span>
                        </span>
                      )}
                      {showResult && isChosen && !isTarget && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold shrink-0">
                          <XCircle className="w-4 h-4" />
                          <span>Chưa đúng</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedAnswerId !== null && (
                <div className="pt-3 border-t border-[#ECEAE4] space-y-3">
                  <p className="text-sm text-[#3F3F46] leading-relaxed">
                    <strong className="text-[#18181B]">Mẹo nhớ:</strong> {quizTarget.mnemonic}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenInLesson(quizTarget.id, quizMonument.id)}
                      className="text-xs font-medium text-[#1E3A5F] hover:underline cursor-pointer"
                    >
                      Mở bài học chi tiết →
                    </button>
                    <button
                      type="button"
                      onClick={handleNextQuiz}
                      className="px-4 py-2 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:bg-[#162C49] transition-colors cursor-pointer"
                    >
                      Câu tiếp theo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
