export const validation = (phone_number: string, password: string) => {
	if (!phone_number) {
		alert("Phone Number is required")
	}

	if (!phone_number.startsWith("03")) {
		return alert("phone number must start with 03")
	}

	if (phone_number.length > 11 || phone_number.length < 11) {
		return alert("please enter a valid number")
	}

	if (!password) {
		alert("Password is required")
	}
}