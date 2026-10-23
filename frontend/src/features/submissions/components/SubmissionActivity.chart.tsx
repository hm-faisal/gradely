import type { MonthlyActivity } from "../../../utils/utils";

type SubmissionActivityChartProps = {
	data: MonthlyActivity[];
};

const WIDTH = 640;
const HEIGHT = 220;
const PADDING = { top: 18, right: 16, bottom: 34, left: 28 };

export const SubmissionActivityChart = ({
	data,
}: SubmissionActivityChartProps) => {
	const chartWidth = WIDTH - PADDING.left - PADDING.right;
	const chartHeight = HEIGHT - PADDING.top - PADDING.bottom;
	const maxValue = Math.max(1, ...data.map((entry) => entry.total));
	const stepX = data.length > 1 ? chartWidth / (data.length - 1) : 0;

	const points = data.map((entry, index) => {
		const x = PADDING.left + stepX * index;
		const y =
			PADDING.top + chartHeight - (entry.total / maxValue) * chartHeight;

		return { ...entry, x, y };
	});

	const linePath = points
		.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
		.join(" ");

	const first = points[0];
	const last = points[points.length - 1];
	const baseline = PADDING.top + chartHeight;
	const areaPath =
		first && last
			? `${linePath} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`
			: "";

	const gridLines = [0, 0.25, 0.5, 0.75, 1];
	const total = data.reduce((sum, entry) => sum + entry.total, 0);

	return (
		<div className="w-full">
			<svg
				viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
				role="img"
				aria-label={`Submission activity over the last ${data.length} months. ${total} total submissions, peaking at ${Math.max(...data.map((entry) => entry.total))} in a single month.`}
				className="h-56 w-full overflow-visible"
			>
				<defs>
					<linearGradient id="activity-fill" x1="0" y1="0" x2="0" y2="1">
						<stop
							offset="0%"
							stopColor="var(--color-chart-2)"
							stopOpacity="0.38"
						/>
						<stop
							offset="100%"
							stopColor="var(--color-chart-2)"
							stopOpacity="0.02"
						/>
					</linearGradient>
				</defs>

				{gridLines.map((fraction) => {
					const y = PADDING.top + chartHeight * fraction;

					return (
						<line
							key={fraction}
							x1={PADDING.left}
							x2={WIDTH - PADDING.right}
							y1={y}
							y2={y}
							stroke="currentColor"
							strokeOpacity={fraction === 1 ? 0.16 : 0.08}
							strokeDasharray={fraction === 1 ? undefined : "4 6"}
						/>
					);
				})}

				<text
					x={PADDING.left - 8}
					y={PADDING.top + 4}
					textAnchor="end"
					className="fill-muted-foreground text-[9px]"
				>
					{maxValue}
				</text>
				<text
					x={PADDING.left - 8}
					y={baseline + 3}
					textAnchor="end"
					className="fill-muted-foreground text-[9px]"
				>
					0
				</text>

				{areaPath ? <path d={areaPath} fill="url(#activity-fill)" /> : null}

				{linePath ? (
					<path
						d={linePath}
						fill="none"
						stroke="var(--color-chart-2)"
						strokeWidth={2.5}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				) : null}

				{points.map((point) => (
					<g key={point.key}>
						<circle
							cx={point.x}
							cy={point.y}
							r={4}
							fill="var(--color-background)"
							stroke="var(--color-chart-2)"
							strokeWidth={2.5}
						/>
						<text
							x={point.x}
							y={HEIGHT - 8}
							textAnchor="middle"
							className="fill-muted-foreground text-[10px]"
						>
							{point.label}
						</text>
					</g>
				))}
			</svg>

			<ul className="sr-only">
				{data.map((entry) => (
					<li key={entry.key}>
						{entry.label}: {entry.total}{" "}
						{entry.total === 1 ? "submission" : "submissions"}
					</li>
				))}
			</ul>
		</div>
	);
};
