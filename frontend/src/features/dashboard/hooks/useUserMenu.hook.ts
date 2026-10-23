import type { AuthUser } from "@/features/auth/types";
import { getInitials } from "@/utils/utils";
import { useEffect, useRef, useState } from "react";

const ROLE_LABELS: Record<string, string> = {
	ADMIN: "Administrator",
	REVIEWER: "Reviewer",
	STUDENT: "Student",
};

export const useUserMenu = (user: AuthUser) => {
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const isAdmin = user.role === "ADMIN";
	const isReviewer = user.role === "REVIEWER";
	const roleLabel = ROLE_LABELS[user.role] ?? user.role;
	const initials = getInitials(user.name, user.email);

	useEffect(() => {
		if (!open) return;

		const handlePointerDown = (event: PointerEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setOpen(false);
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setOpen(false);
		};

		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [open]);

	const toggle = () => setOpen((previous) => !previous);
	const close = () => setOpen(false);

	return {
		open,
		toggle,
		close,
		containerRef,
		isAdmin,
		isReviewer,
		roleLabel,
		initials,
	};
};
