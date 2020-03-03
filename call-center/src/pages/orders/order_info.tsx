import React, { Component } from 'react'
import Former from '@cerp/former'
import { RouteComponentProps, withRouter } from 'react-router'
import { connect } from 'react-redux'
import { verifyOrder, rejectOrder } from '../../actions'


interface S {
	order_meta: {
		call_one: string
		call_two: string
		actual_product_ordered: string
		quantity: string
		expected_completion_date: string
		expected_date_of_delivery: string
		actual_date_of_delivery: string
		total_amount: string
		payment_received: string
		cancellation_reason: string
	}
}

interface SelfProps {
	product_id: string
	order_time: number
	school_id: string
	supplier_id: string
}

interface P {
	product_id: string
	order_time: number
	school_id: string
	supplier_id: string
	products: RootReducerState["products"]
	orders: RootReducerState["orders"]
	verifyOrder: (order: Order, product: Product, school: CERPSchool) => any
	rejectOrder: (order: Order, product: Product) => any
}

type propTypes = P & SelfProps & RouteComponentProps

class OrderInfo extends Component<propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)

		this.state = {
			order_meta: {
				call_one: "",
				call_two: "",
				actual_product_ordered: "",
				quantity: "",
				expected_completion_date: "",
				expected_date_of_delivery: "",
				actual_date_of_delivery: "",
				total_amount: "",
				payment_received: "",
				cancellation_reason: ""
			}
		}

		this.former = new Former(this, [])
	}
	onClose = () => {
		this.props.history.push({
			pathname: window.location.pathname,
			search: ''
		})
	}

	reject_order = (order_details: Order, ordered_product: Product) => {
		if (!window.confirm("Are you sure, you want to delete the current Order?")) {
			return
		}
		this.props.rejectOrder(order_details, ordered_product)
	}
	save_meta = () => {
		console.log("SAVING", this.state.order_meta)
	}

	render() {

		const { product_id, supplier_id, order_time, school_id, products, orders } = this.props

		const active_school = orders.db[supplier_id] ? orders.db[supplier_id][order_time].school : false
		const school_name = active_school ? active_school.school_name : ""
		const school_number = active_school ? active_school.phone_number : ""

		const ordered_product = products.db[product_id]
		const product_title = ordered_product ? ordered_product.title : ""

		const order_details = orders.db[supplier_id] ? orders.db[supplier_id][order_time].order : false
		const verified = order_details && order_details.verified ? order_details.verified === "VERIFIED" : false

		return <div className="order-info page">
			<div className="section form">
				<div className="button red" onClick={() => this.onClose()} style={{ backgroundColor: "red" }}>Close</div>
				<div className="title">School Info</div>
				<div className="row">
					<label>School Name</label>
					<div>{school_name}</div>
				</div>
				<div className="row">
					<label>School Number</label>
					<div>{school_number}</div>
				</div>
				<div className="title">Order Info</div>
				<div className="row">
					<label>Product title</label>
					<div>{product_title}</div>
				</div>
				<div className="row">
					<label>Order time</label>
					<div>{new Date(order_time).toLocaleString()}</div>
				</div>
				{(!verified && active_school && order_details) && <div className="button blue" onClick={() => this.props.verifyOrder(order_details, ordered_product, active_school)}> Verify Order</div>}
				{(!verified && active_school && order_details) && <div className="button blue" onClick={() => this.reject_order(order_details, ordered_product)}> Reject Order</div>}

				{
					//VERIFIED
					verified && <>
						<div className="row">
							<label>Call 1</label>
							<input type="text" {...this.former.super_handle(["order_meta", "call_one"])} />
						</div>
						<div className="row">
							<label>Call 2</label>
							<input type="text" {...this.former.super_handle(["order_meta", "call_two"])} />
						</div>
					</>
				}

				{
					//IN_PROGRESS
					verified && <>
						<div className="row">
							<label>Call 1</label>
							<input type="text" {...this.former.super_handle(["order_meta", "call_one"])} />
						</div>
						<div className="row">
							<label>Call 2</label>
							<input type="text" {...this.former.super_handle(["order_meta", "call_two"])} />
						</div>
						<div className="row">
							<label>Actual Product Ordered</label>
							<input type="text" {...this.former.super_handle(["order_meta", "actual_product_ordered"])} />
						</div>
						<div className="row">
							<label>Quantity</label>
							<input type="text" {...this.former.super_handle(["order_meta", "quantity"])} />
						</div>
						<div className="row">
							<label>Expected Completion Date</label>
							<input type="date" {...this.former.super_handle(["order_meta", "expected_completion_date"])} />
						</div>
					</>
				}
				{
					//COMPLETED
					verified && <>
						<div className="row">
							<label>Actual Product Ordered</label>
							<input type="text" {...this.former.super_handle(["order_meta", "actual_product_ordered"])} />
						</div>
						<div className="row">
							<label>Quantity</label>
							<input type="text" {...this.former.super_handle(["order_meta", "quantity"])} />
						</div>
						<div className="row">
							<label>Expected Date of Delivery</label>
							<input type="text" {...this.former.super_handle(["order_meta", "expected_date_of_delivery"])} />
						</div>
						<div className="row">
							<label>Date of Delivery</label>
							<input type="date" {...this.former.super_handle(["order_meta", "actual_date_of_delivery"])} />
						</div>
						<div className="row">
							<label>Total Amount</label>
							<input type="text" {...this.former.super_handle(["order_meta", "total_amount"])} />
						</div>
						<div className="row">
							<label>Payment Received</label>
							<select {...this.former.super_handle(["order_meta", "payment_received"])}>
								<option value="">Select</option>
								<option value="YES">Yes</option>
								<option value="NO">No</option>
							</select>
						</div>
					</>
				}
				<div className="button blue" onClick={() => this.save_meta()}>Save</div>
			</div>
		</div>
	}
}
export default connect((state: RootReducerState) => ({
	products: state.products,
	orders: state.orders
}), (dispatch: Function) => ({
	verifyOrder: (order: Order, product: Product, school: CERPSchool) => dispatch(verifyOrder(order, product, school)),
	rejectOrder: (order: Order, product: Product) => dispatch(rejectOrder(order, product))
}))(withRouter(OrderInfo))
