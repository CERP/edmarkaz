import React, { Component } from 'react'
import { connect } from 'react-redux'
import Former from '~src/utils/former'
import moment from 'moment'
import { reserveMaskedNumber, releaseMaskedNumber, updateOrderMeta } from '~src/actions'
import { sendSlackAlert } from '~src/actions/core'
import compareObjects from '~src/utils/compareObjects'
interface P {
	reserveNumber: (school_id: string) => any
	releaseNumber: (school_id: string) => any
	updateOrderMeta: (order: OrderPlacedEvent, meta: any) => any
	sendSlackAlert: (message: string, channel: string) => any
	products: RootBankState["products"]
}

interface S {
	order: OrderPlacedEvent
}
interface SelfProps {
	product: Product
	school: CERPSchool
	order: OrderPlacedEvent
	schoolMatch: SchoolMatch
}

type propTypes = P & SelfProps

const default_meta_fields = () => ({
	cancellation_reason: "",
	call_one: "",
	call_two: "",
	actual_product_ordered: "",
	quantity: "1",
	expected_completion_date: moment.now(),
	expected_date_of_delivery: moment.now(),
	actual_date_of_delivery: moment.now(),
	total_amount: "0",
	payment_received: "NO",
	status: "ORDER_PLACED",
	notes: ""
})

