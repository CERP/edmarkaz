export const getIDFromYoutbeLink = (link: string) => {

	// eslint-disable-next-line
	const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	const match = link.match(regExp);

	if (match && match[2].length === 11) {
		return match[2]
	}

	return ""
}