import {
	getGitHubRepoReference,
	type GitHubRepoReference,
} from "@/utils/utils";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	buildGitHubRepoPreviewDocument,
	fetchGitHubRepoPreview,
	type GitHubRepoPreview,
	GitHubRepoPreviewError,
} from "../utils/githubPreview";

type PreviewStatus = "idle" | "loading" | "ready" | "error";

export const useRepoPreview = (repoUrl: string) => {
	const [open, setOpen] = useState(false);
	const [status, setStatus] = useState<PreviewStatus>("idle");
	const [preview, setPreview] = useState<GitHubRepoPreview | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const { resolvedTheme } = useTheme();
	const abortRef = useRef<AbortController | null>(null);
	const repoReference = useMemo(
		() => getGitHubRepoReference(repoUrl),
		[repoUrl],
	);

	useEffect(() => {
		return () => {
			abortRef.current?.abort();
		};
	}, []);

	const loadPreview = (reference: GitHubRepoReference) => {
		abortRef.current?.abort();

		const controller = new AbortController();
		abortRef.current = controller;

		setStatus("loading");
		setErrorMessage(null);

		fetchGitHubRepoPreview(reference, controller.signal)
			.then((result) => {
				if (controller.signal.aborted) return;

				setPreview(result);
				setStatus("ready");
			})
			.catch((error: unknown) => {
				if (controller.signal.aborted) return;

				setStatus("error");
				setErrorMessage(
					error instanceof GitHubRepoPreviewError
						? error.message
						: "The repository preview could not be loaded. Check your connection and try again.",
				);
			});
	};

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);

		if (nextOpen) {
			if (repoReference) {
				loadPreview(repoReference);
			} else {
				setStatus("idle");
				setPreview(null);
				setErrorMessage(null);
			}

			return;
		}

		abortRef.current?.abort();
		abortRef.current = null;
		setStatus("idle");
		setPreview(null);
		setErrorMessage(null);
	};

	const iframeDocument = useMemo(
		() =>
			preview
				? buildGitHubRepoPreviewDocument(
						preview,
						resolvedTheme === "dark" ? "dark" : "light",
					)
				: "",
		[preview, resolvedTheme],
	);

	const showLoading =
		Boolean(repoReference) &&
		status !== "error" &&
		!(status === "ready" && preview);

	const description = !repoReference
		? "Repo preview supports public GitHub repository URLs."
		: status === "error"
			? "The repository preview could not be loaded."
			: status === "ready"
				? "Repository details and README rendered from the GitHub REST API."
				: "Fetching repository details and README from GitHub…";

	return {
		open,
		handleOpenChange,
		status,
		preview,
		errorMessage,
		iframeDocument,
		showLoading,
		description,
		repoReference,
		loadPreview,
	};
};
