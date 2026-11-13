import React, { useState, useMemo } from 'react';
import { ArrowRight, CheckCircle2, Search, X } from 'lucide-react';
import {
  MONUMENT_TYPE_LABELS,
  type HanNomChar,
  type Monument,
  type MonumentType,
} from '../data/hanNomData';

interface QuickLookupProps {
  chars: HanNomChar[];
  monuments: Monument[];
  masteredIds: string[];
  onOpenInLesson: (charId: string, monumentId: string) => void;
}

function normalizeVietnamese(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export const QuickLookup: React.FC<QuickLookupProps> = ({
  chars,
  monuments,
  masteredIds,
  onOpenInLesson,
}) => {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<MonumentType | 'all'>('all');
  const [strokeFilter, setStrokeFilter] = useState<'all' | 'few' | 'mid' | 'many'>('all');
  const [selectedCharId, setSelectedCharId] = useState<string>(chars[0]?.id || '');

  const results = useMemo(() => {
    const q = normalizeVietnamese(query);
    return chars.filter((c) => {
      if (typeFilter !== 'all') {
        const matchesMonumentType = c.monumentIds.some((mid) => {
          const mon = monuments.find((m) => m.id === mid);
          return mon?.type === typeFilter;
        });
        if (!matchesMonumentType) return false;
      }

      if (strokeFilter === 'few' && c.strokes > 6) return false;
      if (strokeFilter === 'mid' && (c.strokes < 7 || c.strokes > 11)) return false;
      if (strokeFilter === 'many' && c.strokes < 12) return false;

      if (!q) return true;
      const haystack = [
        c.char,
        c.hanViet,
        c.nomVernacular || '',
        c.meaning,
        c.radical,
        c.radicalMeaning,
        c.steleUsage,
        ...c.compounds.map((cp) => `${cp.han} ${cp.reading} ${cp.meaning}`),
      ]
        .map(normalizeVietnamese)
        .join(' ');

      return haystack.includes(q) || c.char.includes(query.trim());
    });
  }, [chars, monuments, query, typeFilter, strokeFilter]);

  const activeChar = useMemo(
    () => results.find((c) => c.id === selectedCharId) || results[0] || null,
    [results, selectedCharId]
  );

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-[#DDD9D0] rounded-xl p-4 sm:p-5 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#57534E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập âm Hán Việt (vd: phuc, duc, dinh), chữ Hán (福), nghĩa tiếng Việt hoặc tên bộ thủ..."
            className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-[#DDD9D0] bg-[#F8F7F4] text-[#18181B] placeholder:text-[#71717A] focus:outline-none focus:bg-white focus:border-[#1E3A5F]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#57534E] hover:text-[#18181B] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#ECEAE4] rounded-lg">
            {(['all', 'hoanh_phi', 'cau_doi', 'bia_da', 'thac_ban'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  typeFilter === t
                    ? 'bg-white text-[#18181B] shadow-xs'
                    : 'text-[#57534E] hover:text-[#18181B]'
                }`}
              >
                {MONUMENT_TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#ECEAE4] rounded-lg">
            {(
              [
                ['all', 'Mọi số nét'],
                ['few', 'Ít nét (1–6)'],
                ['mid', 'Trung bình (7–11)'],
                ['many', 'Nhiều nét (12+)'],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setStrokeFilter(k)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  strokeFilter === k
                    ? 'bg-white text-[#18181B] shadow-xs'
                    : 'text-[#57534E] hover:text-[#18181B]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results + Accession Detail Split */}
      {results.length === 0 ? (
        <div className="bg-white border border-[#DDD9D0] rounded-xl p-12 text-center space-y-2">
          <p className="text-base font-medium text-[#18181B]">
            Không tìm thấy chữ phù hợp với từ khóa "{query}".
          </p>
          <p className="text-xs text-[#57534E]">
            Thử tìm theo âm Hán-Việt không dấu như "phuc", "dinh", "thon", "hoang" hoặc đặt lại bộ lọc.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Lookup Results Table/List */}
          <div className="lg:col-span-7 bg-white border border-[#DDD9D0] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#DDD9D0] bg-[#FCFBF9] flex items-center justify-between text-xs text-[#57534E]">
              <span>Kết quả tra cứu</span>
              <span className="font-mono tabular-nums">{results.length} chữ</span>
            </div>
            <div className="divide-y divide-[#ECEAE4] max-h-[540px] overflow-y-auto">
              {results.map((item) => {
                const isSelected = activeChar?.id === item.id;
                const isMastered = masteredIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedCharId(item.id)}
                    className={`w-full text-left px-4 py-3.5 flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#1E3A5F]/8' : 'hover:bg-[#F8F7F4]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="font-han text-3xl text-[#18181B] w-10 text-center shrink-0">
                        {item.char}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#18181B]">
                            {item.hanViet}
                          </span>
                          {isMastered && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#14532D]">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Đã thuộc</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#57534E] truncate mt-0.5">{item.meaning}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 text-xs text-[#57534E] font-mono tabular-nums">
                      <div>Bộ {item.radical}</div>
                      <div>{item.strokes} nét</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Character Quick Card */}
          {activeChar && (
            <div className="lg:col-span-5 bg-white border border-[#DDD9D0] rounded-xl p-6 space-y-5">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#ECEAE4]">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl border border-[#DDD9D0] han-grid-bg flex items-center justify-center shrink-0">
                    <span className="font-han text-5xl text-[#18181B]">{activeChar.char}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-semibold text-[#18181B]">
                      {activeChar.hanViet}
                    </h3>
                    {activeChar.nomVernacular && (
                      <p className="text-xs text-[#57534E] mt-0.5">{activeChar.nomVernacular}</p>
                    )}
                    <p className="text-xs text-[#57534E] mt-1 font-mono tabular-nums">
                      Bộ {activeChar.radical} · {activeChar.strokes} nét
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs font-medium text-[#57534E]">Nghĩa</div>
                  <p className="text-[#18181B] mt-0.5">{activeChar.meaning}</p>
                </div>
                <div>
                  <div className="text-xs font-medium text-[#57534E]">Nhận diện trên văn bia</div>
                  <p className="text-[#3F3F46] mt-0.5 leading-relaxed">{activeChar.steleUsage}</p>
                </div>
                <div>
                  <div className="text-xs font-medium text-[#57534E]">Mẹo nhớ cấu tạo</div>
                  <p className="text-[#3F3F46] mt-0.5 leading-relaxed">{activeChar.mnemonic}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#ECEAE4] space-y-2">
                <div className="text-xs font-medium text-[#57534E]">
                  Di tích có khắc chữ này
                </div>
                <div className="space-y-2">
                  {activeChar.monumentIds.map((mid) => {
                    const mon = monuments.find((m) => m.id === mid);
                    if (!mon) return null;
                    return (
                      <button
                        key={mid}
                        type="button"
                        onClick={() => onOpenInLesson(activeChar.id, mon.id)}
                        className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border border-[#DDD9D0] bg-[#F8F7F4] hover:border-[#1E3A5F] text-left transition-colors cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[#18181B] truncate">
                            {mon.title}
                          </div>
                          <div className="text-[11px] text-[#57534E] truncate">
                            {mon.typeLabel}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#1E3A5F] shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
