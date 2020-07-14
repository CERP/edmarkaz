import React, { useMemo } from 'react'
import {
	AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Area
} from 'recharts'

import moment from 'moment'

interface P {
	video_events: VideoEvents
}

type GraphData = {
	day: number
	watch_count: number
	watch_time: number
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const LessonActivityGraph: React.FC<P> = ({ video_events }) => {

	const compute_lessons_data = useMemo(
		() => computeGraphData(video_events),
		[video_events]
	)

	const graph_data = getGraphData(compute_lessons_data)
	const max_lesson_watch_time = getMaxLessonWatchTime(graph_data)

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
					<XAxis dataKey="day" label={{ value: "Days ⟶", position: "bottom", offset: 0, fill: "#1BB4BB" }} />
					<YAxis type="number" domain={[0, max_lesson_watch_time]} allowDecimals={false} >
						<Label value="Time(m) ⟶" fill="#1BB4BB" offset={-15} position="left" angle={-90} />
					</YAxis>
					<CartesianGrid vertical={false} />
					<Tooltip content={PointLabel} />
					<Area type="monotone" strokeWidth={3} stroke="#0b969c" dataKey="watch_time"
						activeDot={{ fill: '#0b969c', stroke: '#fff', strokeWidth: 3, r: 8 }}
						dot={{ fill: '#0b969c', stroke: '#fff', strokeWidth: 2, r: 6 }} fillOpacity={1} fill="url(#colorUv)" />
				</AreaChart>
			</ResponsiveContainer>
		</div>
	)
}

export default LessonActivityGraph


type ReduceEventsData = {
	[day: number]: {
		[lesson_id: string]: {
			watch_count: number
			watch_time: number
		}
	}
}

function computeGraphData(events: VideoEvents) {

	// for any whole week
	let watch_activity: ReduceEventsData = { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {} }

	const date_before_week = moment().subtract(6, "days").unix() * 1000
	const date_for_today = moment.now()

	for (const [, event] of Object.entries(events)) {
		for (const [timestamp, meta] of Object.entries(event)) {

			const { lesson_id, time } = meta
			const lesson_watch_date = parseInt(timestamp)

			if (lesson_watch_date >= date_before_week && lesson_watch_date <= date_for_today) {

				const day_num = moment(lesson_watch_date).day()
				const day = day_num === 0 ? 7 : day_num

				if (watch_activity[day]) {
					if (watch_activity[day][lesson_id]) {
						watch_activity[day][lesson_id] = {
							watch_count: watch_activity[day][lesson_id].watch_count + 1,
							watch_time: watch_activity[day][lesson_id].watch_time + time,
						}
					} else {
						watch_activity[day][lesson_id] = {
							watch_count: 1,
							watch_time: time,
						}
					}
				}
			}
		}
	}

	return watch_activity
}

interface PointLabelProps {
	payload: { payload: GraphData }[]
	active: boolean
}

const getGraphData = (viewed_lesson_data: ReduceEventsData) => {
	return Object.entries(viewed_lesson_data)
		.reduce<GraphData[]>((agg, [day_num, watch_stats]) => {

			let counter = { watch_count: 0, watch_time: 0 }

			for (const item of Object.values(watch_stats)) {
				counter.watch_count += item.watch_count
				counter.watch_time += item.watch_time
			}

			return [
				...agg,
				{
					day: parseInt(day_num),
					...counter,
					watch_time: Math.floor(counter.watch_time / 60)
				}
			]
		}, [])
}

const getMaxLessonWatchTime = (data: GraphData[]) => {
	const most_watch_lesson = [...data].sort((a, b) => b.watch_time - a.watch_time)[0]
	return most_watch_lesson ? most_watch_lesson.watch_time : 1
}

const PointLabel: React.FC<PointLabelProps> = ({ payload, active }): any => {

	if (active && payload[0]) {
		const item = payload[0].payload
		return <div className="custom-tooltip">
			<div className="row" style={{ width: "100%" }}>
				<label>Day:</label>
				<div>{days[item.day - 1]}</div>
			</div>
			<div className="row" style={{ width: "100%" }}>
				<label>Views:</label>
				<div>{item.watch_count}</div>
			</div>
			<div className="row" style={{ width: "100%" }}>
				<label>Watch Time:</label>
				<div>{item.watch_time}m</div>
			</div>
		</div>
	}
}