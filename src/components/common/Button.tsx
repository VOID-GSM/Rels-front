export type ButtonVariant = "primary" | "danger" | "cancel" | "waiting";

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
    "focusable flex cursor-pointer items-center justify-center rounded-xl font-semibold transition-[box-shadow,transform,background-color] duration-200 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none disabled:hover:translate-y-0";

  const variantStyle: Record<ButtonVariant, string> = {
    primary:
      "bg-main text-gray-900 shadow-e2 hover:-translate-y-px hover:shadow-e3",
    danger:
      "bg-error text-white shadow-e2 hover:-translate-y-px hover:shadow-e3",
    cancel:
      "bg-surface text-error shadow-e1 hover:-translate-y-px hover:bg-error-soft hover:shadow-e2",
    waiting: "bg-gray-100 text-gray-600",
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
