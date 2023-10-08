document.querySelectorAll(".result-timestamp").forEach((row) => {
    const timestamp = Number(row.textContent);
    const date = new Date(timestamp * 1000);
    row.textContent = `${date.toLocaleDateString()} ${date.toLocaleTimeString(
        undefined,
        { hour12: false },
    )}`;
});
