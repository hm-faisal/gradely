import type { GitHubRepoReference } from "@/utils/utils";

const GITHUB_API_ROOT = "https://api.github.com";
const GITHUB_API_HEADERS = {
	Accept: "application/vnd.github+json",
	"X-GitHub-Api-Version": "2022-11-28",
} as const;

type GitHubRepository = {
	name: string;
	full_name: string;
	description: string | null;
	html_url: string;
	homepage: string | null;
	stargazers_count: number;
	forks_count: number;
	open_issues_count: number;
	language: string | null;
	license: { name: string; spdx_id: string | null } | null;
	topics?: string[];
	updated_at: string;
	default_branch: string;
	archived: boolean;
	private: boolean;
	visibility?: string;
	owner: {
		login: string;
		avatar_url: string;
	};
};

export type GitHubRepoPreview = {
	repo: GitHubRepository;
	readmeHtml: string | null;
	readmeError: string | null;
};

export class GitHubRepoPreviewError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "GitHubRepoPreviewError";
	}
}

const countFormatter = new Intl.NumberFormat("en-US", {
	notation: "compact",
	maximumFractionDigits: 1,
});

const updatedAtFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
});

const formatCount = (value: number): string => countFormatter.format(value);

const formatUpdatedAt = (value: string): string | null => {
	const date = new Date(value);

	return Number.isNaN(date.getTime()) ? null : updatedAtFormatter.format(date);
};

const formatRateLimitReset = (date: Date): string =>
	date.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
	});

const getRateLimitReset = (response: Response): Date | null => {
	const value = response.headers.get("x-ratelimit-reset");

	if (!value) return null;

	const seconds = Number(value);

	return Number.isFinite(seconds) ? new Date(seconds * 1000) : null;
};

const createPreviewError = (response: Response): GitHubRepoPreviewError => {
	if (response.status === 404) {
		return new GitHubRepoPreviewError(
			"This repository could not be found. It may be private, deleted, or the link may be incorrect.",
		);
	}

	if (response.status === 403 || response.status === 429) {
		const remaining = response.headers.get("x-ratelimit-remaining");
		const resetAt = getRateLimitReset(response);

		if (response.status === 429 || remaining === "0") {
			const retryTime = resetAt
				? ` Try again after ${formatRateLimitReset(resetAt)}.`
				: " Try again later.";

			return new GitHubRepoPreviewError(
				`GitHub's API rate limit has been reached.${retryTime} You can still open the repository directly.`,
			);
		}

		return new GitHubRepoPreviewError(
			"GitHub blocked the preview request. You can still open the repository directly.",
		);
	}

	if (response.status === 451) {
		return new GitHubRepoPreviewError(
			"GitHub has made this repository unavailable. You can still open it directly.",
		);
	}

	if (response.status >= 500) {
		return new GitHubRepoPreviewError(
			"GitHub could not load this repository right now. Please try again.",
		);
	}

	return new GitHubRepoPreviewError(
		`GitHub returned an unexpected response (${response.status}). You can still open the repository directly.`,
	);
};

const getReadmeError = (response: Response): string => {
	if (response.status === 403 || response.status === 429) {
		return "GitHub's API rate limit prevented the README from loading.";
	}

	return "GitHub could not return this repository's README.";
};

const resolveReadmeLink = (
	href: string,
	blobBase: string,
	owner: string,
	repoName: string,
): string => {
	if (href.startsWith("//")) return `https:${href}`;

	if (href.startsWith("/")) {
		if (href.startsWith(`/${owner}/${repoName}`)) {
			return `https://github.com${href}`;
		}

		return `${blobBase}${href.replace(/^\/+/, "")}`;
	}

	if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
		return href;
	}

	return new URL(href, blobBase).href;
};

