import { cn } from '@/lib/utils';

const SCALE_COLORS = [
  'bg-green-100 text-green-800 border-green-300',
  'bg-green-100 text-green-800 border-green-300',
  'bg-lime-100 text-lime-800 border-lime-300',
  'bg-lime-100 text-lime-800 border-lime-300',
  'bg-yellow-100 text-yellow-800 border-yellow-300',
  'bg-yellow-100 text-yellow-800 border-yellow-300',
  'bg-orange-100 text-orange-800 border-orange-300',
  'bg-orange-100 text-orange-800 border-orange-300',
  'bg-red-100 text-red-800 border-red-300',
  'bg-red-100 text-red-800 border-red-300',
];

interface ScalePickerProps {
  value: number | null;
  onChange: (value: number | null) => void;
  lowLabel: string;
  highLabel: string;
  label?: string;
}

export function ScalePicker({ value, onChange, lowLabel, highLabel, label }: ScalePickerProps) {
  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm font-semibold text-gray-800">{label}</p>
      )}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span>1 — {lowLabel}</span>
        <span>10 — {highLabel}</span>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(value === num ? null : num)}
            className={cn(
              'h-10 rounded-xl border-2 font-bold text-sm transition-all duration-200',
              value === num
                ? cn(SCALE_COLORS[num - 1], 'shadow-md scale-105')
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}

export { SCALE_COLORS };
