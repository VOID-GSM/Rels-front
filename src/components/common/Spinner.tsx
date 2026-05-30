export default function Spinner({ className = "min-h-[calc(100vh-70px)]" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-8 h-8 border-2 border-main/30 border-t-main rounded-full animate-spin" />
    </div>
  );
}
