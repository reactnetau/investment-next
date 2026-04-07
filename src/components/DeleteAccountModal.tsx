"use client";

interface Props {
  onConfirm: () => void;
  onClose: () => void;
  deleting: boolean;
  isPro?: boolean;
}

export function DeleteAccountModal({ onConfirm, onClose, deleting, isPro }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={deleting ? undefined : onClose} />

      <div
        className="relative w-full max-w-sm rounded-2xl border border-line bg-panel p-6"
        style={{ boxShadow: "var(--shadow)" }}
      >
        <h2 className="text-lg font-bold text-ink mb-1">Delete Account</h2>
        <p className="text-sm text-muted mb-3">
          This will permanently delete your account and all portfolio data. This cannot be undone.
        </p>
        {isPro && (
          <p className="text-sm text-bad font-semibold mb-3">
            Your Pro access will be cancelled immediately and you will not receive a refund.
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 rounded-xl border border-line bg-white py-3 text-ink font-bold text-base hover:bg-[#f0ece3] disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 rounded-xl bg-danger py-3 text-white font-bold text-base hover:opacity-90 disabled:opacity-60 transition"
          >
            {deleting ? "Deleting…" : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