const rewriteReadmeHtml = (
	html: string,
	repository: GitHubRepository,
): string => {
	const parsed = new DOMParser().parseFromString(html, "text/html");

	parsed
		.querySelectorAll("script, iframe, object, embed, form, link, meta, style")
		.forEach((element) => {
			element.remove();
		});

	const owner = repository.owner.login;
	const repoName = repository.name;
	const branch = repository.default_branch;
	const repoRoot = repository.html_url.replace(/\/+$/, "");
	const blobBase = `${repoRoot}/blob/${encodeURIComponent(branch)}/`;
	const rawBase = `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/${encodeURIComponent(branch)}/`;

	for (const anchor of parsed.querySelectorAll<HTMLAnchorElement>("a[href]")) {
		const href = anchor.getAttribute("href")?.trim();

		if (!href) continue;

		if (href.startsWith("#")) continue;

		if (/^(?:javascript|data|vbscript):/i.test(href)) {
			anchor.removeAttribute("href");
			continue;
		}

		anchor.setAttribute(
			"href",
			resolveReadmeLink(href, blobBase, owner, repoName),
		);
		anchor.setAttribute("target", "_blank");
		anchor.setAttribute("rel", "noreferrer noopener");
	}

	for (const image of parsed.querySelectorAll<HTMLImageElement>("img[src]")) {
		const src = image.getAttribute("src")?.trim();

		if (!src) continue;

		if (/^data:image\//i.test(src)) continue;

		if (/^(?:https?:)?\/\//i.test(src)) {
			if (src.startsWith("//")) {
				image.setAttribute("src", `https:${src}`);
			}

			continue;
		}

		if (/^[a-z][a-z0-9+.-]*:/i.test(src)) {
			continue;
		}

		image.setAttribute("src", new URL(src.replace(/^\/+/, ""), rawBase).href);
	}

	for (const element of parsed.body.querySelectorAll("*")) {
		for (const attribute of Array.from(element.attributes)) {
			if (attribute.name.toLowerCase().startsWith("on")) {
				element.removeAttribute(attribute.name);
			}
		}
	}

	return parsed.body.innerHTML;
};

export const fetchGitHubRepoPreview = async (
	reference: GitHubRepoReference,
	signal: AbortSignal,
): Promise<GitHubRepoPreview> => {
	const repoApiUrl = `${GITHUB_API_ROOT}/repos/${encodeURIComponent(reference.owner)}/${encodeURIComponent(reference.repo)}`;

	const readmeRequest = fetch(`${repoApiUrl}/readme`, {
		headers: {
			...GITHUB_API_HEADERS,
			Accept: "application/vnd.github.html+json",
		},
		credentials: "omit",
		signal,
	}).catch(() => null);

	let repoResponse: Response;

	try {
		repoResponse = await fetch(repoApiUrl, {
			headers: GITHUB_API_HEADERS,
			credentials: "omit",
			signal,
		});
	} catch (error) {
		if (signal.aborted) throw error;

		throw new GitHubRepoPreviewError(
			"GitHub could not be reached. Check your connection and try again.",
		);
	}

	if (!repoResponse.ok) {
		throw createPreviewError(repoResponse);
	}

	let repository: GitHubRepository;

	try {
		repository = (await repoResponse.json()) as GitHubRepository;
	} catch {
		throw new GitHubRepoPreviewError(
			"GitHub returned an unreadable repository response. Please try again.",
		);
	}

	const readmeResponse = await readmeRequest;

	let readmeHtml: string | null = null;
	let readmeError: string | null = null;

	if (readmeResponse?.ok) {
		try {
			const html = (await readmeResponse.text()).trim();
			readmeHtml = html ? rewriteReadmeHtml(html, repository) : null;
		} catch {
			readmeError = "The README could not be loaded from GitHub.";
		}
	} else if (readmeResponse && readmeResponse.status !== 404) {
		readmeError = getReadmeError(readmeResponse);
	}

	return {
		repo: repository,
		readmeHtml,
		readmeError,
	};
};

const HTML_ENTITIES: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

const escapeHtml = (value: string): string =>
	value.replace(
		/[&<>"']/g,
		(character) => HTML_ENTITIES[character] ?? character,
	);

const capitalize = (value: string): string =>
	value.charAt(0).toUpperCase() + value.slice(1);

const buildReadmeSection = (
	readmeHtml: string | null,
	readmeError: string | null,
	safeRepoUrl: string,
): string => {
	if (readmeHtml) {
		return `<div class="readme-body">${readmeHtml}</div>`;
	}

	const message = escapeHtml(
		readmeError ?? "This repository does not include a README.",
	);

	return `<div class="empty">
    <h3>README unavailable</h3>
    <p>${message}</p>
    <a href="${safeRepoUrl}#readme" target="_blank" rel="noreferrer noopener">Open the repository on GitHub</a>
  </div>`;
};

export const buildGitHubRepoPreviewDocument = (
	preview: GitHubRepoPreview,
	theme: "light" | "dark",
): string => {
	const { repo, readmeHtml, readmeError } = preview;
	const fullName = escapeHtml(
		repo.full_name || `${repo.owner.login}/${repo.name}`,
	);
	const repoUrl = escapeHtml(repo.html_url);
	const description = repo.description?.trim();
	const homepage = repo.homepage?.trim();
	const homepageUrl =
		homepage && /^https?:\/\//i.test(homepage) ? escapeHtml(homepage) : null;
	const updatedAt = formatUpdatedAt(repo.updated_at);
	const licenseLabel =
		repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION"
			? repo.license.spdx_id
			: repo.license?.name;
	const visibility = repo.visibility
		? capitalize(repo.visibility)
		: repo.private
			? "Private"
			: "Public";
	const topics = (repo.topics ?? []).slice(0, 8);
	const readmeSection = buildReadmeSection(readmeHtml, readmeError, repoUrl);

	const metaItems = [
		repo.language
			? `<span class="meta-item"><span class="language-dot"></span>${escapeHtml(repo.language)}</span>`
			: null,
		licenseLabel
			? `<span class="meta-item">${escapeHtml(licenseLabel)}</span>`
			: null,
		updatedAt
			? `<span class="meta-item">Updated ${escapeHtml(updatedAt)}</span>`
			: null,
		`<span class="meta-item">Default branch: ${escapeHtml(repo.default_branch)}</span>`,
	].filter(Boolean);

	const topicsSection =
		topics.length > 0
			? `<div class="topics">${topics
					.map((topic) => `<span class="topic">${escapeHtml(topic)}</span>`)
					.join("")}</div>`
			: "";

	return `<!doctype html>
<html lang="en" class="${theme}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none';" />
  <title>${fullName} · GitHub preview</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #ffffff;
      --bg-subtle: #f6f8fa;
      --bg-inset: #f6f8fa;
      --border: #d8dee4;
      --border-muted: #eaeef2;
      --fg: #1f2328;
      --fg-muted: #59636e;
      --fg-subtle: #6e7781;
      --accent: #0969da;
      --accent-muted: rgba(9, 105, 218, 0.1);
      --warning: #9a6700;
      --warning-muted: rgba(154, 103, 0, 0.12);
      --code-bg: #f6f8fa;
      --pre-bg: #f6f8fa;
    }

    .dark {
      color-scheme: dark;
      --bg: #0d1117;
      --bg-subtle: #151b23;
      --bg-inset: #010409;
      --border: #3d444d;
      --border-muted: #212830;
      --fg: #f0f6fc;
      --fg-muted: #9198a1;
      --fg-subtle: #6e7681;
      --accent: #4493f8;
      --accent-muted: rgba(56, 139, 253, 0.15);
      --warning: #d29922;
      --warning-muted: rgba(210, 153, 34, 0.15);
      --code-bg: #151b23;
      --pre-bg: #151b23;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      color: var(--fg);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans",
        Helvetica, Arial, sans-serif;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    a {
      color: var(--accent);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    .shell {
      max-width: 980px;
      margin: 0 auto;
      padding: 24px;
    }

    .repo-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .avatar {
      width: 56px;
      height: 56px;
      flex: none;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--bg-subtle);
    }

    .repo-heading {
      min-width: 0;
      flex: 1;
    }

    .kicker {
      margin-bottom: 4px;
      color: var(--fg-muted);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.09em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      font-size: clamp(22px, 4vw, 30px);
      font-weight: 650;
      letter-spacing: -0.02em;
      line-height: 1.2;
      overflow-wrap: anywhere;
    }

    h1 a {
      color: var(--fg);
    }

    .description {
      margin: 10px 0 0;
      color: var(--fg-muted);
      font-size: 15px;
    }

    .badges,
    .actions,
    .topics,
    .meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }

    .badges {
      margin-top: 12px;
    }

    .badge,
    .topic {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 3px 9px;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.4;
    }

    .badge {
      background: var(--accent-muted);
      color: var(--accent);
    }

    .badge-warning {
      background: var(--warning-muted);
      color: var(--warning);
    }

    .topic {
      border: 1px solid var(--border-muted);
      background: var(--bg-subtle);
      color: var(--fg-muted);
      font-weight: 500;
    }

    .actions {
      margin-top: 16px;
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 32px;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 5px 12px;
      background: var(--bg-subtle);
      color: var(--fg);
      font-size: 13px;
      font-weight: 600;
    }

    .button:hover {
      background: var(--border-muted);
      text-decoration: none;
    }

    .button-primary {
      border-color: var(--accent);
      background: var(--accent);
      color: #ffffff;
    }

    .button-primary:hover {
      filter: brightness(0.94);
      background: var(--accent);
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      margin-top: 22px;
    }

    .stat {
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 14px;
      background: var(--bg-subtle);
    }

    .stat strong {
      display: block;
      font-size: 20px;
      font-variant-numeric: tabular-nums;
      line-height: 1.2;
    }

    .stat span {
      color: var(--fg-muted);
      font-size: 12px;
    }

    .meta {
      margin-top: 14px;
      color: var(--fg-muted);
      font-size: 12px;
    }

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .language-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: var(--accent);
    }

    .topics {
      margin-top: 12px;
    }

    .readme {
      margin-top: 26px;
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--bg);
    }

    .readme-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-bottom: 1px solid var(--border-muted);
      padding: 12px 18px;
      background: var(--bg-subtle);
    }

    .readme-header h2 {
      margin: 0;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .readme-header a {
      font-size: 12px;
      font-weight: 600;
    }

    .readme-body {
      padding: 20px;
    }

    .readme-body .markdown-body {
      color: var(--fg);
      font-size: 15px;
      line-height: 1.65;
      overflow-wrap: break-word;
    }

    .markdown-body > :first-child {
      margin-top: 0 !important;
    }

    .markdown-body > :last-child {
      margin-bottom: 0 !important;
    }

    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3,
    .markdown-body h4,
    .markdown-body h5,
    .markdown-body h6 {
      margin: 24px 0 14px;
      font-weight: 600;
      line-height: 1.25;
    }

    .markdown-body h1 {
      border-bottom: 1px solid var(--border-muted);
      padding-bottom: 0.3em;
      font-size: 1.85em;
    }

    .markdown-body h2 {
      border-bottom: 1px solid var(--border-muted);
      padding-bottom: 0.3em;
      font-size: 1.45em;
    }

    .markdown-body h3 {
      font-size: 1.22em;
    }

    .markdown-body h4 {
      font-size: 1em;
    }

    .markdown-body p,
    .markdown-body ul,
    .markdown-body ol,
    .markdown-body dl,
    .markdown-body table,
    .markdown-body blockquote,
    .markdown-body pre,
    .markdown-body details {
      margin-top: 0;
      margin-bottom: 16px;
    }

    .markdown-body ul,
    .markdown-body ol {
      padding-left: 2em;
    }

    .markdown-body li + li {
      margin-top: 0.25em;
    }

    .markdown-body code {
      border-radius: 6px;
      padding: 0.2em 0.4em;
      background: var(--code-bg);
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
        "Liberation Mono", monospace;
      font-size: 85%;
    }

    .markdown-body pre {
      overflow: auto;
      border: 1px solid var(--border-muted);
      border-radius: 8px;
      padding: 16px;
      background: var(--pre-bg);
    }

    .markdown-body pre code {
      padding: 0;
      background: transparent;
      font-size: 85%;
      white-space: pre;
    }

    .markdown-body blockquote {
      border-left: 0.25em solid var(--border);
      padding: 0 1em;
      color: var(--fg-muted);
    }

    .markdown-body table {
      display: block;
      width: max-content;
      max-width: 100%;
      overflow: auto;
      border-collapse: collapse;
    }

    .markdown-body th,
    .markdown-body td {
      border: 1px solid var(--border);
      padding: 6px 13px;
    }

    .markdown-body tr:nth-child(2n) {
      background: var(--bg-subtle);
    }

    .markdown-body img {
      max-width: 100%;
      height: auto;
    }

    .markdown-body hr {
      height: 0.25em;
      margin: 24px 0;
      border: 0;
      background: var(--border-muted);
    }

    .markdown-body details summary {
      cursor: pointer;
      font-weight: 600;
    }

    .markdown-body input[type="checkbox"] {
      margin-right: 0.5em;
    }

    .markdown-body svg {
      max-width: 100%;
    }

    .empty {
      margin: 20px;
      border: 1px dashed var(--border);
      border-radius: 10px;
      padding: 28px 20px;
      background: var(--bg-subtle);
      text-align: center;
    }

    .empty h3 {
      margin: 0 0 6px;
      font-size: 15px;
    }

    .empty p {
      margin: 0 0 10px;
      color: var(--fg-muted);
      font-size: 13px;
    }

    .empty a {
      font-size: 13px;
      font-weight: 600;
    }

    .footer {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 8px;
      margin-top: 18px;
      color: var(--fg-subtle);
      font-size: 12px;
    }

    @media (max-width: 640px) {
      .shell {
        padding: 16px;
      }

      .repo-header {
        gap: 12px;
      }

      .avatar {
        width: 44px;
        height: 44px;
        border-radius: 10px;
      }

      .stats {
        grid-template-columns: 1fr;
      }

      .readme-body {
        padding: 16px;
      }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header class="repo-header">
      <img class="avatar" src="${escapeHtml(repo.owner.avatar_url)}" alt="" width="56" height="56" decoding="async" />
      <div class="repo-heading">
        <p class="kicker">GitHub repository</p>
        <h1><a href="${repoUrl}" target="_blank" rel="noreferrer noopener">${fullName}</a></h1>
        ${
					description
						? `<p class="description">${escapeHtml(description)}</p>`
						: ""
				}
        <div class="badges">
          <span class="badge">${escapeHtml(visibility)}</span>
          ${repo.archived ? '<span class="badge badge-warning">Archived</span>' : ""}
        </div>
        <div class="actions">
          <a class="button button-primary" href="${repoUrl}" target="_blank" rel="noreferrer noopener">View on GitHub</a>
          ${
						homepageUrl
							? `<a class="button" href="${homepageUrl}" target="_blank" rel="noreferrer noopener">Homepage</a>`
							: ""
					}
        </div>
      </div>
    </header>

    <div class="stats">
      <div class="stat"><strong>${formatCount(repo.stargazers_count)}</strong><span>Stars</span></div>
      <div class="stat"><strong>${formatCount(repo.forks_count)}</strong><span>Forks</span></div>
      <div class="stat"><strong>${formatCount(repo.open_issues_count)}</strong><span>Open issues</span></div>
    </div>

    <div class="meta">${metaItems.join("")}</div>
    ${topicsSection}

    <section class="readme">
      <div class="readme-header">
        <h2>README</h2>
        <a href="${repoUrl}#readme" target="_blank" rel="noreferrer noopener">Open on GitHub</a>
      </div>
      ${readmeSection}
    </section>

    <footer class="footer">
      <span>Rendered from the GitHub REST API.</span>
      <a href="${repoUrl}" target="_blank" rel="noreferrer noopener">${fullName} on GitHub</a>
    </footer>
  </main>
</body>
</html>`;
};
