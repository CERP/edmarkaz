

const compareObjects = <T>(prev_obj: T, new_obj: T): Partial<T> => {

	// This function will return a partial of the input type
	// i.e take two objects and return an object with the
	// values that new_obj has but prev_obj doesn't

	const changes = Object.entries(new_obj)
		.reduce((agg, [key, val]) => {
			//@ts-ignore
			if (prev_obj[key] === undefined || val !== prev_obj[key]) {
				return {
					...agg,
					[key]: val
				}
			}
			return agg
		}, {})

	return changes
}

export default compareObjects