

export const getDeviceOS = () => {
	if (navigator.platform.indexOf("iPhone") != -1) {
		return "iOS"
	}
	if (navigator.platform.indexOf("Android") != -1) {
		return "Android"
	}
	return "Unknown"
}