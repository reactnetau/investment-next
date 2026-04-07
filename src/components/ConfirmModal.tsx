"use client";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
  danger?: boolean;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onClose,
  loading = false,
  danger = false,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={loading ? undefined : onClose} />

      <div
        className="relative w-full max-w-sm rounded-2xl border border-line bg-panel p-6"
        style={{ boxShadow: "var(--shadow)" }}
      >
        <h2 className="text-lg font-bold text-ink mb-1">{title}</h2>
        <p className="text-sm text-muted mb-6">{message}</p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-line bg-white py-3 text-ink font-bold text-base hover:bg-[#f0ece3] disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-xl py-3 text-white font-bold text-base hover:opacity-90 disabled:opacity-60 transition ${danger ? "bg-danger" : "bg-accent"}`}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
