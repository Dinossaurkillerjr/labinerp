"use client";

/**
 * Lightweight, dependency-free chart primitives for mocked dashboard data.
 * Replace with a full charting library only if Phase 2+ requires richer interaction.
 */

export function Sparkline({
  data,
  className,
  color = "var(--color-electric-blue)",
}: {
  data: number[];
  className?: string;
  color?: string;
}) {
  const width = 100;
  const height = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BarChart({
  data,
  className,
}: {
  data: { label: string; value: number; color?: string }[];
  className?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={className}>
      <div className="flex h-40 gap-2">
        {data.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-32 w-full items-end">
              <div
                className="w-full rounded-t-md"
                style={{
                  height: `${(item.value / max) * 100}%`,
                  backgroundColor: item.color ?? "var(--color-electric-blue)",
                  minHeight: 2,
                }}
              />
            </div>
            <span className="text-caption text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
