import { db } from "../../prisma/db";

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", {
	month: "short",
	timeZone: "UTC",
});

const getAdminSummary = async () => {
	const [
		users,
		students,
		admins,
		reviewers,
		submissions,
		pending,
		approved,
		rejected,
		feedbacks,
	] = await Promise.all([
		db.orm.public.User.aggregate((aggregate) => ({
			total: aggregate.count(),
		})),
		db.orm.public.User.where({ role: "STUDENT" }).aggregate((aggregate) => ({
			total: aggregate.count(),
		})),
		db.orm.public.User.where({ role: "ADMIN" }).aggregate((aggregate) => ({
			total: aggregate.count(),
		})),
		db.orm.public.User.where({ role: "REVIEWER" }).aggregate((aggregate) => ({
			total: aggregate.count(),
		})),
		db.orm.public.Submission.aggregate((aggregate) => ({
			total: aggregate.count(),
		})),
		db.orm.public.Submission.where({ status: "PENDING" }).aggregate(
			(aggregate) => ({ total: aggregate.count() }),
		),
		db.orm.public.Submission.where({ status: "APPROVED" }).aggregate(
			(aggregate) => ({ total: aggregate.count() }),
		),
		db.orm.public.Submission.where({ status: "REJECTED" }).aggregate(
			(aggregate) => ({ total: aggregate.count() }),
		),
		db.orm.public.Feedback.aggregate((aggregate) => ({
			total: aggregate.count(),
		})),
	]);

	const submissionDates = await db.orm.public.Submission.select(
		"createdAt",
		"status",
	).all();

	const now = new Date();
	const currentYear = now.getUTCFullYear();
	const currentMonth = now.getUTCMonth();

	const monthly = Array.from({ length: 6 }, (_, index) => {
		const offset = 5 - index;
		const date = new Date(Date.UTC(currentYear, currentMonth - offset, 1));

		return {
			key: `${date.getUTCFullYear()}-${date.getUTCMonth()}`,
			label: MONTH_FORMATTER.format(date),
			total: 0,
			counts: { PENDING: 0, APPROVED: 0, REJECTED: 0 },
		};
	});

	const monthlyByKey = new Map(monthly.map((entry) => [entry.key, entry]));

	for (const submission of submissionDates) {
		const date = new Date(submission.createdAt);

		if (Number.isNaN(date.getTime())) continue;

		const entry = monthlyByKey.get(
			`${date.getUTCFullYear()}-${date.getUTCMonth()}`,
		);

		if (!entry) continue;

		entry.total += 1;
		entry.counts[submission.status] += 1;
	}

	return {
		users: {
			total: users.total,
			students: students.total,
			admins: admins.total,
			reviewers: reviewers.total,
		},
		submissions: {
			total: submissions.total,
			pending: pending.total,
			approved: approved.total,
			rejected: rejected.total,
			monthly: monthly.map(({ key, label, total, counts }) => ({
				key,
				label,
				total,
				counts,
			})),
		},
		feedbacks: {
			total: feedbacks.total,
		},
	};
};

export const adminService = { getAdminSummary };
