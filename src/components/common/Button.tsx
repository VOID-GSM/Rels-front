// src/components/common/Button.tsx

type ButtonVariant = "primary" | "cancel" | "waiting";

interface ButtonProps {
  variant?: ButtonVariant;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  variant = "primary",
  children,
  className = "",
  onClick,
  disabled,
  type = "button",
}: ButtonProps) {
  const baseStyle =
    "w-full rounded-xl font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center";

  const variantStyle: Record<ButtonVariant, string> = {
    primary: "bg-main text-white",
    cancel: "border border-error text-error bg-white",
    waiting: "border border-main-300 text-main-300 bg-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variantStyle[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
