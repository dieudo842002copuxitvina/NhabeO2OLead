"use client";

type InputWithSuffixProps = {
  id: string;
  label: string;
  value: number;
  min?: number;
  step?: number;
  suffix: string;
  onChange: (next: number) => void;
};

export default function InputWithSuffix({
  id,
  label,
  value,
  min = 0,
  step = 0.1,
  suffix,
  onChange,
}: InputWithSuffixProps) {
  return (
    <label htmlFor={id} className="space-y-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-3 pr-14 text-gray-900 outline-none transition focus:border-[#4CAF50]"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-gray-500">
          {suffix}
        </span>
      </div>
    </label>
  );
}
