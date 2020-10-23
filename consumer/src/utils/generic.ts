const toTitleCase = (text: string, split_by?: string) => {
	if (text == null || text === "") {
		return ""
	}
	return text.trim()
		.toLowerCase()
		.split(split_by || ' ')
		.map((s) => s.charAt(0).toUpperCase() + s.substring(1))
		.join(split_by || ' ')
}


// return false if every field is not blank
// return an array of labels that are blank
const checkCompulsoryFields = (obj: any, fields: string[]): boolean | string[] => {

	const filteredList = fields.filter(field => field in obj && obj[field].trim() === "")
	return filteredList.length === 0 ? false : filteredList
}

export { toTitleCase, checkCompulsoryFields }