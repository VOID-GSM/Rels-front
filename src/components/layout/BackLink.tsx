import Link from "next/link";
import Arrow from "@/assets/svg/Arrow";

export default function BackLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="focusable inline-flex w-fit items-center gap-1.5 rounded-lg text-sm text-gray-600 transition-colors hover:text-gray-900"
    >
      <Arrow />
      {children}
    </Link>
  );
}
