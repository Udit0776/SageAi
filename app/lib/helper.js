export function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length >= 2) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${months[monthIndex]} ${year}`;
    }
  }
  return dateStr;
}

export function entriesToMarkdown(entries, type) {
  if (!entries?.length) return "";

  return (
    `## ${type}\n\n` +
    entries
      .map((entry) => {
        const org = entry.organization || entry.company || entry.school || "";
        const title = entry.title || entry.degree || "";
        
        const start = formatDisplayDate(entry.startDate);
        const end = entry.current ? "Present" : formatDisplayDate(entry.endDate);
        const dateRange = `${start} - ${end}`;

        return `### ${title}${org ? ` | ${org}` : ""} <span style="float: right; font-weight: normal; font-size: 0.85em; color: #555; font-family: sans-serif;">${dateRange}</span>\n\n${entry.description}`;
      })
      .join("\n\n")
  );
}
