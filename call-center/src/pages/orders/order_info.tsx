import React, { Component } from 'react'
import Former from '@cerp/former'
import { RouteComponentProps, withRouter } from 'react-router'
import { connect } from 'react-redux'
import { verifyOrder, rejectOrder, updateOrderMeta } from '../../actions'
import moment from 'moment'
import { getSalesReps } from '../../utils/sales_rep'

interface S {
	order: Order
	school: CERPSchool
}

interface SelfProps {
	product_id: string
	order_time: number
	school_id: string
	supplier_id: string
}

interface P {
	products: RootReducerState["products"]
	orders: RootReducerState["orders"]
	updateOrderMeta: (order: Order, meta: any, supplier_id: string) => any
	verifyOrder: (order: Order, product: Product, school: CERPSchool) => any
	rejectOrder: (order: Order, product: Product) => any
}

type propTypes = P & SelfProps & RouteComponentProps

const default_meta_fields = () => ({
	sales_rep: "",
	call_one: "",
	call_two: "",
	actual_product_ordered: "",
	quantity: "1",
	expected_completion_date: moment.now(),
	expected_date_of_delivery: moment.now(),
	actual_date_of_delivery: moment.now(),
	total_amount: "0",
	payment_received: "NO",
	cancellation_reason: "",
	status: "ORDER_PLACED"
})

class OrderInfo extends Component<propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)

		const { order, school } = props.orders.db[props.supplier_id][props.order_time]

		const updated_order: Order = {
			...order,
			meta: {
				...default_meta_fields(),
				...order.meta,
			}
		}

		this.state = {
			order: updated_order,
			school,
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

		const { meta } = this.state.order

		if (isNaN(parseFloat(meta.total_amount)) || parseFloat(meta.total_amount) < 0) {
			alert("Amount can't be less than zero")
			return
		}

		if (isNaN(parseFloat(meta.quantity)) || parseFloat(meta.quantity) < 1) {
			alert("Quantity can't be less than 1")
			return
		}

		const old_meta = this.props.orders.db[this.props.supplier_id][this.props.order_time].order.meta
		const changes = Object.entries(meta)
			.reduce((agg, [key, val]) => {
				//@ts-ignore
				if (old_meta[key] === undefined || val !== old_meta[key]) {
					return {
						...agg,
						[key]: val
					}
				}
				return agg
			}, {})

		if (Object.keys(changes).length < 1) {
			alert("No Changes to Save !")
			return
		}

		this.props.updateOrderMeta(this.state.order, changes, this.props.supplier_id)
	}

	render() {

		const { product_id, order_time, products } = this.props
		const { order, school } = this.state
		const ordered_product = products.db[product_id]
		const product_title = ordered_product ? ordered_product.title : ""
		const verified = order.verified ? order.verified === "VERIFIED" : false

		return <div className="order-info page">
			<div className="section form" style={{ width: "90%" }}>
				<div className="button red" onClick={() => this.onClose()} style={{ backgroundColor: "red" }}>Close</div>
				<div className="divider">School Info</div>
				<div className="row">
					<label>School Name</label>
					<div>{school.school_name}</div>
				</div>
				<div className="row">
					<label>School Number</label>
					<div>{school.phone_number}</div>
				</div>
				<div className="row">
					<label>School Address</label>
					<div>{school.school_address}</div>
				</div>
				<div className="divider">Order Info</div>
				<div className="row">
					<label>Product title</label>
					<div>{product_title}</div>
				</div>
				<div className="row">
					<label>Order time</label>
					<div>{new Date(order_time).toLocaleString()}</div>
				</div>
				<div className="row">
					<label>Order Status</label>
					<select {...this.former.super_handle(["order", "meta", "status"])} disabled={!verified}>
						<option value="">Select</option>
						<option value="ORDER_PLACED">Order Placed</option>
						<option value="IN_PROGRESS">In Progress</option>
						<option value="COMPLETED">Completed</option>
						<option value="SCHOOL_CANCELLED">School Cancelled</option>
						<option value="SUPPLIER_CANCELLED">Supplier Cancelled</option>
					</select>
				</div>
				{
					!verified && <div style={{ marginBottom: "5px" }} className="button blue" onClick={() => this.props.verifyOrder(order, ordered_product, school)}>
						Verify Order
					</div>
				}
				{
					!verified && <div className="button blue" onClick={() => this.reject_order(order, ordered_product)}>
						Reject Order
					</div>
				}
				{
					//VERIFIED
					verified && <>
						<div className="row">
							<label>Sales Rep</label>
							<select {...this.former.super_handle(["order", "meta", "sales_rep"])}>
								<option value="">Select</option>
								{
									Object.entries(getSalesReps())
										.map(([val, name]) => <option key={val} value={val}>{name}</option>)
								}
							</select>
						</div>
					</>
				}
				{
					//IN_PROGRESS
					(verified && order.meta.status === "IN_PROGRESS") && <>
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
					(verified && order.meta.status === "COMPLETED") && <>
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
					(verified && order.meta.status === "SCHOOL_CANCELLED" || order.meta.status === "SUPPLIER_CANCELLED") && <>
						<div className="row">
							<label>Cancellation Reason</label>
							<input type="text" placeholder="reason" {...this.former.super_handle(["order", "meta", "cancellation_reason"])} />
						</div>
					</>
				}
				{verified && <div className="button blue" onClick={() => this.save_meta()}>Save</div>}
			</div>
		</div>
	}
}
export default connect((state: RootReducerState) => ({
	products: state.products,
	orders: state.orders
}), (dispatch: Function) => ({
	updateOrderMeta: (order: Order, meta: any, supplier_id: string) => dispatch(updateOrderMeta(order, meta, supplier_id)),
	verifyOrder: (order: Order, product: Product, school: CERPSchool) => dispatch(verifyOrder(order, product, school)),
	rejectOrder: (order: Order, product: Product) => dispatch(rejectOrder(order, product))
}))(withRouter(OrderInfo))
