import {
	SUBMISSION_STATUSES,
	type Submission,
	type SubmissionStatus,
} from "../features/submissions/types";

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
	PENDING: "Pending review",
	APPROVED: "Approved",
	REJECTED: "Rejected",
};

export const STATUS_SHORT_LABELS: Record<SubmissionStatus, string> = {
	PENDING: "Pending",
	APPROVED: "Approved",
	REJECTED: "Rejected",
};

export const STATUS_DESCRIPTIONS: Record<SubmissionStatus, string> = {
	PENDING: "Waiting for a reviewer to pick this up.",
	APPROVED: "Reviewed and accepted by the Gradely team.",
	REJECTED: "Reviewed and returned with feedback.",
};

export const STATUS_STYLES: Record<SubmissionStatus, string> = {
	PENDING:
		"bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-400",
	APPROVED:
		"bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
	REJECTED: "bg-destructive/10 text-destructive ring-destructive/20",
};

export const STATUS_DOT_STYLES: Record<SubmissionStatus, string> = {
	PENDING: "bg-amber-500",
	APPROVED: "bg-emerald-500",
	REJECTED: "bg-destructive",
};

export const STATUS_CHART_COLORS: Record<SubmissionStatus, string> = {
	PENDING: "var(--chart-2)",
	APPROVED: "var(--chart-1)",
	REJECTED: "var(--chart-4)",
};

const GITHUB_HOSTS = new Set(["github.com", "www.github.com"]);
const REPOSITORY_SEGMENT = /^[a-z0-9._-]+$/i;

const decodePathSegment = (segment: string): string => {
	try {
		return decodeURIComponent(segment);
	} catch {
		return segment;
	}
};

export type GitHubRepoReference = {
	owner: string;
	repo: string;
	path: string[];
};

/**
 * Parses a GitHub repository URL into the reference needed to call the GitHub
 * REST API. Non-GitHub repositories return `null`, so callers can fall back to
 * a plain repository link.
 */
export const getGitHubRepoReference = (
	repoUrl: string,
): GitHubRepoReference | null => {
	let url: URL;

	try {
		url = new URL(repoUrl);
	} catch {
		return null;
	}

	if (
		(url.protocol !== "https:" && url.protocol !== "http:") ||
		!GITHUB_HOSTS.has(url.hostname.toLowerCase())
	) {
		return null;
	}

	const segments = url.pathname.split("/").filter(Boolean);
	const owner = decodePathSegment(segments[0] ?? "");
	const repo = decodePathSegment(segments[1] ?? "").replace(/\.git$/i, "");

	if (
		!REPOSITORY_SEGMENT.test(owner) ||
		!REPOSITORY_SEGMENT.test(repo) ||
		owner === "." ||
		owner === ".." ||
		repo === "." ||
		repo === ".."
	) {
		return null;
	}

	return {
		owner,
		repo,
		path: segments.slice(2).map(decodePathSegment).filter(Boolean),
	};
};

export const getStatusCounts = (
	submissions: Submission[],
): Record<SubmissionStatus, number> => {
	const counts: Record<SubmissionStatus, number> = {
		PENDING: 0,
		APPROVED: 0,
		REJECTED: 0,
	};

	for (const submission of submissions) {
		counts[submission.status] += 1;
	}

	return counts;
};

export const getFeedbackSubmissions = (submissions: Submission[]) =>
	submissions
		.filter(
			(submission) =>
				typeof submission.feedback === "string" &&
				submission.feedback.trim().length > 0,
		)
		.sort(
			(a, b) =>
				new Date(b.reviewedAt ?? b.updatedAt).getTime() -
				new Date(a.reviewedAt ?? a.updatedAt).getTime(),
		);

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	timeZone: "UTC",
});

export const formatDate = (value: string | null | undefined): string => {
	if (!value) return "—";

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) return "—";

	return dateFormatter.format(date);
};

export const formatShortDate = (value: string | null | undefined): string => {
	if (!value) return "—";

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) return "—";

	return shortDateFormatter.format(date);
};

export type MonthlyActivity = {
	key: string;
	label: string;
	total: number;
	counts: Record<SubmissionStatus, number>;
};

/**
 * Builds a month-by-month activity series for the last `months` calendar
 * months, including the current one. Dates are handled in UTC so the chart is
 * stable across server time zones. `now` is passed in explicitly so callers
 * control when the current time is read during rendering.
 */
export const getMonthlyActivity = (
	submissions: Submission[],
	now: Date,
	months = 6,
): MonthlyActivity[] => {
	const currentYear = now.getUTCFullYear();
	const currentMonth = now.getUTCMonth();

	const series = Array.from({ length: months }, (_, index) => {
		const offset = months - 1 - index;
		const date = new Date(Date.UTC(currentYear, currentMonth - offset, 1));

		return {
			key: `${date.getUTCFullYear()}-${date.getUTCMonth()}`,
			label: monthFormatter.format(date),
			year: date.getUTCFullYear(),
			month: date.getUTCMonth(),
			total: 0,
			counts: { PENDING: 0, APPROVED: 0, REJECTED: 0 } as Record<
				SubmissionStatus,
				number
			>,
		};
	});

	const byKey = new Map(series.map((entry) => [entry.key, entry]));

	for (const submission of submissions) {
		const date = new Date(submission.createdAt);

		if (Number.isNaN(date.getTime())) continue;

		const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
		const entry = byKey.get(key);

		if (!entry) continue;

		entry.total += 1;
		entry.counts[submission.status] += 1;
	}

	return series.map(({ year: _year, month: _month, ...entry }) => entry);
};

export const getStatusEntries = (counts: Record<SubmissionStatus, number>) =>
	SUBMISSION_STATUSES.map((status) => ({
		status,
		label: STATUS_LABELS[status],
		count: counts[status],
	}));

export const getInitials = (name: string, email?: string): string => {
	const source = name.trim() || email?.split("@")[0] || "U";
	const initials = source
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");

	return initials || "U";
};

export const truncate = (value: string, length = 120): string =>
	value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;
