interface CharCountTextAreaProps {
  label: string;
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
}

export default function CharCountTextArea({
  label,
  value,
  maxLength,
  onChange,
  placeholder,
  rows = 5,
  error,
}: CharCountTextAreaProps) {
  const safeValue = value ?? "";

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label className="text-xs font-semibold tracking-wide text-gray-600">
        {label}
      </label>
      <textarea
        placeholder={placeholder}
        value={safeValue}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        rows={rows}
        className={`field w-full resize-none whitespace-pre-wrap break-words rounded-xl px-3.5 py-3 text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 ${
          error ? "field-error" : ""
        }`}
      />
      <div className="flex items-center justify-between gap-2">
        {error ? (
          <p className="text-xs text-error">{error}</p>
        ) : (
          <span aria-hidden />
        )}
        <p className="tnum text-xs text-gray-500">
          {safeValue.length}/{maxLength}
        </p>
      </div>
    </div>
  );
}
