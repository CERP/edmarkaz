export const getColorsFromChapter = (chapter: string | undefined) => {

	if (chapter === undefined) {
		return "#1BB4BB"
	}

	const length = chapter.length

	if (length < 10) {
		return "#ffc107"
	}
	else if (length < 20) {
		return "#FE7C56"
	}
	else if (length < 30) {
		return "#8BC349"
	}
	else if (length < 40) {
		return "#42A5F5"
	}
	else if (length < 50) {
		return "#C588CE";
	}
	return "rgb(155, 155, 155)"
}