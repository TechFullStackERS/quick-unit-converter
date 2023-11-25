const input = document.getElementById("input");

document.getElementById("input-container").addEventListener("click", () => input.focus());

document.addEventListener("keypress", e => {
	if (document.activeElement === input) return;

	if (e.key === "/" || e.key === "?") {
		e.preventDefault();
		input.focus();
	}
});
