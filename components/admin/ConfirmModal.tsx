"use client";

type ConfirmModalProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  confirmStyle?: "danger" | "accent";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  confirmStyle = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
        <h3 className="font-dm font-semibold text-base text-text mb-2">{title}</h3>
        <p className="font-dm text-sm text-muted mb-6">{message}</p>
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            className="font-dm text-sm text-muted hover:text-text border border-border px-4 py-2 rounded-md transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`font-dm text-sm font-medium px-4 py-2 rounded-md transition-colors duration-150 text-white ${
              confirmStyle === "danger"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-accent hover:bg-accentDk"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
