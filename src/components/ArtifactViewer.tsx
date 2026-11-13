import React, { useState } from 'react';
import { Eye, EyeOff, Layers, ZoomIn, ZoomOut } from 'lucide-react';
import type { Monument, HanNomChar } from '../data/hanNomData';

interface ArtifactViewerProps {
  monument: Monument;
  activeChar: HanNomChar;
  onSelectCharId: (charId: string) => void;
  allChars: HanNomChar[];
}

export const ArtifactViewer: React.FC<ArtifactViewerProps> = ({
  monument,
  activeChar,
  onSelectCharId,
  allChars,
}) => {
  const [viewMode, setViewMode] = useState<'original' | 'rubbing'>('original');
  const [showHotspots, setShowHotspots] = useState(true);
  const [zoomed, setZoomed] = useState(false);
  const [imgError, setImgError] = useState(false);

  const activeHotspot = monument.hotspots.find((h) => h.charId === activeChar.id);

  // Calculate transform origin toward active hotspot when zoomed
  const originX = activeHotspot ? activeHotspot.x + activeHotspot.w / 2 : 50;
  const originY = activeHotspot ? activeHotspot.y + activeHotspot.h / 2 : 50;

  return (
    <div className="space-y-4">
      {/* Artifact Stage Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#DDD9D0]">
        <div className="flex items-center gap-2 text-xs text-[#57534E]">
          <span className="font-mono font-medium text-[#18181B]">{monument.accessionCode}</span>
          <span aria-hidden="true">·</span>
          <span>{monument.typeLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{monument.era}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center bg-[#ECEAE4] p-0.5 rounded-lg border border-[#DDD9D0]">
            <button
              type="button"
              onClick={() => setViewMode('original')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'original'
                  ? 'bg-white text-[#18181B] shadow-xs'
                  : 'text-[#57534E] hover:text-[#18181B]'
              }`}
            >
              Ảnh thực địa
            </button>
            <button
              type="button"
              onClick={() => setViewMode('rubbing')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'rubbing'
                  ? 'bg-[#18181B] text-white shadow-xs'
                  : 'text-[#57534E] hover:text-[#18181B]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Thác bản tương phản</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowHotspots((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#DDD9D0] bg-white text-[#18181B] hover:bg-[#ECEAE4] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {showHotspots ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showHotspots ? 'Ẩn ô chữ' : 'Hiện ô chữ'}</span>
          </button>

          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#DDD9D0] bg-white text-[#18181B] hover:bg-[#ECEAE4] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {zoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
            <span>{zoomed ? 'Thu gọn' : 'Soi cận chữ'}</span>
          </button>
        </div>
      </div>

      {/* Main Monument Image Container */}
      <div className="relative w-full overflow-hidden rounded-xl border border-[#DDD9D0] bg-[#18181B]">
        {!imgError ? (
          <div
            className="relative w-full overflow-hidden transition-transform duration-300 ease-out"
            style={{
              transform: zoomed ? 'scale(1.85)' : 'scale(1)',
              transformOrigin: `${originX}% ${originY}%`,
            }}
          >
            <img
              src={monument.imageUrl}
              alt={`${monument.title} - ${monument.location}`}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className={`w-full h-auto max-h-[540px] object-contain mx-auto block select-none transition-[filter] duration-200 ${
                viewMode === 'rubbing' ? 'rubbing-filter' : ''
              }`}
            />

            {/* Interactive Hotspots mapped to real characters on the monument */}
            {showHotspots &&
              monument.hotspots.map((spot) => {
                const isActive = spot.charId === activeChar.id;
                return (
                  <button
                    key={`${monument.id}-${spot.charId}`}
                    type="button"
                    onClick={() => onSelectCharId(spot.charId)}
                    title={`Chữ ${spot.char} (${spot.reading})`}
                    aria-label={`Chọn chữ ${spot.char} - ${spot.reading}`}
                    style={{
                      left: `${spot.x}%`,
                      top: `${spot.y}%`,
                      width: `${spot.w}%`,
                      height: `${spot.h}%`,
                    }}
                    className={`absolute rounded transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      isActive
                        ? 'border-2 border-[#D97706] bg-[#D97706]/20 shadow-[0_0_0_2px_rgba(24,24,27,0.65)]'
                        : 'border border-white/55 bg-white/5 hover:border-[#FBBF24] hover:bg-[#FBBF24]/15'
                    }`}
                  >
                    <span
                      className={`absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[11px] font-medium whitespace-nowrap pointer-events-none transition-opacity ${
                        isActive
                          ? 'bg-[#18181B] text-[#FDE68A] opacity-100 border border-[#D97706]/70'
                          : 'bg-[#18181B]/85 text-white opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {spot.char} · {spot.reading}
                    </span>
                  </button>
                );
              })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-[#27272A] text-[#F8F7F4]">
            <div className="font-han text-5xl tracking-widest mb-3 text-[#E5E0D5]">
              {monument.hanTitle}
            </div>
            <p className="text-sm font-medium">{monument.title}</p>
            <p className="text-xs text-[#A1A1AA] mt-1">{monument.material}</p>
          </div>
        )}
      </div>

      {/* Monument Figure Caption & Direct Character Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <p className="text-xs text-[#57534E] italic">
          Chiều đọc: {monument.readingDirection}. Nhấp vào khung chữ trên ảnh hoặc chọn từng chữ bên dưới để xem chiết tự.
        </p>
      </div>

      {/* Interactive Character Sequence Strip on Monument */}
      <div className="bg-[#ECEAE4]/70 border border-[#DDD9D0] rounded-xl p-3">
        <div className="text-xs font-medium text-[#57534E] mb-2">
          Các chữ trọng tâm trên hiện vật ({monument.featuredCharIds.length} chữ)
        </div>
        <div className="flex flex-wrap gap-2">
          {monument.featuredCharIds.map((cid) => {
            const item = allChars.find((c) => c.id === cid);
            if (!item) return null;
            const isSelected = item.id === activeChar.id;
            return (
              <button
                key={cid}
                type="button"
                onClick={() => onSelectCharId(cid)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                    : 'bg-white text-[#18181B] border-[#DDD9D0] hover:border-[#1E3A5F]/50'
                }`}
              >
                <span className="font-han text-lg leading-none">{item.char}</span>
                <span className="text-xs font-medium">{item.hanViet}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
