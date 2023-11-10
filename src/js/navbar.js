let getLocalTheme = localStorage.getItem("theme");
themeToSet = getLocalTheme;

if (!getLocalTheme) {
	themeToSet = window.matchMedia("(prefers-color-theme: dark)").matches ? "dark" : "light";
}

document.documentElement.setAttribute("data-theme", themeToSet);

const switchTheme = () => {
	const rootElem = document.documentElement;
	let dataTheme = rootElem.getAttribute("data-theme"),
		newTheme;

	newTheme = dataTheme === "light" ? "dark" : "light";

	rootElem.setAttribute("data-theme", newTheme);

	localStorage.setItem("theme", newTheme);
};

document.querySelector("#mode-switcher").addEventListener("click", switchTheme);
