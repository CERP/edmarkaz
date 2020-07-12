import React from 'react'
import {
	AreaChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Area
} from 'recharts'

interface P {
	video_events: VideoEvents
}

type GraphData = {
	day: string
	studentCount: number
}

const data: any = [
	{
		day: '1', studentCount: 10
	},
	{
		day: '2', studentCount: 15
	},
	{
		day: '3', studentCount: 20
	},
	{
		day: '4', studentCount: 10
	},
	{
		day: '5', studentCount: 60
	},
	{
		day: '6', studentCount: 30
	},
	{
		day: '7', studentCount: 78
	}
]

const LessonActivityGraph: React.FC<P> = () => {

	return (
		<div style={{ fontSize: "0.95rem" }}>
			<ResponsiveContainer width={"100%"} height={280} >
				<AreaChart width={730} height={250} data={data}
					margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
					<defs>
						<linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#1BB4BB" stopOpacity={0.8} />
						</linearGradient>
					</defs>
					<XAxis dataKey="day" label={{ value: "Days ⟶", position: "bottom", offset: 0, fill: "#1BB4BB" }} />
					<YAxis type="number">
						<Label value="Time(m) ⟶" fill="#1BB4BB" offset={-15} position="left" angle={-90} />
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

export default LessonActivityGraph


interface PointLabelProps {
	payload: { payload: GraphData }[]
	active: boolean
}

const PointLabel: React.FC<PointLabelProps> = ({ payload, active }): any => {

	if (active && payload[0]) {
		const item = payload[0].payload
		return <div className="dashboard-graphs custom-tooltip">
			<div className="row" style={{ width: "100%" }}>
				<label>Day:</label>
				<div>{item.day}</div>
			</div>
			<div className="row" style={{ width: "100%" }}>
				<label>Loggen in Students:</label>
				<div>{item.studentCount}</div>
			</div>
		</div>
	}
}