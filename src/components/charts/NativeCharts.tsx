import React from 'react';

interface TrendSeries {
  name: string;
  values: number[];
  color: string;
  fill?: string;
}

interface NativeTrendChartProps {
  labels: string[];
  series: TrendSeries[];
  ariaLabel: string;
  formatValue: (value: number) => string;
  tickSuffix?: string;
}

export const NativeTrendChart: React.FC<NativeTrendChartProps> = ({
  labels,
  series,
  ariaLabel,
  formatValue,
  tickSuffix = ' jt',
}) => {
  const width = 720;
  const height = 280;
  const plot = { left: 56, right: 16, top: 16, bottom: 38 };
  const plotWidth = width - plot.left - plot.right;
  const plotHeight = height - plot.top - plot.bottom;
  const rawMax = Math.max(...series.flatMap((item) => item.values), 1);
  const maxValue = Math.ceil((rawMax * 1.08) / 5_000_000) * 5_000_000;
  const baseline = plot.top + plotHeight;
  const x = (index: number) => plot.left + (index / Math.max(labels.length - 1, 1)) * plotWidth;
  const y = (value: number) => plot.top + (1 - value / maxValue) * plotHeight;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      role="img"
      aria-label={ariaLabel}
    >
      {ticks.map((ratio) => {
        const tickY = baseline - ratio * plotHeight;
        const value = maxValue * ratio;
        return (
          <g key={ratio}>
            <line x1={plot.left} x2={width - plot.right} y1={tickY} y2={tickY} stroke="#e7e9e5" vectorEffect="non-scaling-stroke" />
            <text x={plot.left - 10} y={tickY + 4} textAnchor="end" fill="#7a847e" fontSize="10">
              {Math.round(value / 1_000_000)}{tickSuffix}
            </text>
          </g>
        );
      })}

      {series.map((item) => {
        const points = item.values.map((value, index) => [x(index), y(value)] as const);
        const linePath = points.map(([pointX, pointY], index) => `${index === 0 ? 'M' : 'L'} ${pointX} ${pointY}`).join(' ');
        const areaPath = item.fill
          ? `${linePath} L ${points[points.length - 1][0]} ${baseline} L ${points[0][0]} ${baseline} Z`
          : '';

        return (
          <g key={item.name}>
            {areaPath && <path d={areaPath} fill={item.fill} opacity="0.72" />}
            <path d={linePath} fill="none" stroke={item.color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            {points.map(([pointX, pointY], index) => (
              <circle key={`${item.name}-${labels[index]}`} cx={pointX} cy={pointY} r="3" fill={item.color}>
                <title>{`${item.name}, ${labels[index]}: ${formatValue(item.values[index])}`}</title>
              </circle>
            ))}
          </g>
        );
      })}

      {labels.map((label, index) => (
        <text key={label} x={x(index)} y={height - 10} textAnchor="middle" fill="#6b756f" fontSize="10">
          {label}
        </text>
      ))}
    </svg>
  );
};

interface DonutItem {
  name: string;
  value: number;
  color: string;
}

interface NativeDonutProps {
  items: DonutItem[];
  value: number;
  label: string;
}

export const NativeDonut: React.FC<NativeDonutProps> = ({ items, value, label }) => {
  let offset = 0;

  return (
    <div className="relative h-40 w-40" role="img" aria-label={`${value} ${label}. ${items.map((item) => `${item.name} ${item.value}%`).join(', ')}`}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r="36" fill="none" stroke="#eef0eb" strokeWidth="13" />
        {items.map((item) => {
          const currentOffset = offset;
          offset += item.value;
          return (
            <circle
              key={item.name}
              cx="50"
              cy="50"
              r="36"
              pathLength="100"
              fill="none"
              stroke={item.color}
              strokeWidth="13"
              strokeDasharray={`${Math.max(item.value - 1, 0)} ${101 - item.value}`}
              strokeDashoffset={-currentOffset}
            />
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
        <span className="text-xl font-semibold text-slate-950 tabular-nums">{value}</span>
        <span className="text-[9px] uppercase tracking-[0.1em] text-slate-500">{label}</span>
      </div>
    </div>
  );
};
