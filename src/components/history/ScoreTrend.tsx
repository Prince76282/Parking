/**
 * ScoreTrend — a pure-SVG sparkline showing score history over attempts.
 * No external charting library needed.
 */

interface ScoreTrendProps {
  scores: number[];
  width?: number;
  height?: number;
}

export function ScoreTrend({ scores, width = 120, height = 36 }: ScoreTrendProps) {
  if (scores.length < 2) {
    return (
      <span className="text-xs text-slate-400 italic">
        {scores.length === 0 ? "No data" : "One attempt"}
      </span>
    );
  }

  const padding = 4;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const range = maxScore - minScore || 1;

  const points = scores.map((score, i) => {
    const x = padding + (i / (scores.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((score - minScore) / range) * chartHeight;
    return `${x},${y}`;
  });

  const polyline = points.join(" ");
  const lastPoint = points[points.length - 1].split(",");
  const lastX = parseFloat(lastPoint[0]);
  const lastY = parseFloat(lastPoint[1]);
  const lastScore = scores[scores.length - 1];

  const trendUp =
    scores.length >= 2 && scores[scores.length - 1] > scores[scores.length - 2];
  const strokeColor = trendUp ? "#10b981" : "#6366f1";

  return (
    <div className="flex items-center gap-2">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-label={`Score trend: ${scores.join(", ")}`}
        role="img"
      >
        {/* Background */}
        <rect width={width} height={height} rx="4" fill="#f8fafc" />
        {/* Sparkline */}
        <polyline
          points={polyline}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Last point dot */}
        <circle cx={lastX} cy={lastY} r="3" fill={strokeColor} />
      </svg>
      <span
        className={`text-sm font-bold tabular-nums ${
          trendUp ? "text-emerald-600" : "text-indigo-600"
        }`}
      >
        {lastScore.toFixed(1)}
        <span className="ml-0.5 text-xs">{trendUp ? "↑" : "→"}</span>
      </span>
    </div>
  );
}
