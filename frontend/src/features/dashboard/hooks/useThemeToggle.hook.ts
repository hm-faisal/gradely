import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const useThemeToggle = () => {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	const isDark = mounted && resolvedTheme === "dark";
	const label = isDark ? "Switch to light theme" : "Switch to dark theme";
	const toggle = () => setTheme(isDark ? "light" : "dark");

	return { isDark, label, toggle };
};
