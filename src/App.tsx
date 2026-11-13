import React, { useState, useEffect, useMemo } from 'react';
import { ArrowDownRight, BookOpenCheck, Compass, Search } from 'lucide-react';
import { HAN_NOM_CHARS, MONUMENTS } from './data/hanNomData';
import { ArtifactViewer } from './components/ArtifactViewer';
import { CharacterLessonPanel } from './components/CharacterLessonPanel';
import { PracticeDeck } from './components/PracticeDeck';
import { QuickLookup } from './components/QuickLookup';
import heroSteleImg from './assets/images/stele_village_pavilion_1794553336371.jpg';

const STORAGE_KEY = 'vanbia_mastered_chars_v1';

export default function App() {
  const [selectedMonumentId, setSelectedMonumentId] = useState<string>(MONUMENTS[0].id);
  const [selectedCharId, setSelectedCharId] = useState<string>(MONUMENTS[0].featuredCharIds[0]);
  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(masteredIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [masteredIds]);

  const activeMonument = useMemo(
    () => MONUMENTS.find((m) => m.id === selectedMonumentId) || MONUMENTS[0],
    [selectedMonumentId]
  );

  const activeChar = useMemo(() => {
    const found = HAN_NOM_CHARS.find((c) => c.id === selectedCharId);
    if (found && activeMonument.featuredCharIds.includes(found.id)) {
      return found;
    }
    return (
      HAN_NOM_CHARS.find((c) => c.id === activeMonument.featuredCharIds[0]) ||
      HAN_NOM_CHARS[0]
    );
  }, [selectedCharId, activeMonument]);

  const handleSelectMonument = (monumentId: string) => {
    setSelectedMonumentId(monumentId);
    const mon = MONUMENTS.find((m) => m.id === monumentId);
    if (mon && mon.featuredCharIds.length > 0) {
      setSelectedCharId(mon.featuredCharIds[0]);
    }
  };

  const handleToggleMastered = (charId: string) => {
    setMasteredIds((prev) =>
      prev.includes(charId) ? prev.filter((id) => id !== charId) : [...prev, charId]
    );
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenInLesson = (charId: string, monumentId: string) => {
    setSelectedMonumentId(monumentId);
    setSelectedCharId(charId);
    scrollToSection('lessons');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#18181B]">
      {/* Strict 3-zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#F8F7F4]/95 backdrop-blur-sm border-b border-[#DDD9D0]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="font-display text-lg sm:text-xl font-semibold tracking-tight text-[#18181B] whitespace-nowrap shrink-0"
          >
            Văn Bia Quê Nhà
          </a>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav
            aria-label="Điều hướng chính"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#57534E]"
          >
            <a
              href="#monuments"
              className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Văn bia mẫu
            </a>
            <a
              href="#lessons"
              className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Bài học chữ
            </a>
            <a
              href="#practice"
              className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Thẻ luyện tập
            </a>
            <a
              href="#lookup"
              className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Tra cứu nhanh
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => scrollToSection('lessons')}
              className="px-4 py-2 text-xs font-medium text-white bg-[#1E3A5F] rounded-lg hover:bg-[#162C49] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Bắt đầu học
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Hero Section: Balanced 2-Column Editorial Split + 4-Column Index Strip */}
        <section className="border-b border-[#DDD9D0]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-[#57534E]">
                    <span>Tư liệu văn khắc địa phương</span>
                    <span aria-hidden="true">·</span>
                    <span>Đình chùa, cầu đá và từ đường</span>
                  </div>

                  <h1 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-semibold leading-[1.15] tracking-tight text-[#18181B] text-balance">
                    Nhận mặt chữ Hán Nôm qua chính văn bia và hoành phi ở quê
                  </h1>

                  <p className="text-base text-[#3F3F46] leading-relaxed max-w-xl">
                    Thay vì học rời rạc từng mặt chữ trên giấy trắng, hãy bắt đầu từ những tấm
                    bia đá dựng đầu cầu, bức hoành phi sơn son thếp vàng nơi từ đường và bản dập
                    thác bản mực tàu để đọc hiểu di sản ngay tại làng mình.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => scrollToSection('lessons')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:bg-[#162C49] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <BookOpenCheck className="w-4 h-4" />
                    <span>Vào bài học soi bia</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('lookup')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#DDD9D0] bg-white text-[#18181B] text-sm font-medium hover:bg-[#ECEAE4] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Tra cứu mặt chữ</span>
                  </button>
                </div>
              </div>

              {/* Focal Monument Photograph */}
              <div className="lg:col-span-6">
                <div className="relative h-full min-h-[280px] rounded-xl overflow-hidden border border-[#DDD9D0] bg-[#18181B]">
                  <img
                    src={heroSteleImg}
                    alt="Bia đá cổ dựng trên lưng rùa trong đình làng Việt Nam"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-5 text-white">
                    <div className="text-xs text-white/80">
                      Hiện vật tiêu biểu · Đình làng đồng bằng Bắc Bộ
                    </div>
                    <div className="text-sm font-medium mt-0.5">
                      Bia đá đội quy khắc chữ Khải thư — Ghi sự tích thành hoàng và hương ước
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4-column Overview Strip below Hero Split */}
            <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 border border-[#DDD9D0] rounded-xl bg-white divide-y lg:divide-y-0 lg:divide-x divide-[#DDD9D0]">
              <div className="p-4 sm:p-5">
                <div className="text-xs text-[#57534E]">Chữ trọng tâm</div>
                <div className="mt-1 text-2xl font-display font-semibold text-[#18181B] tabular-nums">
                  {HAN_NOM_CHARS.length} chữ
                </div>
                <div className="mt-0.5 text-xs text-[#57534E]">Tần suất cao trên bia quê</div>
              </div>
              <div className="p-4 sm:p-5">
                <div className="text-xs text-[#57534E]">Hiện vật thực địa</div>
                <div className="mt-1 text-2xl font-display font-semibold text-[#18181B] tabular-nums">
                  {MONUMENTS.length} di tích
                </div>
                <div className="mt-0.5 text-xs text-[#57534E]">Hoành phi, câu đối, bia đá</div>
              </div>
              <div className="p-4 sm:p-5">
                <div className="text-xs text-[#57534E]">Tiến độ đã thuộc</div>
                <div className="mt-1 text-2xl font-display font-semibold text-[#1E3A5F] tabular-nums">
                  {masteredIds.length} / {HAN_NOM_CHARS.length}
                </div>
                <div className="mt-0.5 text-xs text-[#57534E]">Lưu tự động trên trình duyệt</div>
              </div>
              <div className="p-4 sm:p-5">
                <div className="text-xs text-[#57534E]">Tra cứu & luyện tập</div>
                <div className="mt-1 text-2xl font-display font-semibold text-[#18181B]">
                  Đa chế độ
                </div>
                <div className="mt-0.5 text-xs text-[#57534E]">Thác bản, thẻ nhớ, tập viết</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 01: Monument Selection + Interactive Character Lesson Stage */}
        <section id="lessons" className="py-12 lg:py-16 border-b border-[#DDD9D0]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div id="monuments" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-medium text-[#57534E]">
                    01. Bài học theo chữ trên văn bia thật
                  </div>
                  <h2 className="mt-1 text-2xl sm:text-3xl font-display font-semibold text-[#18181B] text-balance">
                    Chọn di tích để soi chữ và học chiết tự
                  </h2>
                </div>
                <p className="text-xs text-[#57534E] max-w-sm">
                  Mỗi hiện vật gắn liền với bộ chữ đặc trưng. Bấm trực tiếp vào từng ô chữ trên ảnh
                  để đối chiếu nét khắc thật với chữ mẫu.
                </p>
              </div>

              {/* Monument Switcher Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {MONUMENTS.map((mon) => {
                  const isActive = mon.id === activeMonument.id;
                  return (
                    <button
                      key={mon.id}
                      type="button"
                      onClick={() => handleSelectMonument(mon.id)}
                      className={`text-left p-3.5 rounded-xl border transition-colors flex flex-col justify-between gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                          : 'bg-white text-[#18181B] border-[#DDD9D0] hover:border-[#1E3A5F]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[11px] font-mono ${
                            isActive ? 'text-white/80' : 'text-[#57534E]'
                          }`}
                        >
                          {mon.accessionCode}
                        </span>
                        <span
                          className={`font-han text-base ${
                            isActive ? 'text-[#FDE68A]' : 'text-[#1E3A5F]'
                          }`}
                        >
                          {mon.hanTitle.slice(0, 4)}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold line-clamp-2 leading-snug">
                          {mon.title}
                        </div>
                        <div
                          className={`text-[11px] mt-1 ${
                            isActive ? 'text-white/80' : 'text-[#57534E]'
                          }`}
                        >
                          {mon.featuredCharIds.length} chữ trọng tâm
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Monument Summary Header */}
            <div className="bg-white border border-[#DDD9D0] rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#57534E]">
                  <span>{activeMonument.location}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeMonument.material}</span>
                </div>
                <h3 className="text-xl font-display font-semibold text-[#18181B]">
                  {activeMonument.title}
                </h3>
                <p className="text-sm text-[#3F3F46]">
                  <strong className="text-[#18181B]">Dịch nghĩa:</strong> {activeMonument.dichNghia}
                </p>
              </div>
              <div className="lg:text-right shrink-0 space-y-1">
                <div className="font-han text-2xl tracking-wider text-[#1E3A5F]">
                  {activeMonument.hanTitle}
                </div>
                <div className="text-xs text-[#57534E] italic">{activeMonument.phienAm}</div>
              </div>
            </div>

            {/* Two-Zone Educational Stage: Left = Real Artifact Photo, Right = Character Lesson */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-4">
                <ArtifactViewer
                  monument={activeMonument}
                  activeChar={activeChar}
                  onSelectCharId={(cid) => setSelectedCharId(cid)}
                  allChars={HAN_NOM_CHARS}
                />

                <div className="rounded-xl border border-[#DDD9D0] bg-white p-4 text-sm text-[#3F3F46] leading-relaxed">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#18181B] mb-1">
                    <Compass className="w-3.5 h-3.5 text-[#1E3A5F]" />
                    <span>Ghi chú điền dã tại di tích</span>
                  </div>
                  {activeMonument.curatorialNote}
                </div>
              </div>

              <div className="lg:col-span-5">
                <CharacterLessonPanel
                  charData={activeChar}
                  monument={activeMonument}
                  isMastered={masteredIds.includes(activeChar.id)}
                  onToggleMastered={handleToggleMastered}
                  onJumpToPractice={() => scrollToSection('practice')}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 02: Practice Flashcards & Monument Quiz */}
        <section id="practice" className="py-12 lg:py-16 border-b border-[#DDD9D0] bg-[#F2F0EA]/60">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="text-xs font-medium text-[#57534E]">
                  02. Thẻ luyện tập & Trắc nghiệm nhận mặt chữ
                </div>
                <h2 className="mt-1 text-2xl sm:text-3xl font-display font-semibold text-[#18181B] text-balance">
                  Ôn tập mặt chữ trên nền đá xanh, gỗ thếp vàng và giấy dó
                </h2>
              </div>
              <a
                href="#lookup"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#1E3A5F] hover:underline whitespace-nowrap shrink-0"
              >
                <span>Mở bảng tra cứu nhanh</span>
                <ArrowDownRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <PracticeDeck
              chars={HAN_NOM_CHARS}
              monuments={MONUMENTS}
              masteredIds={masteredIds}
              onToggleMastered={handleToggleMastered}
              onOpenInLesson={handleOpenInLesson}
            />
          </div>
        </section>

        {/* Section 03: Quick Lookup */}
        <section id="lookup" className="py-12 lg:py-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div>
              <div className="text-xs font-medium text-[#57534E]">03. Tra cứu nhanh</div>
              <h2 className="mt-1 text-2xl sm:text-3xl font-display font-semibold text-[#18181B] text-balance">
                Tìm nhanh theo âm Hán Việt, mặt chữ, bộ thủ hoặc loại di tích
              </h2>
            </div>

            <QuickLookup
              chars={HAN_NOM_CHARS}
              monuments={MONUMENTS}
              masteredIds={masteredIds}
              onOpenInLesson={handleOpenInLesson}
            />
          </div>
        </section>
      </main>

      {/* Quiet Institutional Footer */}
      <footer className="border-t border-[#DDD9D0] bg-[#ECEAE4]/60 py-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#57534E]">
          <div>
            <span className="font-display font-semibold text-[#18181B]">Văn Bia Quê Nhà</span>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            <span>Tư liệu học chữ Hán Nôm thông dụng qua văn khắc địa phương</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#lessons" className="hover:text-[#18181B]">
              Bài học chữ
            </a>
            <a href="#practice" className="hover:text-[#18181B]">
              Thẻ luyện tập
            </a>
            <a href="#lookup" className="hover:text-[#18181B]">
              Tra cứu nhanh
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
