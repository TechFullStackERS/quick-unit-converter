const KEY_THEME = "theme";

const lastThemeUsed = localStorage.getItem(KEY_THEME);
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

document.documentElement.setAttribute("data-theme", lastThemeUsed ?? systemTheme);

const updateTransitionTime = () => document.querySelector(":root").style.setProperty("--transition-time", "0.3s");

const switchTheme = () => {
	const rootElement = document.documentElement;
	const currentTheme = rootElement.getAttribute("data-theme");
	const newTheme = currentTheme === "light" ? "dark" : "light";
	updateTransitionTime();

	rootElement.setAttribute("data-theme", newTheme);
	localStorage.setItem(KEY_THEME, newTheme);
};

document.querySelector("#mode-switcher").addEventListener("click", switchTheme);
