import React from 'react'
import Former from '~/src/utils/former'
import moment = require('moment');

interface P {
	saveSurvey: (survey: CallEndSurvey['meta']) => void
	call_number: number
	user_type: USER_TYPE
}

export default class Survey extends React.Component<P, CallEndSurvey['meta']> {

	former : Former

	constructor(props : P) {
		super(props);

		this.state = {
			customer_interest: "",
			reason_rejected: "",
			reason_rejected_finance: "",
			other_reason_rejected: "",
			customer_likelihood: "",
			follow_up_meeting: "",
			follow_up_meeting_medium: "",
			other_notes: "",
			call_number: props.call_number,
			answer_phone: ""
		}

		this.former = new Former(this, [])

	}

	render() {

		return <div className="modal">
			<div className="title" style={{ marginTop: 0 }}>Call Survey</div>

			<div className="form" style={{ width: "90%" }}>

				<div className="row">
					<label>Did the customer pick up the phone?</label>
					<select {...this.former.super_handle(["answer_phone"])}>
						<option value="">Please select an answer</option>
						<option value="YES">Yes</option>
						<option value="PHONE_OFF">No, Their phone was off</option>
						<option value="NUMBER_INVALID">No, The number was invalid</option>
						<option value="WRONG_NUMBER">No, It was the wrong number</option>
						<option value="NO">No, other reason</option>
					</select>
				</div>

				<div className="row">
					<label>Is the customer interested in using your product?</label>
					<select {...this.former.super_handle(["customer_interest"])}>
						<option value="">Please Select an Answer</option>
						<option value="YES">Yes</option>
						<option value="UNSURE">Unsure</option>
						<option value="NO">No</option>
					</select>
				</div>

				{ this.props.user_type != "FINANCE" && this.state.customer_interest === "NO" && <div className="row">
					<label>Why is the customer not interested in your product?</label>
					<select {...this.former.super_handle(["reason_rejected"])}>
						<option value="">Select </option>
						<option value="PRODUCT_TOO_EXPENSIVE">The Product is too expensive</option>
						<option value="PRODUCT_NOT_RELEVANT">The product is not relevant for them</option>
						<option value="USING_SIMILAR_PRODUCT">Already using a similar product</option>
						<option value="DONT_LIKE_PRODUCT">They do not like the product</option>
						<option value="PREFER_COMPETITOR">Prefer a competitor's product</option>
						<option value="NEED_MORE_TIME">Need more time to think about it</option>
						<option value="OTHER">Other Reason</option>
					</select>
				</div>
				}

				{
					this.props.user_type === "FINANCE" && this.state.customer_interest === "NO" && <div className="row">
						<label>Why is the customer not interested in your product?</label>
						<select {...this.former.super_handle(["reason_rejected_finance"])}>
							<option value="">Please select answer</option>
							<option value="DONT_NEED_THIS_TYPE">Don't need this type of financing</option>
							<option value="NOTHING_TO_INVEST_IN">Do not have anything I would like to invest in</option>
							<option value="AGAINST_RELIGION">Against religious beliefs</option>
							<option value="DONT_WANT_INTEREST">Don't want to pay interest</option>
							<option value="INTEREST_TOO_HIGH">Interest rate is too high</option>
							<option value="DONT_WANT_TO_PAY_SERVICE">Don't want to pay service charge</option>
							<option value="DONT_WANT_TO_REPAY_PRINCIPAL">Don't want to repay principal amount</option>
							<option value="TOO_RISKY">Too risky</option>
							<option value="OUTSTANDING_LOAN">Already have an outstanding loan from a bank</option>
							<option value="SCHOOL_CLOSING">School is closing</option>
							<option value="OTHER">Other reason</option>
						</select>
					</div>
				}

				{ this.state.reason_rejected == "OTHER" && <div className="row">
					<label>Please write why they are not interested</label>
					<input type="text" {...this.former.super_handle(["other_reason_rejected"])} placeholder="" />
				</div> 
				}

				<div className="row">
					<label>How strongly do you feel the client will make a purchase?</label>
					<select {...this.former.super_handle(["customer_likelihood"])}>
						<option value="">Please select an option</option>
						<option value="HIGH">High - I think they will buy from us</option>
						<option value="MEDIUM">Medium - I am not sure</option>
						<option value="LOW">Low - They did not say no, but probably not</option>
						<option value="ZERO">Zero - They will not buy from us</option>
					</select>
				</div>

				<div className="row">
					<label>Will you have another meeting with the client?</label>
					<select {...this.former.super_handle(["follow_up_meeting"])}>
						<option value="">Please Select an Answer</option>
						<option value="YES">Yes</option>
						<option value="NO">No</option>
						<option value="N/A">Not Relevant</option>
					</select>
				</div>

				{
					this.state.follow_up_meeting === "YES" && <div className="row">
						<label>How will you have the meeting?</label>
						<select {...this.former.super_handle(["follow_up_meeting_medium"])}>
							<option value="">Please Select an Answer</option>
							<option value="MEETING">In-Person Meeting</option>
							<option value="PHONE_CALL">Phone Call</option>
						</select>
					</div>
				}
				{ this.state.follow_up_meeting === "YES" && <div className="row">
					<label>By when do you think you will have the meeting?</label>
					<input 
						type="date" 
						onChange={this.former.handle(["follow_up_meeting_time"])} 
						value={moment(this.state.follow_up_meeting_time).format("YYYY-MM-DD")}
						placeholder="Meeting Date"
					/>
				</div>}

				<div className="row">
					<label>Other Notes</label>
					<textarea {...this.former.super_handle(["other_notes"])} placeholder="Enter Comments Here" style={{ textAlign: "left" }}/>
				</div>

				<div className="row">
					<div className="button blue" onClick={() => this.props.saveSurvey(this.state)}>Save</div>
				</div>
			</div>
		</div>
	}
}