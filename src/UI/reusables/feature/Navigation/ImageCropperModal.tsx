import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Crop } from 'lucide-react';
import { Button } from '../../base/Button/Button';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  aspectRatio: number; // e.g., 1 for avatar (square/circle), 16/6 or 3 for cover
  isCircular?: boolean;
  title: string;
  onCropSave: (croppedDataUrl: string) => void;
  onClose: () => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  aspectRatio = 1,
  isCircular = false,
  title,
  onCropSave,
  onClose
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleApplyCrop = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx || !imgRef.current) return;

    const img = imgRef.current;
    const outputWidth = isCircular ? 400 : 800;
    const outputHeight = isCircular ? 400 : Math.round(outputWidth / aspectRatio);

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    ctx.save();
    ctx.translate(outputWidth / 2, outputHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Apply pan scaled
    ctx.translate(pan.x * (outputWidth / 300), pan.y * (outputHeight / 200));

    // Draw image centered
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawW = outputWidth;
    let drawH = outputWidth / imgAspect;

    if (drawH < outputHeight) {
      drawH = outputHeight;
      drawW = outputHeight * imgAspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    if (isCircular) {
      // Circular mask
      const circleCanvas = document.createElement('canvas');
      circleCanvas.width = outputWidth;
      circleCanvas.height = outputHeight;
      const cCtx = circleCanvas.getContext('2d');
      if (cCtx) {
        cCtx.beginPath();
        cCtx.arc(outputWidth / 2, outputHeight / 2, outputWidth / 2, 0, Math.PI * 2);
        cCtx.clip();
        cCtx.drawImage(canvas, 0, 0);
        onCropSave(circleCanvas.toDataURL('image/png'));
        onClose();
        return;
      }
    }

    onCropSave(canvas.toDataURL('image/jpeg', 0.9));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crop size={18} className="text-[#EA580C]" />
            <h3 className="font-heading font-bold text-sm text-neutral-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Crop Viewport */}
        <div
          className="relative bg-neutral-950 h-72 sm:h-80 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Hidden reference image for sizing */}
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Source for crop"
            className="hidden"
            onLoad={() => {
              // Trigger render
            }}
          />

          {/* Transforming Image */}
          <div
            className="transition-transform duration-75 origin-center pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`
            }}
          >
            <img
              src={imageSrc}
              alt="Crop target"
              className="max-h-64 object-contain pointer-events-none"
              draggable={false}
            />
          </div>

          {/* Crop Overlay Grid */}
          <div
            className={`absolute pointer-events-none border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] ${
              isCircular ? 'rounded-full w-48 h-48' : 'w-72 h-36 rounded-xl'
            }`}
          />
        </div>

        {/* Controls Toolbar */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200/80 space-y-3">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <ZoomOut size={16} className="text-neutral-400 shrink-0" />
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-[#EA580C] cursor-pointer"
            />
            <ZoomIn size={16} className="text-neutral-400 shrink-0" />

            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 ml-2 cursor-pointer"
              title="Rotate 90 degrees"
            >
              <RotateCw size={15} />
            </button>
          </div>

          <p className="text-[11px] text-neutral-500 text-center">
            Click and drag image to reposition. Use slider to zoom.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200/60">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApplyCrop}
              leftIcon={<Check size={14} />}
              className="bg-[#EA580C] hover:bg-[#C2410C]"
            >
              Apply & Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
