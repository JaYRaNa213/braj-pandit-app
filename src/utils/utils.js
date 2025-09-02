export const getFirstImageUrlFromMarkdown = (markdown) => {
	var imgPattern = /!\[.*?\]\((.*?)\)/;
	var match = markdown.match(imgPattern);
	if (match && match.length > 1) {
		return match[1]; // The URL is captured in the first capturing group
	} else {
		return null;
	}
};
