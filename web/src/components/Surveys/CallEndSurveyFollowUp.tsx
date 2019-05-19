import React from 'react'
import Former from '~/src/utils/former'
import moment = require('moment');

interface P {
	saveSurvey: (survey: CallEndSurveyFollowUp['meta']) => void
	call_number: number
	user_type: USER_TYPE
}

export default class Survey extends React.Component<P, CallEndSurveyFollowUp['meta']> {

	former : Former

	constructor(props : P) {
		super(props);

		this.state = {
			follow_up_meeting_ocurred: "",
			follow_up_meeting_no_reason: "",
			follow_up_meeting_no_other: "",
			call_in_person_meeting_scheduled: "",
			call_in_person_meeting_no_reason: "",
			call_in_person_meeting_no_other: "", 
			call_not_interested_reason_ess:  "",
			call_not_interested_reason_finance: "",
			call_not_interested_reason_other: "", 
			call_not_interested_needs_time_followup: "",
			meeting_ess_purpose: "",
			meeting_ess_demo_followup: "",
			meeting_ess_transaction_sold: "",
			meeting_finance_transaction_loan: "",
			meeting_ess_transaction_fail_reason: "",
			meeting_finance_transaction_fail_reason: "",
			meeting_transaction_fail_reason_other: ""
		}

		this.former = new Former(this, [], [
			{
				path: ["follow_up_meeting_no_reason"],
				value: "",
				depends: [
					{
						path: ["follow_up_meeting_ocurred"],
						value: "NO"
					}
				]
			},
			{
				path: ["follow_up_meeting_no_other"],
				value: "",
				depends: [
					{
						path: ["follow_up_meeting_no_reason"],
						value: "OTHER"
					}
				]
			}
		])

	}

	render() {

		return <div className="modal">
			<div className="title" style={{ marginTop: 0 }}>Call Survey Follow Up</div>

			<div className="form" style={{ width: "90%" }}>

				<div className="row">
					<label>Did a follow-up meeting take place after your last interaction?</label>
					<select {...this.former.super_handle(["follow_up_meeting_ocurred"])}>
						<option value="">Please select option</option>
						<option value="YES_BY_CALL">Yes, there was a call</option>
						<option value="YES_BY_MEETING">Yes, there was an in-person meeting</option>
						<option value="NO">No</option>
					</select>
				</div>


				{
					this.former.check(["follow_up_meeting_no_reason"]) &&
					<div className="row">
						<label>Why didn't the planned follow-up occur?</label>
						<select {...this.former.super_handle(["follow_up_meeting_no_reason"])}>
							<option value="">Please select answer</option>
							<option value="SCHOOL_NOT_RESPOND">School did not respond</option>
							<option value="OTHER">Other reason</option>
						</select>
					</div>
				}

				{
					//this.state.follow_up_meeting_ocurred === "NO" && this.state.follow_up_meeting_no_reason === "OTHER" && 
					this.former.check(["follow_up_meeting_no_other"]) &&
					<div className="row">
						<label>Please specify why the follow-up didn't occur</label>
						<input type="text" {...this.former.super_handle(["follow_up_meeting_no_other"])} />
					</div>
				}

				{
					this.state.follow_up_meeting_ocurred === "YES_BY_CALL" && <CallSurvey former={this.former} user_type={this.props.user_type} state={this.state} />
				}

				{
					this.state.follow_up_meeting_ocurred === "YES_BY_MEETING" && <MeetingSurvey former={this.former} user_type={this.props.user_type} state={this.state} />
				}

				<div className="row">
					<div className="button blue" onClick={() => this.props.saveSurvey(this.state)}>Save</div>
				</div>
			</div>
		</div>
	}
}

