import { cn } from "cn";
import {
	STATUS_DOT_STYLES,
	STATUS_SHORT_LABELS,
	STATUS_STYLES,
} from "../../../utils/utils";
import type { SubmissionStatus } from "../types";

type StatusBadgeProps = {
	status: SubmissionStatus;
	className?: string;
	withDot?: boolean;
};

export const StatusBadge = ({
	status,
	className,
	withDot = true,
}: StatusBadgeProps) => {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
				STATUS_STYLES[status],
				className,
			)}
		>
			{withDot ? (
				<span
					aria-hidden="true"
					className={cn("size-1.5 rounded-full", STATUS_DOT_STYLES[status])}
				/>
			) : null}
			{STATUS_SHORT_LABELS[status]}
		</span>
	);
};
