import { ExternalLink, type Globe } from "lucide-react";

export const ResourceLink = ({
	href,
	label,
	icon: Icon,
}: {
	href: string;
	label: string;
	icon: typeof Globe;
}) => (
	<a
		href={href}
		target="_blank"
		rel="noreferrer noopener"
		className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
	>
		<Icon className="size-4" aria-hidden="true" />
		{label}
		<ExternalLink className="size-3.5" aria-hidden="true" />
	</a>
);