const CallSurvey : React.SFC<{former: Former, user_type: USER_TYPE, state: CallEndSurveyFollowUp['meta']}> = ({ former, user_type, state}) => {

	return <React.Fragment>
		<div className="row">
			<label>Has an in-person meeting been scheduled?</label>
			<select {...former.super_handle(["call_in_person_meeting_scheduled"])}>
				<option value="">Please select an answer</option>
				<option value="YES">Yes</option>
				<option value="NO">No</option>
			</select>
		</div>

		{
			state.call_in_person_meeting_scheduled === "YES" && <div className="row">
				<label>When is your meeting scheduled?</label>
				<input type="date" 
					onChange={former.handle(["call_in_person_meeting_yes_time"])} 
					value={moment(state.call_in_person_meeting_yes_time).format("YYYY-MM-DD")} 
					placeholder="In-Person Meeting"/>

			</div>
		}

		{ 
			state.call_in_person_meeting_scheduled === "NO" && <div className="row">
				<label>Why hasn't an in-person meeting been scheduled?</label>
				<select {...former.super_handle(["call_in_person_meeting_no_reason"])}>
					<option value="">Please select an answer</option>
					<option value="SCHOOL_NO_LONGER_INTERESTED">The school is no longer interested</option>
					<option value="ANOTHER_CALL_SCHEDULED">Another phone-call has been scheduled</option>
					<option value="OTHER">Other Reason</option>
				</select>
			</div>
		}

		{
			state.call_in_person_meeting_no_reason === "OTHER" && <div className="row">
				<label>Please specify why an in-person meeting hasn't been scheduled</label>
				<input type="text" {...former.super_handle(["call_in_person_meeting_no_other"])} />
			</div>
		}

		{
			state.call_in_person_meeting_scheduled === "NO" && state.call_in_person_meeting_no_reason === "ANOTHER_CALL_SCHEDULED" && <div className="row">
				<label>When is your follow-up call scheduled?</label>
				<input type="date" 
					onChange={former.handle(["call_in_person_meeting_no_call_scheduled_time"])} 
					value={moment(state.call_in_person_meeting_no_call_scheduled_time).format("YYYY-MM-DD")} 
					placeholder="Follow-up Date"/>
			</div>
		}

		{
			state.call_in_person_meeting_scheduled === "NO" && state.call_in_person_meeting_no_reason === "SCHOOL_NO_LONGER_INTERESTED" && user_type === "ESS" && <div className="row">
				<label>Why is the school no longer interested?</label>
				<select {...former.super_handle(["call_not_interested_reason_ess"])}>
					<option value="">Please select answer</option>
					<option value="ALREADY_USING_SIMILAR">Already using a similar product</option>
					<option value="NO_NEED_FOR_PRODUCT">Does not have a need for the product</option>
					<option value="DONT_LIKE_PRODUCT">Does not like the product</option>
					<option value="PREFER_COMPETITOR">Prefer a competitors product</option>
					<option value="PRODUCT_TOO_EXPENSIVE">Product is too expensive</option>
					<option value="NEED_MORE_TIME">Needs more time to think about it</option>
					<option value="OTHER">Other reason</option>
				</select>
			</div>
		}

		{
			state.call_in_person_meeting_no_reason === "SCHOOL_NO_LONGER_INTERESTED" && user_type === "FINANCE" && <div className="row">
				<label>Why is the school no longer interested?</label>
				<select {...former.super_handle(["call_not_interested_reason_finance"])}>
					<option value="">Please select answer</option>
					<option value="OUTSTANDING_LOAN">Already has an outstanding loan</option>
					<option value="NO_LONGER_NEED_LOAN">Does not have a need for a loan anymore</option>
					<option value="PREFER_COMPETITOR">Prefer a competitors loan product</option>
					<option value="INTEREST_TOO_HIGH">Interest rate/service charge is too high</option>
					<option value="NEED_MORE_TIME">Needs more time to think about it</option>
					<option value="OTHER">Other reason</option>
				</select>
			</div>
		}

		{
			state.call_in_person_meeting_no_reason === "SCHOOL_NO_LONGER_INTERESTED" && (state.call_not_interested_reason_ess === "OTHER" || state.call_not_interested_reason_finance === "OTHER") && <div className="row">
				<label>Please specify why they are no longer interested</label>
				<input type="text" {...former.super_handle(["call_not_interested_reason_other"])} />
			</div>
		}

		{
			(state.call_not_interested_reason_finance === "NEED_MORE_TIME" || state.call_not_interested_reason_ess === "NEED_MORE_TIME") && <div className="row">
				<label>Will you be making a follow-up phone call or visit?</label>
				<select {...former.super_handle(["call_not_interested_needs_time_followup"])}>
					<option value="">Please select option</option>
					<option value="PHONE_CALL">Phone Call</option>
					<option value="MEETING">Visit</option>
					<option value="NO">Neither</option>
				</select>
			</div>
		}

		{

			(state.call_not_interested_reason_finance === "NEED_MORE_TIME" || state.call_not_interested_reason_ess === "NEED_MORE_TIME") && (state.call_not_interested_needs_time_followup === "PHONE_CALL" || state.call_not_interested_needs_time_followup === "VISIT") && <div className="row">
				<label>When will your follow up be?</label>
				<input type="date" 
					onChange={former.handle(["call_not_interested_follow_up_time"])} 
					value={moment(state.call_not_interested_follow_up_time).format("YYYY-MM-DD")} 
					placeholder="Follow-up Date"/>
			</div>
		}

	</React.Fragment>
}

