export default function InfoField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex-1 flex flex-col gap-1.5 bg-background rounded-xl p-3">
      <span className="text-xs text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  );
}
