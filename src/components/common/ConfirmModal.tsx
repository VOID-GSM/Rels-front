import Button from "@/components/common/Button";
import type { ButtonVariant } from "@/components/common/Button";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: ButtonVariant;
  pendingLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmVariant = "primary",
  pendingLabel,
  onConfirm,
  onCancel,
  isPending,
}: ConfirmModalProps) {
  const handleCancel = () => {
    if (isPending) return;
    onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 p-4 backdrop-blur-[2px]"
      onClick={handleCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="flex w-full max-w-[360px] flex-col gap-6 rounded-2xl bg-surface p-6 shadow-e4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="text-sm leading-relaxed text-gray-600">{message}</p>
        </div>
        <div className="flex gap-2.5">
          <Button
            variant="waiting"
            onClick={handleCancel}
            disabled={isPending}
            className="flex-1 py-3"
          >
            취소
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-3"
          >
            {isPending ? (pendingLabel ?? `${confirmLabel} 중`) : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