const MeetingSurvey : React.SFC<{former: Former, user_type: USER_TYPE, state: CallEndSurveyFollowUp['meta']}> = ({ former, user_type, state}) => {
	return <React.Fragment>
		{
			user_type === "ESS" && <div className="row">
				<label>What was the purpose of the meeting?</label>
				<select {...former.super_handle(["meeting_ess_purpose"])}>
					<option value="">Please select answer</option>
					<option value="GIVE_PRODUCT_DEMO">Give product demo/trial</option>
					<option value="CONDUCT_TRANSACTION">Conduct transaction</option>
				</select>
			</div>
		}

		{
			user_type === "ESS" && state.meeting_ess_purpose === "GIVE_PRODUCT_DEMO" && <div className="row">
				<label>Will the follow up be a phone call or meeting?</label>
				<select {...former.super_handle(["meeting_ess_demo_followup"])}>
					<option value="">Please select answer</option>
					<option value="PHONE_CALL">Phone call</option>
					<option value="MEETING">Meeting</option>
					<option value="NO">Neither</option>
				</select>
			</div>
		}

		{
			user_type === "ESS" && state.meeting_ess_purpose === "GIVE_PRODUCT_DEMO" && (state.meeting_ess_demo_followup === "MEETING" || state.meeting_ess_demo_followup === "PHONE_CALL") && <div className="row">
				<label>When will the follow-up take place?</label>
				<input type="date" 
					onChange={former.handle(["meeting_ess_followup_date"])} 
					value={moment(state.meeting_ess_followup_date).format("YYYY-MM-DD")} 
					placeholder="Follow-up Date"/>
			</div>
		}

		{
			user_type === "ESS" && state.meeting_ess_purpose === "CONDUCT_TRANSACTION" && <div className="row">
				<label>Has the product been sold to the school?</label>
				<select {...former.super_handle(["meeting_ess_transaction_sold"])}>
					<option value="">Please select answer</option>
					<option value="YES">Yes</option>
					<option value="NO">No</option>
				</select>
			</div>
		}

		{
			user_type === "ESS" && state.meeting_ess_transaction_sold === "NO" && <div className="row">
				<label>Why did they not buy the product?</label>
				<select {...former.super_handle(["meeting_ess_transaction_fail_reason"])}>
					<option value="">Please select answer</option>
					<option value="ALREADY_USING_SIMILAR">Already using a similar product</option>
					<option value="NO_NEED_FOR_PRODUCT">Does not have a need for the product</option>
					<option value="DONT_LIKE_PRODUCT">Does not like the product</option>
					<option value="PREFER_COMPETITOR">Prefer a competitor's product</option>
					<option value="PRODUCT_TOO_EXPENSIVE">Product is too expensive</option>
					<option value="OTHER">Other reason</option>
				</select>
			</div>
		}

		{
			user_type === "FINANCE" && <div className="row">
				<label>Will the respondent be applying for a loan?</label>
				<select {...former.super_handle(["meeting_finance_transaction_loan"])}>
					<option value="">Please select answer</option>
					<option value="YES">Yes</option>
					<option value="NO">No</option>
				</select>
			</div>
		}

		{
			user_type === "FINANCE" && state.meeting_finance_transaction_loan === "NO" && <div className="row">
				<option value="">Please select answer</option>
				<option value="OUTSTANDING_LOAN">Already have an outstanding loan</option>
				<option value="NO_LONGER_NEED_LOAN">Does not have a need for a loan anymore</option>
				<option value="PREFER_COMPETITOR">Prefer a competitors loan product</option>
				<option value="INTEREST_TOO_HIGH">Interest rate/service charge is too high</option>
				<option value="OTHER">Other reason</option>
			</div>
		}

		{
			(state.meeting_finance_transaction_fail_reason === "OTHER" || state.meeting_ess_transaction_fail_reason === "OTHER") && <div className="row">
				<label>Please specify why they did not make the transaction</label>
				<input type="text" {...former.super_handle(["meeting_transaction_fail_reason_other"])} />
			</div>
		}


	</React.Fragment>
}