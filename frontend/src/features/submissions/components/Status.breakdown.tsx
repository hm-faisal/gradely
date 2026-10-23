import { cn } from "cn";
import {
	getStatusEntries,
	STATUS_CHART_COLORS,
	STATUS_DOT_STYLES,
	STATUS_LABELS,
} from "../../../utils/utils";
import type { SubmissionStatus } from "../types";

type StatusBreakdownProps = {
	counts: Record<SubmissionStatus, number>;
	total: number;
	description?: string;
};

export const StatusBreakdown = ({
	counts,
	total,
	description,
}: StatusBreakdownProps) => {
	const entries = getStatusEntries(counts);
	const present = entries.filter((entry) => entry.count > 0);

	let cursor = 0;
	const stops = present
		.map((entry) => {
			const start = (cursor / total) * 100;
			cursor += entry.count;
			const end = (cursor / total) * 100;

			return `${STATUS_CHART_COLORS[entry.status]} ${start}% ${end}%`;
		})
		.join(", ");

	const gradient =
		present.length > 0 ? `conic-gradient(${stops})` : "var(--muted)";

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center gap-5">
				<div
					role="img"
					aria-label={`Status distribution across ${total} submissions`}
					className="relative size-28 shrink-0 rounded-full"
					style={{ background: gradient }}
				>
					<div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-card">
						<span className="text-2xl leading-none font-semibold">{total}</span>
						<span className="mt-1 text-[10px] tracking-wide text-muted-foreground uppercase">
							Total
						</span>
					</div>
				</div>

				<ul className="flex min-w-0 flex-1 flex-col gap-2.5">
					{entries.map((entry) => {
						const percentage =
							total > 0 ? Math.round((entry.count / total) * 100) : 0;

						return (
							<li
								key={entry.status}
								className="flex items-center gap-2 text-sm"
							>
								<span
									aria-hidden="true"
									className={cn(
										"size-2 shrink-0 rounded-full",
										STATUS_DOT_STYLES[entry.status],
									)}
								/>
								<span className="min-w-0 flex-1 truncate text-muted-foreground">
									{STATUS_LABELS[entry.status]}
								</span>
								<span className="font-medium tabular-nums">{entry.count}</span>
								<span className="w-9 text-right text-xs text-muted-foreground tabular-nums">
									{percentage}%
								</span>
							</li>
						);
					})}
				</ul>
			</div>

			<p className="text-xs leading-relaxed text-muted-foreground">
				{description ??
					(total > 0
						? "Review status across every project you have submitted."
						: "Once you submit a project, its review status will show up here.")}
			</p>
		</div>
	);
};
