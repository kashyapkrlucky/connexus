"use client";

import { useState } from "react";
import { formatCompactNumber } from "@/shared/utils/format";

interface TrendChartProps {
  title: string;
  points: { date: string; value: number }[];
}

const WIDTH = 600;
const HEIGHT = 140;
const LINE_COLOR = "#665ff2"; // brand-400: validated against the dark surface

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** Single-series line chart with a snapping crosshair + tooltip and a table fallback. */
export function TrendChart({ title, points }: TrendChartProps) {
  const [hover, setHover] = useState<number | null>(null);

  if (points.length < 2) {
    return (
      <figure className="rounded-xl border border-gray-800 bg-gray-950/40 p-3">
        <figcaption className="text-xs font-medium text-gray-400">{title}</figcaption>
        <p className="py-6 text-center text-xs text-gray-500">The trend appears after a couple of daily snapshots.</p>
      </figure>
    );
  }

  const max = Math.max(1, ...points.map((p) => p.value));
  const x = (i: number) => (i / (points.length - 1)) * WIDTH;
  const y = (v: number) => HEIGHT - (v / max) * HEIGHT;
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const active = hover === null ? null : points[hover];

  const handlePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setHover(Math.round(ratio * (points.length - 1)));
  };

  return (
    <figure className="rounded-xl border border-gray-800 bg-gray-950/40 p-3">
      <figcaption className="mb-2 flex items-baseline justify-between text-xs">
        <span className="font-medium text-gray-400">{title}</span>
        <span className="text-gray-500">max {formatCompactNumber(max)}</span>
      </figcaption>

      <div
        className="relative h-28 touch-none"
        onPointerMove={handlePointer}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`${title}: ${formatCompactNumber(points[0].value)} on ${formatDay(points[0].date)} to ${formatCompactNumber(points.at(-1)!.value)} on ${formatDay(points.at(-1)!.date)}`}
      >
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
          {/* Recessive grid: top line at max, baseline at zero. */}
          <line x1={0} x2={WIDTH} y1={0} y2={0} className="stroke-gray-800" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
          <line x1={0} x2={WIDTH} y1={HEIGHT} y2={HEIGHT} className="stroke-gray-700" vectorEffect="non-scaling-stroke" />
          <path d={path} fill="none" stroke={LINE_COLOR} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {hover !== null && (
            <line x1={x(hover)} x2={x(hover)} y1={0} y2={HEIGHT} className="stroke-gray-500" vectorEffect="non-scaling-stroke" />
          )}
        </svg>

        {active && hover !== null && (
          <>
            <span
              className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gray-900"
              style={{ left: `${(hover / (points.length - 1)) * 100}%`, top: `${(y(active.value) / HEIGHT) * 100}%`, background: LINE_COLOR }}
            />
            <div
              className="pointer-events-none absolute top-0 z-10 -translate-y-full whitespace-nowrap rounded-lg border border-gray-700 bg-gray-900 px-2 py-1 text-xs shadow-lg"
              style={{
                left: `${(hover / (points.length - 1)) * 100}%`,
                transform: `translate(${hover > points.length / 2 ? "-100%" : "0"}, -110%)`,
              }}
            >
              <span className="text-gray-400">{formatDay(active.date)}</span>{" "}
              <span className="font-semibold text-gray-100">{active.value.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>

      <div className="mt-1 flex justify-between text-[11px] text-gray-500">
        <span>{formatDay(points[0].date)}</span>
        <span>{formatDay(points.at(-1)!.date)}</span>
      </div>

      <details className="mt-2 text-xs text-gray-500">
        <summary className="cursor-pointer select-none hover:text-gray-300">View as table</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="text-gray-400">
              <th className="py-1 font-medium">Date</th>
              <th className="py-1 text-right font-medium">{title}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.date} className="border-t border-gray-800">
                <td className="py-1">{formatDay(p.date)}</td>
                <td className="py-1 text-right text-gray-300">{p.value.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
