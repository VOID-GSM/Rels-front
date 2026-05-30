import Button from "@/components/common/Button";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  confirmClassName?: string;
  pendingLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmClassName,
  pendingLabel,
  onConfirm,
  onCancel,
  isPending,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-[360px] mx-4 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="cancel" onClick={onCancel} className="py-2.5">
            취소
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className={`py-2.5 ${confirmClassName ?? ""}`}
          >
            {isPending ? (pendingLabel ?? `${confirmLabel} 중..`) : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
