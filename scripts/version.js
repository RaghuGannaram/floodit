async function loadVersion() {
	const versionEl = document.getElementById("version");

	try {
		const response = await fetch("./metadata.json?t=" + Date.now());
		const meta = await response.json();

		versionEl.innerHTML = `<span>v${meta.version}</span>`;

		versionEl.setAttribute("data-date", meta.date);
		versionEl.setAttribute("data-hash", meta.hash);
		versionEl.setAttribute("title", `Build: ${meta.hash} (${meta.date})`);

		console.log(
			`%c 🚀 App Version: ${meta.version} \n%c 📦 Build: ${meta.hash} \n 📅 Date: ${meta.date}`,
			"font-weight: bold; font-size: 14px; color: #4db8ff;",
			"color: #888;"
		);
	} catch (error) {
		console.error("version load failed:", error);
		versionEl.innerText = "v1.0.0";
	}
}

loadVersion();
