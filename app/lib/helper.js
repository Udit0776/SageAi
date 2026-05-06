export function entriesToMarkdown(entries, type) {
  if (!entries?.length) return "";

  return (
    `## ${type}\n\n` +
    entries
      .map((entry) => {
        const org = entry.organization || entry.company || entry.school || "";
        const title = entry.title || entry.degree || "";
        const dateRange = entry.current
          ? `${entry.startDate} - Present`
          : `${entry.startDate} - ${entry.endDate}`;

        return `### ${title}${org ? ` @ ${org}` : ""}\n${dateRange}\n\n${entry.description}`;
      })
      .join("\n\n")
  );
}
