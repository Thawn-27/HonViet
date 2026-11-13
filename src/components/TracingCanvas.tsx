import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Eye, EyeOff, RotateCcw } from 'lucide-react';

interface TracingCanvasProps {
  character: string;
  reading: string;
}

interface Point {
  x: number;
  y: number;
}

export const TracingCanvas: React.FC<TracingCanvasProps> = ({ character, reading }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const currentStrokeRef = useRef<Point[]>([]);

  const redrawCanvas = useCallback(
    (strokeList: Point[][]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw subtle diagonal Mễ Tự Cách guide lines
      ctx.strokeStyle = 'rgba(30, 58, 95, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(rect.width, rect.height);
      ctx.moveTo(rect.width, 0);
      ctx.lineTo(0, rect.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw user ink strokes
      ctx.strokeStyle = '#18181B';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const stroke of strokeList) {
        if (stroke.length === 0) continue;
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
          const midX = (stroke[i - 1].x + stroke[i].x) / 2;
          const midY = (stroke[i - 1].y + stroke[i].y) / 2;
          ctx.quadraticCurveTo(stroke[i - 1].x, stroke[i - 1].y, midX, midY);
        }
        if (stroke.length === 1) {
          ctx.lineTo(stroke[0].x + 0.1, stroke[0].y + 0.1);
        }
        ctx.stroke();
      }
      ctx.restore();
    },
    []
  );

  // Clear strokes when character changes
  useEffect(() => {
    setStrokes([]);
    currentStrokeRef.current = [];
  }, [character]);

  useEffect(() => {
    redrawCanvas(strokes);
  }, [strokes, redrawCanvas]);

  const getCoords = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getCoords(e);
    currentStrokeRef.current = [pt];
    setIsDrawing(true);
    redrawCanvas([...strokes, currentStrokeRef.current]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pt = getCoords(e);
    currentStrokeRef.current = [...currentStrokeRef.current, pt];
    redrawCanvas([...strokes, currentStrokeRef.current]);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStrokeRef.current.length > 0) {
      setStrokes((prev) => [...prev, currentStrokeRef.current]);
      currentStrokeRef.current = [];
    }
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setStrokes([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#57534E]">
          Bảng tập viết chữ {character} ({reading})
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowGuide((v) => !v)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-[#DDD9D0] bg-white text-[#18181B] hover:bg-[#ECEAE4] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {showGuide ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showGuide ? 'Ẩn chữ mẫu' : 'Hiện chữ mẫu'}</span>
          </button>
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-[#DDD9D0] bg-white text-[#18181B] hover:bg-[#ECEAE4] disabled:opacity-40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Hoàn tác</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={strokes.length === 0}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-[#DDD9D0] bg-white text-[#18181B] hover:bg-[#ECEAE4] disabled:opacity-40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Xóa bảng</span>
          </button>
        </div>
      </div>

      <div className="relative w-full max-w-[260px] aspect-square mx-auto rounded-xl border border-[#DDD9D0] han-grid-bg overflow-hidden select-none touch-none">
        {showGuide && (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center pointer-events-none font-han text-[140px] leading-none text-[#1E3A5F]/15"
          >
            {character}
          </div>
        )}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative z-10 w-full h-full cursor-crosshair"
        />
      </div>
      <p className="text-center text-xs text-[#57534E]">
        Dùng chuột hoặc ngón tay tô theo nét chữ trên ô mễ tự cách · Đã viết{' '}
        <span className="font-mono tabular-nums font-medium text-[#18181B]">{strokes.length}</span> nét
      </p>
    </div>
  );
};
