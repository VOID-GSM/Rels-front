import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold tracking-wide text-gray-600">
          {label}
        </label>
      )}
      <input
        className={`field h-11 w-full rounded-xl px-3.5 text-sm text-gray-900 placeholder:text-gray-400 ${
          error ? "field-error" : ""
        }`}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
