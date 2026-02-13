export function announcementMarkdownToPlainText(value?: string | null) {
	if (!value) return "";
	return value
		.replace(/```[\s\S]*?```/g, "")
		.replace(/`([^`\n]+)`/g, "$1")
		.replace(/\[([^\]]+)\]\((?:https?:\/\/|mailto:)[^)]+\)/g, "$1")
		.replace(/\*\*([^*\n]+)\*\*/g, "$1")
		.replace(/\*([^*\n]+)\*/g, "$1")
		.replace(/~~([^~\n]+)~~/g, "$1")
		.replace(/^#{1,3}\s+/gm, "")
		.replace(/^>\s?/gm, "")
		.replace(/^\s*[-*]\s+/gm, "")
		.replace(/^\s*\d+\.\s+/gm, "")
		.trim();
}
