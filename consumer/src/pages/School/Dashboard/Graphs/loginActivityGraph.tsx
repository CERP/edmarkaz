import React, { useMemo, useState } from 'react'
import {
	AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Area
} from 'recharts'

import moment from 'moment'

interface P {
	video_events: VideoEvents
	assessment_events: AssessmentEvents
	graph_data?: GraphData[]
}

type GraphData = {
	date: number
	timestamp: number
	logins_count: number
}

const LoginActivityGraph: React.FC<P> = ({ video_events, assessment_events }) => {

	const current_date = moment.now()
	const [dateFilter, setDateFilter] = useState(current_date)

	const graph_data = useMemo(
		() => computeGraphData(video_events, assessment_events, dateFilter),
		[video_events, assessment_events, dateFilter]
	)

	const sorted_graph_data = getSortedGraphData(graph_data)
	const max_logins_count = getMaxActivityCount(sorted_graph_data)

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
			<div className="scroll-wrapper">
				<ResponsiveContainer width={"100%"} height={280} >
					<AreaChart width={730} height={250} data={sorted_graph_data}
						margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
						<defs>
							<linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#1BB4BB" stopOpacity={0.8} />
							</linearGradient>
						</defs>
						<XAxis dataKey="date" label={{ value: "Date ⟶", position: "bottom", offset: 0, fill: "#1BB4BB" }} />
						<YAxis type="number" domain={[0, max_logins_count]} allowDecimals={false}>
							<Label value="Students Login ⟶" fill="#1BB4BB" offset={-15} position="left" angle={-90} />
						</YAxis>
						<CartesianGrid vertical={false} />
						<Tooltip content={PointLabel} />
						<Area type="monotone" strokeWidth={3} stroke="#0b969c" dataKey="logins_count"
							activeDot={{ fill: '#0b969c', stroke: '#fff', strokeWidth: 3, r: 8 }}
							dot={{ fill: '#0b969c', stroke: '#fff', strokeWidth: 2, r: 6 }} fillOpacity={1} fill="url(#colorUv)" />
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	)
}

export default LoginActivityGraph

const computeGraphData = (video_events: VideoEvents, assessment_events: AssessmentEvents, date_filter: number) => {

	let login_activity: { [date: number]: { clients: string[]; timestamp: number } } = {}

	const merge_activities = [...Object.entries(video_events), ...Object.entries(assessment_events)]

	for (const [client_id, event] of merge_activities) {
		for (const [timestamp,] of Object.entries(event)) {

			const is_current_month = moment(parseInt(timestamp)).isSame(moment(date_filter), "month")

			if (is_current_month) {

				const date = moment(parseInt(timestamp)).date()

				if (login_activity[date]) {
					login_activity = {
						...login_activity,
						[date]: {
							...login_activity[date],
							clients: [...login_activity[date].clients, client_id]
						}
					}
				} else {
					login_activity = {
						...login_activity,
						[date]: {
							//@ts-ignore
							timestamp: parseInt(timestamp),
							clients: [client_id]
						}
					}
				}
			}
		}
	}

	return Object.entries(login_activity)
		.reduce<GraphData[]>((agg, [date, item]) => {

			const unique_clients_count = new Set(item.clients).size

			return [
				...agg,
				{
					"date": parseInt(date),
					"logins_count": unique_clients_count,
					"timestamp": item.timestamp
				}
			]
		}, [])
}

const getSortedGraphData = (data: GraphData[]) => {
	return [...data].sort((a, b) => a.date - b.date)
}

const getMaxActivityCount = (data: GraphData[]) => {
	if (data.length === 0) {
		return 0
	}
	// pick last elemented from sorted data
	return data[data.length - 1].logins_count
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
				<div>{moment(item.timestamp).format("MM/DD/YYYY")}</div>
			</div>
			<div className="row" style={{ width: "100%" }}>
				<label>No. of logins:</label>
				<div>{item.logins_count}</div>
			</div>
		</div>
	}
}