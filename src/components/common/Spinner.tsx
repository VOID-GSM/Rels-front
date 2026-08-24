export default function Spinner({
  className = "min-h-[calc(100vh-70px)]",
}: {
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-main" />
    </div>
  );
}
