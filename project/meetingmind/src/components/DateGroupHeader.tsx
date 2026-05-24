interface DateGroupHeaderProps {
  label: string
}

export default function DateGroupHeader({ label }: DateGroupHeaderProps) {
  return (
    <div className="sticky top-14 z-30 bg-gray-50 border-b border-gray-200 px-4 py-2">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}