class OrderInfo extends Component<propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)

		const updated_order: OrderPlacedEvent = {
			...props.order,
			meta: {
				...default_meta_fields(),
				...props.order.meta
			}
		}

		this.state = {
			order: updated_order,
		}

		this.former = new Former(this, [])
	}

	onShowNumber = () => {
		this.props.reserveNumber(this.props.school.refcode)
	}

	onMarkComplete = () => {

		const res = confirm('Are you sure you want to Mark as Complete?')

		if (res) {
			this.props.releaseNumber(this.props.school.refcode)
		}
	}

	save_meta = () => {
		const { meta } = this.state.order

		if (isNaN(parseFloat(meta.total_amount)) || parseFloat(meta.total_amount) < 0) {
			alert("Amount can't be less than zero")
			return
		}

		if (isNaN(parseFloat(meta.quantity)) || parseFloat(meta.quantity) < 1) {
			alert("Quantity can't be less than 1")
			return
		}

		const old_meta = this.props.order.meta
		const changes = compareObjects(old_meta, meta)

		if (Object.keys(changes).length < 1) {
			alert("No Changes to Save !")
			return
		}

		this.props.updateOrderMeta(this.state.order, changes)
		this.props.sendSlackAlert(`Supplier Updated the Order(for Product_id: ${this.props.order.meta.product_id}) information by ${this.props.school.school_name} school.`, "ilmx-supplier-updates")
		alert("Order Updated")
	}

	render() {

		const { product, school, schoolMatch } = this.props
		const { order } = this.state

		const reserved = schoolMatch && schoolMatch.status === "IN_PROGRESS"

		return <div className="more">
			<div className="form">
				<div className="divider">School Info</div>
				<div className="row">
					<label>Name</label>
					<div> {school.school_name} </div>
				</div>
				<div className="row">
					<label>Address</label>
					<div> {school.school_address} </div>
				</div>
				<div className="row">
					<label>Tehsil</label>
					<div> {school.school_tehsil} </div>
				</div>
				<div className="row">
					<label> District</label>
					<div> {school.school_district} </div>
				</div>
				<div className="row">
					<label> Lowest Fee</label>
					<div> {school.lowest_fee} </div>
				</div>
				<div className="row">
					<label> Highest Fee</label>
					<div> {school.highest_fee} </div>
				</div>
				<div className="row">
					<label> Enrollment </label>
					<div> {school.enrolment_range} </div>
				</div>
				{
					(schoolMatch.status === "DONE" || schoolMatch.status === "ORDERED") && <div className="button green" onClick={this.onShowNumber}>Show Number</div>
				}
				{
					reserved && <>
						<div className="divider"> Contact Information </div>
						<div className="row">
							<label>Phone Number</label>
							<div className="row" style={{ flexDirection: "row" }}>
								<div style={{ width: "70%" }}> {schoolMatch.masked_number}</div>
								<a href={`tel:${schoolMatch.masked_number}`} className="button green" style={{ width: "20%", marginRight: "10px" }}>Call</a>
							</div>
						</div>
					</>
				}
				{
					schoolMatch.status === "IN_PROGRESS" && <div className="button green" onClick={this.onMarkComplete}>Mark Complete</div>
				}

				<div className="divider">Order Info</div>
				<div className="row">
					<label>Order Status</label>
					<select {...this.former.super_handle(["order", "meta", "status"])}>
						<option value="">Select</option>
						<option value="ORDER_PLACED">Order Placed</option>
						<option value="IN_PROGRESS">In Progress</option>
						<option value="COMPLETED">Completed</option>
						<option value="SCHOOL_CANCELLED">School Cancelled</option>
						<option value="SUPPLIER_CANCELLED">Cancelled</option>
					</select>
				</div>
				{
					//IN_PROGRESS
					(order.meta.status === "IN_PROGRESS") && <>
						{/* <div className="row">
							<label>Call 1</label>
							<input type="text" placeholder="status" {...this.former.super_handle(["order", "meta", "call_one"])} />
						</div>
						<div className="row">
							<label>Call 2</label>
							<input type="text" placeholder="status" {...this.former.super_handle(["order", "meta", "call_two"])} />
						</div> */}
						<div className="row">
							<label>Actual Product Ordered</label>
							<input type="text" placeholder="product name" {...this.former.super_handle(["order", "meta", "actual_product_ordered"])} />
						</div>
						<div className="row">
							<label>Quantity</label>
							<input type="number" {...this.former.super_handle(["order", "meta", "quantity"])} />
						</div>
						<div className="row">
							<label>Expected Completion Date</label>
							<input
								type="date"
								value={moment(this.state.order.meta.expected_completion_date).format("YYYY-MM-DD")}
								onChange={this.former.handle(["order", "meta", "expected_completion_date"])}
							/>
						</div>
						<div className="row">
							<label>Notes</label>
							<textarea placeholder="notes" {...this.former.super_handle(["order", "meta", "notes"])} />
						</div>
					</>
				}
				{
					//COMPLETED
					(order.meta.status === "COMPLETED") && <>
						<div className="row">
							<label>Actual Product Ordered</label>
							<input type="text" placeholder="product name" {...this.former.super_handle(["order", "meta", "actual_product_ordered"])} />
						</div>
						<div className="row">
							<label>Quantity</label>
							<input type="number" {...this.former.super_handle(["order", "meta", "quantity"])} />
						</div>
						<div className="row">
							<label>Expected Date of Delivery</label>
							<input
								type="date"
								value={moment(this.state.order.meta.expected_date_of_delivery).format("YYYY-MM-DD")}
								onChange={this.former.handle(["order", "meta", "expected_date_of_delivery"])}
							/>
						</div>
						<div className="row">
							<label>Date of Delivery</label>
							<input
								type="date"
								value={moment(this.state.order.meta.actual_date_of_delivery).format("YYYY-MM-DD")}
								onChange={this.former.handle(["order", "meta", "actual_date_of_delivery"])}
							/>
						</div>
						<div className="row">
							<label>Total Amount</label>
							<input type="number" {...this.former.super_handle(["order", "meta", "total_amount"])} />
						</div>
						<div className="row">
							<label>Payment Received</label>
							<select {...this.former.super_handle(["order", "meta", "payment_received"])}>
								<option value="YES">Yes</option>
								<option value="NO">No</option>
							</select>
						</div>
						<div className="row">
							<label>Notes</label>
							<textarea placeholder="notes" {...this.former.super_handle(["order", "meta", "notes"])} />
						</div>
					</>
				}

				{
					(order.meta.status === "SCHOOL_CANCELLED" || order.meta.status === "SUPPLIER_CANCELLED") && <>
						<div className="row">
							<label>Cancellation Reason</label>
							<input type="text" placeholder="reason" {...this.former.super_handle(["order", "meta", "cancellation_reason"])} />
						</div>
					</>
				}
				<div className="button blue" onClick={() => this.save_meta()}>Save</div>

			</div>
		</div>
	}
}
export default connect((state: RootBankState) => ({
	products: state.products
}), (dispatch: Function) => ({
	reserveNumber: (school_id: string) => dispatch(reserveMaskedNumber(school_id)),
	releaseNumber: (school_id: string) => dispatch(releaseMaskedNumber(school_id)),
	updateOrderMeta: (order: OrderPlacedEvent, meta: any) => dispatch(updateOrderMeta(order, meta)),
	sendSlackAlert: (message: string, channel: string) => dispatch(sendSlackAlert(message, channel))
}))(OrderInfo)