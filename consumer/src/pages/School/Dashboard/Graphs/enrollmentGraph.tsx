import React, { useMemo, useState } from 'react'
import moment from 'moment'
import {
	AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label
} from 'recharts'

interface P {
	events: SignupEvents
	graph_data?: GraphData[]
}

type GraphData = {
	date: number
	student_count: number
}

const EnrollmentGraph: React.FC<P> = ({ events }) => {

	const current_date = moment.now()
	const [dateFilter, setDateFilter] = useState(current_date)

	const graph_data = useMemo(
		() => computeGraphData(events, dateFilter),
		[events, dateFilter]
	)

	const sorted_graph_data = getSortedGraphData(graph_data)
	const max_students_enrolled = getMaxEnrolledStudents(sorted_graph_data)

	const handleDateChange = (input_date: string) => {
		const date = moment(input_date, "YYYY-MM-DD").unix() * 1000
		setDateFilter(date)
	}

	return (
		<div style={{ fontSize: "0.95rem" }}>
			<div className="filter-container calender">
				<input type="date"
					onChange={(e) => handleDateChange(e.target.value)}
					defaultValue={moment(dateFilter).format("YYYY-MM-DD")}
					max={moment(current_date).format("YYYY-MM-DD")} />
			</div>
			<ResponsiveContainer width={"100%"} height={280} >
				<AreaChart width={730} height={250} data={sorted_graph_data}
					margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
					<defs>
						<linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#1BB4BB" stopOpacity={0.8} />
						</linearGradient>
					</defs>
					<XAxis dataKey="date" label={{ value: "Date ⟶", position: "bottom", offset: 0, fill: "#1BB4BB" }} />
					<YAxis type="number" domain={[0, max_students_enrolled]} allowDecimals={false}>
						<Label value="No. of students ⟶" fill="#1BB4BB" offset={-15} position="left" angle={-90} />
					</YAxis>
					<CartesianGrid vertical={false} />
					<Tooltip content={PointLabel} />
					<Area type="monotone" strokeWidth={3} stroke="#0b969c" dataKey="student_count"
						activeDot={{ fill: '#0b969c', stroke: '#fff', strokeWidth: 3, r: 8 }}
						dot={{ fill: '#0b969c', stroke: '#fff', strokeWidth: 2, r: 6 }} fillOpacity={1} fill="url(#colorUv)" />
				</AreaChart>
			</ResponsiveContainer>
		</div>
	)
}

export default EnrollmentGraph

const computeGraphData = (events: SignupEvents, date_filter: number) => {

	let signup_activity: { [date: number]: number } = {}

	for (const [, timestamp] of Object.entries(events)) {

		//@ts-ignore
		const is_current_month = moment(parseInt(timestamp)).isSame(moment(date_filter), "month")

		if (is_current_month) {

			const date = moment(timestamp).date()

			if (signup_activity[date]) {
				signup_activity = {
					...signup_activity,
					[date]: signup_activity[date] + 1
				}
			} else {
				signup_activity = {
					...signup_activity,
					[date]: 1
				}
			}
		}
	}

	return Object.entries(signup_activity)
		.reduce<GraphData[]>((agg, curr) => {
			const [date, count] = curr
			return [
				...agg,
				{
					"date": parseInt(date),
					"student_count": count
				}
			]
		}, [])
}

const getSortedGraphData = (data: GraphData[]) => {
	return [...data].sort((a, b) => a.date - b.date)
}

const getMaxEnrolledStudents = (data: GraphData[]): number => {

	if (data.length === 0) {
		return 0
	}
	// pick last elemented from sorted data
	return data[data.length - 1].student_count
}

interface PointLabelProps {
	payload: { payload: GraphData }[]
	active: boolean
}

const PointLabel: React.FC<PointLabelProps> = ({ payload, active }): any => {

	if (active && payload && payload[0]) {
		const item = payload[0].payload
		return <div className="custom-tooltip">
			<div className="row" style={{ width: "100%" }}>
				<label>Date:</label>
				<div>{item.date}</div>
			</div>
			<div className="row" style={{ width: "100%" }}>
				<label>Enrolled Students:</label>
				<div>{item.student_count}</div>
			</div>
		</div>
	}
}