import { ZoomIn, Minus, Plus, X } from "lucide-react";

interface ImageModalProps {
  modalImage: string | null;
  zoom: number;
  closeModal: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export function ImageModal({
  modalImage,
  zoom,
  closeModal,
  zoomIn,
  zoomOut,
}: ImageModalProps) {
  if (!modalImage) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <button
        onClick={closeModal}
        className="absolute top-5 left-5 text-white rounded-full w-10 h-10 flex items-center justify-center"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="relative flex flex-col items-center">
        <img
          src={modalImage}
          alt="Full View"
          style={{ transform: `scale(${zoom})` }}
          className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg transition-transform"
        />

        <div className="mt-4 bg-neutral-800/90 text-white px-6 py-2 rounded-full flex items-center gap-6 z-50 shadow-lg">
          <button onClick={zoomOut}>
            <Minus className="w-6 h-6 hover:scale-110 transition-transform" />
          </button>
          <div className="flex items-center justify-center w-6 h-6">
            <ZoomIn className="w-5 h-5 opacity-60" />
          </div>
          <button onClick={zoomIn}>
            <Plus className="w-6 h-6 hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}