import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux';
import { getLogs } from '../../actions';
import moment from 'moment';

interface P {
	logs: RootReducerState["logs"]
	getLogs: (start_date: number, end_date: number) => any
}

const Logs = ({ logs, getLogs }: P) => {

	useEffect(() => {
		// will only get Logs for last week
		const start_date = moment().subtract(1, "week").valueOf()
		const end_date = moment().add(1, "day").valueOf()

		getLogs(start_date, end_date)
	}, [])

	const getCallInfoString = (value: CallStartEvent | CallEndEvent): string => {

		if (value.event === "CALL_START" || value.event === "CALL_BACK") {
			return `User ${value.user.name} with number ${value.user.number || ""} started call `
		}

		else if (value.event === "CALL_END" || value.event === "CALL_BACK_END") {
			return value.meta ? value.meta.call_status === "ANSWER" ? `Call lasted for ${value.meta.duration} seconds` : `${value.meta.call_status}` : "Old CALL_END Event"
		}
		return ""
	}

	return <div className="logs page">
		<div className="title"> Logs</div>
		{logs.loading ? <div> Loading... </div> : <div className="section" style={{ width: "75%" }}>
			<div className="newtable">
				<div className="newtable-row heading">
					<div>Time/Date</div>
					<div>Supplier</div>
					<div>Type</div>
					<div>Info</div>
				</div>
				{
					Object.entries(logs.db)
						.sort(([key_a, val_a], [key_b, val_b]) => val_b.value.time - val_a.value.time)
						.map(([key, { id, value }]) => {
							return <div className="newtable-row" key={key}>
								<div> {moment(value.time).format("HH:mm:ss / DD-MM-YYYY")} </div>
								<div>{id}</div>
								<div>{value.event === "CALL_END" ? `${value.event}(${value.meta && value.meta.call_status})` : value.event}</div>
								<div> {getCallInfoString(value)} </div>
							</div>
						})
				}
			</div>
		</div>}
	</div>

}

export default connect((state: RootReducerState) => ({
	logs: state.logs
}), (dispatch: Function) => ({
	getLogs: (start_date: number, end_date: number) => dispatch(getLogs(start_date, end_date))
}))(Logs);