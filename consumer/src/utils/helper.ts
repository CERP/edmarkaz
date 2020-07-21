/**
 * description: takes time in seconds and return string in format
 *              like "1:01" or "4:03:59" or "123:03:59"
 * @param time
*/

export const getTimeString = (time: number): string => {

	// using tilde(~) instead of Math.floor()

	const hrs = ~~(time / 3600)
	const mins = ~~((time % 3600) / 60)
	const secs = ~~time % 60

	let ret = ""
	if (hrs > 0) {
		ret = "" + hrs + "h:" + (mins < 10 ? "0" : "")
	}
	ret += "" + mins + "m:" + (secs < 10 ? "0" : "")
	ret += "" + secs + "s"

	return ret
}