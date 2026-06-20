import { Star } from "lucide-react";

export function StarRating({
  value,
  size = 14,
  showNumber = true,
}: {
  value: number | null;
  size?: number;
  showNumber?: boolean;
}) {
  if (value == null) return null;
  const full = Math.round(value);
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={
              i < full ? "fill-[oklch(0.78_0.15_75)] text-[oklch(0.78_0.15_75)]" : "text-muted-foreground/40"
            }
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-xs font-medium text-foreground/80">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
