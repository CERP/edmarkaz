import React, { useMemo } from 'react'
import moment from 'moment'
import {
	AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label
} from 'recharts'

interface P {
	events: SignupEvents
	graph_data?: GraphData[]
}

type GraphData = {
	day: string
	student_count: number
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const EnrollmentGraph: React.FC<P> = ({ events }) => {

	const graph_data = useMemo(
		() => computeGraphData(events),
		[events]
	)

	return (
		<div style={{ fontSize: "0.95rem" }}>
			<ResponsiveContainer width={"100%"} height={280} >
				<AreaChart width={730} height={250} data={graph_data}
					margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
					<defs>
						<linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#1BB4BB" stopOpacity={0.8} />
						</linearGradient>
					</defs>
					<XAxis dataKey="day" label={{ value: "Date ⟶", position: "bottom", offset: 0, fill: "#1BB4BB" }} />
					<YAxis type="number">
						<Label value="No. of students ⟶" fill="#1BB4BB" offset={-15} position="left" angle={-90} />
					</YAxis>
					<CartesianGrid vertical={false} />
					<Tooltip content={PointLabel} />
					<Area type="monotone" strokeWidth={3} stroke="#0b969c" dataKey="studentCount"
						activeDot={{ fill: '#0b969c', stroke: '#fff', strokeWidth: 3, r: 8 }}
						dot={{ fill: '#0b969c', stroke: '#fff', strokeWidth: 2, r: 6 }} fillOpacity={1} fill="url(#colorUv)" />
				</AreaChart>
			</ResponsiveContainer>
		</div>
	)
}

export default EnrollmentGraph

const computeGraphData = (events: SignupEvents) => {

	let signup_count: { [day: string]: number } = {}

	for (const [_, timestamp] of Object.entries(events)) {

		const day = moment(timestamp).date().toString()

		if (signup_count[day]) {
			signup_count = {
				...signup_count,
				[day]: signup_count[day] + 1
			}
		} else {
			signup_count = {
				...signup_count,
				[day]: 1
			}
		}
	}

	return Object.entries(signup_count)
		.reduce<GraphData[]>((agg, curr) => {
			const [day, count] = curr
			return [
				...agg,
				{
					"day": day,
					"student_count": count
				}
			]
		}, [])
}

interface PointLabelProps {
	payload: { payload: GraphData }[]
	active: boolean
}

const PointLabel: React.FC<PointLabelProps> = ({ payload, active }): any => {

	if (active && payload && payload[0]) {
		const item = payload[0].payload
		return <div className="dashboard-graphs custom-tooltip">
			<div className="row" style={{ width: "100%" }}>
				<label>Day:</label>
				<div>{item.day}</div>
			</div>
			<div className="row" style={{ width: "100%" }}>
				<label>Enrolled Students:</label>
				<div>{item.student_count}</div>
			</div>
		</div>
	}
}