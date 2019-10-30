import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import Former from '~/src/utils/former'
import moment from 'moment'
import { downloadCSV } from '~src/utils/downloadCSV';
import getUserType from '~src/utils/getUserType';

type propTypes = {
	sync_state: RootBankState["sync_state"];
	school_db: RootBankState["new_school_db"];
	username: string;
} & RouteComponentProps

interface stateType {
	filters: {
		survey: "" | MarkCompleteSurvey["event"] | CallEndSurvey["event"] | CallEndSurveyFollowUp["event"];
		status: "" | SchoolMatch["status"];
		startDate: number;
		endDate: number;
	};
}

class Survey extends React.Component <propTypes, stateType> {
	
	former: Former
	constructor(props: propTypes) {
		super(props)

		this.state = {
			filters: {
				survey: "",
				status: "",
				startDate: moment().subtract(2, "week").unix() * 1000,
				endDate: moment.now()
			}
			
		}
		this.former = new Former(this, ["filters"])
	}
	
	downloadCsv = (items: [string, SchoolMatch][]) => {

		const { school_db , username} = this.props
		const userType = getUserType(username)
		const header = [
			"Date",
			"School",
			"Person",
			"Event",
			"Customer_Interest",
			"Follow_Up_Meeting_Occured",
			"In_Person_Meeting_Scheduled",
			"Not_Interseted_Reason",
			"Reason_Completed",
			"Notes"
		]
		
		const data = [header]
		
		items.forEach(([id, matches]) => {
				const curr_school = school_db[id]

				Object.entries(matches.history || {})
					.filter(([timestamp, h]) => ( h.time >= this.state.filters.startDate && h.time <= this.state.filters.endDate ) && (this.state.filters.survey ? this.state.filters.survey === h.event : h.event === "MARK_COMPLETE_SURVEY" || "CALL_END_SURVEY_FOLLOWUP" || "CALL_END_SURVEY"))
					.forEach(([timestamp, h]) => {

						const elem = [
							`${moment(h.time).format("MM-DD-YYYY")}`,
							`${curr_school.school_name}`,
							`${h.user.name ? h.user.name : "-"}`,
							`${h.event}`,
							`${h.event === "CALL_END_SURVEY" ? h.meta.customer_interest: "-"}`,
							`${h.event === "CALL_END_SURVEY_FOLLOWUP" ? h.meta.follow_up_meeting_ocurred : "-"}`,
							`${h.event === "CALL_END_SURVEY_FOLLOWUP" ? h.meta.call_in_person_meeting_scheduled : "-"}`,
							`${h.event === "CALL_END_SURVEY_FOLLOWUP" ? userType === "ESS" ? h.meta.call_not_interested_reason_ess : h.meta.call_not_interested_reason_finance : "-"}`,
							`${h.event === "MARK_COMPLETE_SURVEY" ? h.meta.reason_completed : "-"}`,
							`${h.event === 'CALL_END_SURVEY' ? h.meta.other_notes : "-"}`
						]
						data.push(elem)
					})
			})

		downloadCSV(data,"survey")
	}
	
	render() {

		const { sync_state, school_db, username} = this.props

		const userType = getUserType(username)

		const items = Object.entries(sync_state.matches)
			.filter(([id, matches]) => this.state.filters.status ? this.state.filters.status === matches.status : true )
		
		return	<div className="survey info">


			<div style={{width: "75%", display:"flex", justifyContent:"flex-end"}}>
				<div className="button blue" onClick={() => this.downloadCsv(items)}> Download Csv</div>
			</div>


			<div className="divider">Survey</div>

			<div className="form section" style={{width: "75%"}}>
				<div className="row">
					<label>Start Date</label>
					<input type="date" onChange={this.former.handle(["startDate"])} value={moment(this.state.filters.startDate).format("YYYY-MM-DD")}/>
				</div>
				<div className="row">
					<label>End Date</label>
					<input type="date" onChange={this.former.handle(["endDate"])} value={moment(this.state.filters.endDate).format("YYYY-MM-DD")}/>
				</div>
				<div className="row">
					<label>Survey</label>
					<select {...this.former.super_handle(["survey"])}>
						<option value=""> All </option>
						<option value="MARK_COMPLETE_SURVEY"> Mark Complete</option>
						<option value="CALL_END_SURVEY"> Call End</option>
						<option value="CALL_END_SURVEY_FOLLOWUP"> Call End Follow Up</option>
					</select>
				</div>
				<div className="row" style={{border:"none"}}>
					<label>Status</label>
					<select {...this.former.super_handle(["status"])}>
						<option value=""> All </option>
						<option value="NEW"> New</option>
						<option value="IN_PROGRESS"> In Progress</option>
						<option value="REJECTED"> Rejected</option>
						<option value="DONE">Done</option>
					</select>
				</div>
			</div>

			<div className="section" style={{width:"75%", overflow: "auto"}}>
				<div className="newtable">
					<div className="newtable-row heading" style={{fontWeight:"bold"}}>
						<div>Date</div>
						<div>School</div>
						<div>Person</div>
						<div>Event </div>
						<div>Cutomer Interest</div>
						<div>Follow Up Meeting Occured </div>
						<div>In Person Meeting Scheduled</div>
						<div>Not Interested Reason</div>
						<div>Reason Completed</div>
						<div>Notes</div>
					</div>
				{
					items.map(([id, matches]) => {
						const curr_school = school_db[id]

						return Object.entries(matches.history || {})
							.filter(([timestamp, h]) => ( h.time >= this.state.filters.startDate && h.time <= this.state.filters.endDate ) && (this.state.filters.survey ? this.state.filters.survey === h.event : h.event === "MARK_COMPLETE_SURVEY" || "CALL_END_SURVEY_FOLLOWUP" || "CALL_END_SURVEY" ))
							.map(([timestamp, h]) => {
								return <div className="newtable-row" key={timestamp}>
									<div>{moment(h.time).format("MM-DD-YYYY")}</div>
									<div>{curr_school.school_name}</div>
									<div>{h.user.name}</div>
									<div>{h.event}</div>
									<div>{ h.event === "CALL_END_SURVEY" ? h.meta.customer_interest: "-"}</div>
									<div>{ h.event === "CALL_END_SURVEY_FOLLOWUP" ? h.meta.follow_up_meeting_ocurred : "-"} </div>
									<div>{ h.event === "CALL_END_SURVEY_FOLLOWUP" ? h.meta.call_in_person_meeting_scheduled : "-"} </div>
									<div>{ h.event === "CALL_END_SURVEY_FOLLOWUP" ? userType === "ESS" ? h.meta.call_not_interested_reason_ess : h.meta.call_not_interested_reason_finance : "-"} </div>
									<div>{ h.event === "MARK_COMPLETE_SURVEY" ? h.meta.reason_completed : "-" } </div>
									<div>{ h.event === 'CALL_END_SURVEY' ? h.meta.other_notes : "-"}</div>
								</div>
							})
						})
				}
			</div>
			</div>
		</div>
		
	}
}

export default connect ((state: RootBankState ) => ({
	sync_state: state.sync_state,
	school_db: state.new_school_db,
	username: state.auth.id
}))(Survey)