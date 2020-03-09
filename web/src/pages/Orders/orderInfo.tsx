import React, { Component } from 'react'
import { connect } from 'react-redux'
import Former from '~src/utils/former'
import moment from 'moment'

interface P {
	products: RootBankState["products"]
}

interface S {
	order: OrderPlacedEvent
}
interface SelfProps {
	product: Product
	school: CERPSchool
	order: OrderPlacedEvent
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
	status: "ORDER_PLACED"
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
	save_meta = () => {
		console.log("SAVING")
	}

	render() {

		const { product, school } = this.props
		const { order } = this.state

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
				<div className="divider">Order Info</div>
				<div className="row">
					<label>Order Status</label>
					<select {...this.former.super_handle(["order", "meta", "status"])}>
						<option value="">Select</option>
						<option value="ORDER_PLACED">Order Placed</option>
						<option value="IN_PROGRESS">In Progress</option>
						<option value="COMPLETED">Completed</option>
						<option value="SCHOOL_CANCELLED">School Cancelled</option>
						<option value="SUPPLIER_CANCELLED">Supplier Cancelled</option>
					</select>
				</div>
				{
					//IN_PROGRESS
					(order.meta.status === "IN_PROGRESS") && <>
						<div className="row">
							<label>Call 1</label>
							<input type="text" placeholder="status" {...this.former.super_handle(["order", "meta", "call_one"])} />
						</div>
						<div className="row">
							<label>Call 2</label>
							<input type="text" placeholder="status" {...this.former.super_handle(["order", "meta", "call_two"])} />
						</div>
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
}))(OrderInfo)