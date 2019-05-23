
const getUserType = (username: string) => {

	let user_type : USER_TYPE

	switch (username) {
		case "alif-laila":
			user_type = "ESS"
			break;
		case "finca":
			user_type = "FINANCE"
			break;
		case "edkasa":
			user_type = "ESS"
			break;
		case "mischool2":
			user_type = "ESS"
			break;
		case "radec": 
			user_type = "ESS"
			break;
		case "telenor":
			user_type = "FINANCE"
			break;
		case "jsbank":
			user_type = "FINANCE"
			break;
		case "sabaq":
			user_type = "ESS"
			break;
		case "kashf":
			user_type = "FINANCE"
			break;
		default:
			user_type = "ESS"
			break;
	}

	return user_type;
}

export default getUserType