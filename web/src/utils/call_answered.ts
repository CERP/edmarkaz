
export default function callAnswered(event : CallEndEvent) : boolean {

		return event.meta && (event.meta.call_status.toLowerCase().includes("answer") || parseInt(event.meta.duration) > 45 )

}