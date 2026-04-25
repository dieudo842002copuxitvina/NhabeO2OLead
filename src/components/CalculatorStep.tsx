import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface CalculatorStepProps {
  title: string;
  description?: string;
  inputType: "number" | "select";
  options?: string[];
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  onNext?: () => void;
  unit?: string;
  placeholder?: string;
  nextLabel?: string;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  stepNumber?: number;
  totalSteps?: number;
}

export function CalculatorStep({
  title,
  description,
  inputType,
  options = [],
  value,
  onChange,
  onNext,
  unit,
  placeholder,
  nextLabel = "Tiếp tục",
  loading,
  error,
  disabled,
  className,
  stepNumber,
  totalSteps,
}: CalculatorStepProps) {
  const inputId = `calc-step-${title.replace(/\s+/g, "-").toLowerCase()}`;
  const isEmpty = value === undefined || value === null || value === "";

  return (
    <Card className={cn("rounded-2xl border-border/60 max-w-xl mx-auto w-full", className)}>
      <CardContent className="p-6 sm:p-8 space-y-6">
        <header className="space-y-2">
          {stepNumber !== undefined && totalSteps !== undefined && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Bước {stepNumber} / {totalSteps}
            </p>
          )}
          <h2 className="text-xl sm:text-2xl font-bold leading-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          )}
        </header>

        <div className="space-y-2">
          <Label htmlFor={inputId} className="text-sm font-medium">
            {inputType === "select" ? "Lựa chọn" : "Giá trị"}
            {unit && <span className="text-muted-foreground ml-1">({unit})</span>}
          </Label>

          {loading ? (
            <Skeleton className="h-14 w-full rounded-md" />
          ) : inputType === "number" ? (
            <div className="relative">
              <Input
                id={inputId}
                type="number"
                inputMode="decimal"
                value={value ?? ""}
                placeholder={placeholder ?? "Nhập số..."}
                onChange={(e) => {
                  const v = e.target.value;
                  onChange(v === "" ? "" : Number(v));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isEmpty && !error) onNext?.();
                }}
                disabled={disabled}
                aria-invalid={!!error}
                className={cn(
                  "h-14 text-lg font-medium pr-16",
                  error && "border-destructive focus-visible:ring-destructive",
                )}
              />
              {unit && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground pointer-events-none">
                  {unit}
                </span>
              )}
            </div>
          ) : (
            <Select
              value={value !== undefined ? String(value) : undefined}
              onValueChange={onChange}
              disabled={disabled}
            >
              <SelectTrigger
                id={inputId}
                aria-invalid={!!error}
                className={cn(
                  "h-14 text-base",
                  error && "border-destructive focus-visible:ring-destructive",
                )}
              >
                <SelectValue placeholder={placeholder ?? "Chọn một lựa chọn"} />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt} value={opt} className="text-base py-3">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {error && (
            <p className="flex items-start gap-1.5 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}
        </div>

        <Button
          size="lg"
          onClick={onNext}
          disabled={loading || disabled || isEmpty || !!error}
          className="w-full h-14 text-base font-semibold shadow-sm"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {nextLabel} <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default CalculatorStep;
