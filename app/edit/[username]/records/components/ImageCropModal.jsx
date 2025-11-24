"use client";
import { useState, useRef, useEffect } from "react";

export default function ImageCropModal({
  isOpen,
  onClose,
  imageFile,
  onCropComplete,
  aspectRatio = null, // null이면 자유 비율, 숫자면 고정 비율 (예: 16/9)
  minWidth = 100,
  minHeight = 100,
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!imageFile || !isOpen) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target.result);
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile, isOpen]);

  useEffect(() => {
    if (!imageSrc || !imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;

    img.onload = () => {
      const containerRect = container.getBoundingClientRect();
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const containerAspect = containerRect.width / containerRect.height;

      let displayWidth, displayHeight, offsetX, offsetY;

      if (imgAspect > containerAspect) {
        // 이미지가 더 넓음 - 컨테이너 너비에 맞춤
        displayWidth = containerRect.width;
        displayHeight = containerRect.width / imgAspect;
        offsetX = 0;
        offsetY = (containerRect.height - displayHeight) / 2;
      } else {
        // 이미지가 더 높음 - 컨테이너 높이에 맞춤
        displayHeight = containerRect.height;
        displayWidth = containerRect.height * imgAspect;
        offsetX = (containerRect.width - displayWidth) / 2;
        offsetY = 0;
      }

      setImageSize({ width: displayWidth, height: displayHeight });
      setImagePosition({ x: offsetX, y: offsetY });

      // 초기 크롭 영역 설정 (이미지 중앙에 기본 크기)
      const initialSize = Math.min(displayWidth * 0.8, displayHeight * 0.8);
      const initialWidth = aspectRatio
        ? initialSize
        : initialSize;
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

    // 오른쪽/아래 경계 체크
    if (x + width > imgX + imgW) {
      x = imgX + imgW - width;
    }
    if (y + height > imgY + imgH) {
      y = imgY + imgH - height;
    }

    return { x, y, width, height };
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    setIsDragging(true);
    setDragStart(pos);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

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
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResize = (corner, e) => {
    e.stopPropagation();
    e.preventDefault();
    const startPos = getMousePos(e);
    const startCrop = { ...cropArea };
    const startCenterX = startCrop.x + startCrop.width / 2;
    const startCenterY = startCrop.y + startCrop.height / 2;

    const handleMouseMoveResize = (moveEvent) => {
      moveEvent.preventDefault();
      const currentPos = getMousePos(moveEvent);
      const dx = currentPos.x - startPos.x;
      const dy = currentPos.y - startPos.y;

      let newArea = { ...startCrop };

      if (aspectRatio) {
        // 비율 고정 모드: 중심점 기준으로 크기 조정
        let newWidth, newHeight;
        
        if (corner.includes("e") && corner.includes("s")) {
          // 우하단
          newWidth = startCrop.width + dx;
          newHeight = newWidth / aspectRatio;
        } else if (corner.includes("e") && corner.includes("n")) {
          // 우상단
          newWidth = startCrop.width + dx;
          newHeight = newWidth / aspectRatio;
        } else if (corner.includes("w") && corner.includes("s")) {
          // 좌하단
          newWidth = startCrop.width - dx;
          newHeight = newWidth / aspectRatio;
        } else if (corner.includes("w") && corner.includes("n")) {
          // 좌상단
          newWidth = startCrop.width - dx;
          newHeight = newWidth / aspectRatio;
        } else if (corner.includes("e")) {
          // 오른쪽
          newWidth = startCrop.width + dx;
          newHeight = newWidth / aspectRatio;
        } else if (corner.includes("w")) {
          // 왼쪽
          newWidth = startCrop.width - dx;
          newHeight = newWidth / aspectRatio;
        } else if (corner.includes("s")) {
          // 아래
          newHeight = startCrop.height + dy;
          newWidth = newHeight * aspectRatio;
        } else if (corner.includes("n")) {
          // 위
          newHeight = startCrop.height - dy;
          newWidth = newHeight * aspectRatio;
        }

        // 중심점 유지하면서 위치 조정
        newArea.width = Math.max(minWidth, newWidth);
        newArea.height = Math.max(minHeight, newArea.width / aspectRatio);
        newArea.x = startCenterX - newArea.width / 2;
        newArea.y = startCenterY - newArea.height / 2;
      } else {
        // 자유 비율 모드
        if (corner.includes("e")) {
          newArea.width += dx;
        }
        if (corner.includes("w")) {
          newArea.width -= dx;
          newArea.x += dx;
        }
        if (corner.includes("s")) {
          newArea.height += dy;
        }
        if (corner.includes("n")) {
          newArea.height -= dy;
          newArea.y += dy;
        }
      }

      newArea = constrainCropArea(newArea);
      setCropArea(newArea);
    };

    const handleMouseUpResize = () => {
      document.removeEventListener("mousemove", handleMouseMoveResize);
      document.removeEventListener("mouseup", handleMouseUpResize);
    };

    document.addEventListener("mousemove", handleMouseMoveResize);
    document.addEventListener("mouseup", handleMouseUpResize);
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

    // Canvas 크기 설정
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // 이미지 크롭하여 그리기
    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    // Canvas를 Blob으로 변환
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], imageFile.name, {
            type: imageFile.type,
          });
          onCropComplete(croppedFile);
          handleClose();
        }
      },
      imageFile.type,
      0.95
    );
  };

  const handleClose = () => {
    setImageSrc(null);
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
    setIsDragging(false);
    onClose();
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/80"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="relative w-full max-w-4xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">이미지 크롭</h2>
          <button
            onClick={handleClose}
            className="rounded-md bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
          >
            취소
          </button>
        </div>

        <div
          ref={containerRef}
          className="relative mx-auto aspect-video w-full overflow-hidden rounded-lg bg-gray-900"
          style={{ maxHeight: "70vh" }}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="크롭할 이미지"
            className="absolute left-0 top-0 h-full w-full object-contain"
            draggable={false}
          />

          {/* 크롭 영역 오버레이 */}
          <div
            className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
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
              { corner: "nw", style: { top: "-4px", left: "-4px" } },
              { corner: "ne", style: { top: "-4px", right: "-4px" } },
              { corner: "sw", style: { bottom: "-4px", left: "-4px" } },
              { corner: "se", style: { bottom: "-4px", right: "-4px" } },
            ].map(({ corner, style }) => (
              <div
                key={corner}
                className="absolute h-3 w-3 rounded-full border-2 border-white bg-blue-500"
                style={style}
                onMouseDown={(e) => handleResize(corner, e)}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="rounded-md bg-gray-700 px-6 py-2 text-white hover:bg-gray-600"
          >
            취소
          </button>
          <button
            onClick={handleCrop}
            className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            크롭 완료
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}

