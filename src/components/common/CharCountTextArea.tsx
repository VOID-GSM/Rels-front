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
  return (
    <div className="flex w-full flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <textarea
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        rows={rows}
        className={`w-full resize-none rounded-md border px-3 py-2 placeholder:text-gray-400 break-words whitespace-pre-wrap focus:outline-none transition-colors ${
          error
            ? "border-error focus:border-error"
            : "border-main-300 focus:border-main"
        }`}
      />
      <p className="text-right text-xs text-gray-400">
        {value.length}/{maxLength}
      </p>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
