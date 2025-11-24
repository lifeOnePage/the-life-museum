"use client";
import { useState, useRef, useEffect } from "react";

export default function ImageCropOverlay({
  imageFile,
  onCropComplete,
  onCancel,
  aspectRatio = null, // null이면 자유 비율, 숫자면 고정 비율
  minWidth = 100,
  minHeight = 100,
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!imageFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target.result);
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    if (!imageSrc || !imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;

    const updateLayout = () => {
      const containerRect = container.getBoundingClientRect();
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const containerAspect = containerRect.width / containerRect.height;

      let displayWidth, displayHeight, offsetX, offsetY;

      if (imgAspect > containerAspect) {
        displayWidth = containerRect.width;
        displayHeight = containerRect.width / imgAspect;
        offsetX = 0;
        offsetY = (containerRect.height - displayHeight) / 2;
      } else {
        displayHeight = containerRect.height;
        displayWidth = containerRect.height * imgAspect;
        offsetX = (containerRect.width - displayWidth) / 2;
        offsetY = 0;
      }

      setImageSize({ width: displayWidth, height: displayHeight });
      setImagePosition({ x: offsetX, y: offsetY });

      // 초기 크롭 영역 설정
      const initialSize = Math.min(displayWidth * 0.8, displayHeight * 0.8);
      const initialWidth = aspectRatio ? initialSize : initialSize;
      const initialHeight = aspectRatio
        ? initialSize / aspectRatio
        : initialSize;

      setCropArea({
        x: offsetX + (displayWidth - initialWidth) / 2,
        y: offsetY + (displayHeight - initialHeight) / 2,
        width: initialWidth,
        height: initialHeight,
      });
    };

    img.onload = updateLayout;
    window.addEventListener("resize", updateLayout);
    updateLayout();

    return () => window.removeEventListener("resize", updateLayout);
  }, [imageSrc, aspectRatio]);

  const getMousePos = (e) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const constrainCropArea = (area) => {
    const { x: imgX, y: imgY } = imagePosition;
    const { width: imgW, height: imgH } = imageSize;

    let { x, y, width, height } = area;

    // 비율 유지
    if (aspectRatio) {
      if (width / height > aspectRatio) {
        height = width / aspectRatio;
      } else {
        width = height * aspectRatio;
      }
    }

    // 최소 크기 제한
    width = Math.max(width, minWidth);
    height = Math.max(height, minHeight);

    // 이미지 영역 내로 제한
    x = Math.max(imgX, Math.min(x, imgX + imgW - width));
    y = Math.max(imgY, Math.min(y, imgY + imgH - height));

    // 경계 체크
    if (x + width > imgX + imgW) {
      x = imgX + imgW - width;
    }
    if (y + height > imgY + imgH) {
      y = imgY + imgH - height;
    }

    return { x, y, width, height };
  };

  const handleMouseDown = (e) => {
    if (e.target.classList.contains("crop-handle")) return;
    const pos = getMousePos(e);
    setIsDragging(true);
    setDragStart(pos);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const pos = getMousePos(e);
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;

      const newArea = constrainCropArea({
        x: cropArea.x + dx,
        y: cropArea.y + dy,
        width: cropArea.width,
        height: cropArea.height,
      });

      setCropArea(newArea);
      setDragStart(pos);
    } else if (isResizing && resizeCorner) {
      const pos = getMousePos(e);
      const startPos = dragStart;
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;

      let newArea = { ...cropArea };
      const startCrop = { ...cropArea };

      if (aspectRatio) {
        // 비율 고정 모드
        let newWidth, newHeight;
        const centerX = startCrop.x + startCrop.width / 2;
        const centerY = startCrop.y + startCrop.height / 2;

        if (resizeCorner.includes("e") && resizeCorner.includes("s")) {
          newWidth = startCrop.width + dx;
          newHeight = newWidth / aspectRatio;
        } else if (resizeCorner.includes("e") && resizeCorner.includes("n")) {
          newWidth = startCrop.width + dx;
          newHeight = newWidth / aspectRatio;
        } else if (resizeCorner.includes("w") && resizeCorner.includes("s")) {
          newWidth = startCrop.width - dx;
          newHeight = newWidth / aspectRatio;
        } else if (resizeCorner.includes("w") && resizeCorner.includes("n")) {
          newWidth = startCrop.width - dx;
          newHeight = newWidth / aspectRatio;
        } else if (resizeCorner.includes("e")) {
          newWidth = startCrop.width + dx;
          newHeight = newWidth / aspectRatio;
        } else if (resizeCorner.includes("w")) {
          newWidth = startCrop.width - dx;
          newHeight = newWidth / aspectRatio;
        } else if (resizeCorner.includes("s")) {
          newHeight = startCrop.height + dy;
          newWidth = newHeight * aspectRatio;
        } else if (resizeCorner.includes("n")) {
          newHeight = startCrop.height - dy;
          newWidth = newHeight * aspectRatio;
        }

        newArea.width = Math.max(minWidth, newWidth);
        newArea.height = Math.max(minHeight, newArea.width / aspectRatio);
        newArea.x = centerX - newArea.width / 2;
        newArea.y = centerY - newArea.height / 2;
      } else {
        // 자유 비율 모드
        if (resizeCorner.includes("e")) {
          newArea.width += dx;
        }
        if (resizeCorner.includes("w")) {
          newArea.width -= dx;
          newArea.x += dx;
        }
        if (resizeCorner.includes("s")) {
          newArea.height += dy;
        }
        if (resizeCorner.includes("n")) {
          newArea.height -= dy;
          newArea.y += dy;
        }
      }

      newArea = constrainCropArea(newArea);
      setCropArea(newArea);
      setDragStart(pos);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeCorner(null);
  };

  const handleResizeStart = (corner, e) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeCorner(corner);
    setDragStart(getMousePos(e));
  };

  const handleCrop = async () => {
    if (!imageRef.current || !canvasRef.current) return;

    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // 실제 이미지 크기에 대한 크롭 영역 계산
    const scaleX = img.naturalWidth / imageSize.width;
    const scaleY = img.naturalHeight / imageSize.height;

    const cropX = (cropArea.x - imagePosition.x) * scaleX;
    const cropY = (cropArea.y - imagePosition.y) * scaleY;
    const cropWidth = cropArea.width * scaleX;
    const cropHeight = cropArea.height * scaleY;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight,
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], imageFile.name, {
            type: imageFile.type,
          });
          onCropComplete(croppedFile);
        }
      },
      imageFile.type,
      0.95,
    );
  };

  if (!imageSrc) return null;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      style={{ minHeight: "400px", position: "relative" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img
        ref={imageRef}
        src={imageSrc}
        alt="크롭할 이미지"
        className="absolute inset-0 h-full w-full object-contain"
        draggable={false}
        style={{ pointerEvents: "none" }}
      />

      {/* 크롭 영역 오버레이 */}
      <div
        className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
        style={{
          left: `${cropArea.x}px`,
          top: `${cropArea.y}px`,
          width: `${cropArea.width}px`,
          height: `${cropArea.height}px`,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
      >
        {/* 크롭 영역 핸들 */}
        {[
          {
            corner: "nw",
            style: { top: "-6px", left: "-6px", cursor: "nw-resize" },
          },
          {
            corner: "ne",
            style: { top: "-6px", right: "-6px", cursor: "ne-resize" },
          },
          {
            corner: "sw",
            style: { bottom: "-6px", left: "-6px", cursor: "sw-resize" },
          },
          {
            corner: "se",
            style: { bottom: "-6px", right: "-6px", cursor: "se-resize" },
          },
        ].map(({ corner, style }) => (
          <div
            key={corner}
            className="crop-handle absolute h-4 w-4 rounded-full border-2 border-white bg-blue-500"
            style={style}
            onMouseDown={(e) => handleResizeStart(corner, e)}
          />
        ))}
      </div>

      {/* 컨트롤 버튼 */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        <button
          onClick={onCancel}
          className="rounded-md bg-gray-700 px-6 py-2 text-white shadow-lg hover:bg-gray-600"
        >
          취소
        </button>
        <button
          onClick={handleCrop}
          className="rounded-md bg-blue-600 px-6 py-2 text-white shadow-lg hover:bg-blue-700"
        >
          크롭 완료
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
