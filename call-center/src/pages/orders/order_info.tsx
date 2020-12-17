import React, { Component } from 'react'
import Former from '@cerp/former'
import { RouteComponentProps, withRouter } from 'react-router'
import { connect } from 'react-redux'
import { verifyOrder, rejectOrder, updateOrderMeta, saveCustomerExperience } from '../../actions'
import moment from 'moment'
import { getSalesReps } from '../../utils/sales_rep'
import compareObjects from '../../utils/compareObjects'

interface S {
	order: Order
	school: CERPSchool
	show_form: boolean
	customer_experience: CustomerExperience
}

interface SelfProps {
	product_id: string
	order_time: number
	school_id: string
	supplier_id: string
	start_date: string
	end_date: string
}

interface P {
	products: RootReducerState["products"]
	orders: RootReducerState["orders"]

	saveCustomerExperience: (id: string, customer_experience: CustomerExperience) => void
	updateOrderMeta: (order: Order, meta: any, supplier_id: string, start_date: number) => any
	verifyOrder: (order: Order, product: Product, school: CERPSchool, start_date: number) => any
	rejectOrder: (order: Order, product: Product, start_date: number) => any
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
	status: "ORDER_PLACED",
	strategy: "ONLINE",
	notes: ""
})

const cancel_orders = {
	product_price: "Product Price",
	product_quality: "Product Quality",
	product_range: "Product Range",
	customer_service: "Customer Service"
}
const complete_orders = {
	...cancel_orders, delivery: "delivery",
	processing_time: "Processing Time"
}

class OrderInfo extends Component<propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)

		const empty_school = { school_name: '', school_address: '', phone_number: '' } as CERPSchool
		const empty_order = { meta: {} } as Order

		const empty_customer_experience: CustomerExperience = {
			school_name: '',
			contact_number: '',
			location: '',
			sales_representative: '',
			product_ordered: '',
			date_of_delivery: '',
			complete_orders: {
				will_order_again: '',
				rating: {} as OrderRating
			},
			cancel_orders: {
				will_order_again: '',
				purchase_cancel_reason: '',
				rating: {} as OrderRating
			}
		}

		const { order = empty_order, school = empty_school } = props.orders.db[props.supplier_id] && props.orders.db[props.supplier_id][props.order_time]

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
			show_form: false,
			customer_experience: empty_customer_experience
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

		const { start_date } = this.props
		this.props.rejectOrder(order_details, ordered_product, moment(start_date).valueOf())
	}

	save_meta = () => {

		const { meta } = this.state.order
		const { start_date } = this.props
		const { phone_number } = this.state.school

		if (isNaN(parseFloat(meta.total_amount)) || parseFloat(meta.total_amount) < 0) {
			alert("Amount can't be less than zero")
			return
		}

		if (isNaN(parseFloat(meta.quantity)) || parseFloat(meta.quantity) < 1) {
			alert("Quantity can't be less than 1")
			return
		}

		const old_meta = this.props.orders.db[this.props.supplier_id][this.props.order_time].order.meta
		const changes = compareObjects<Order["meta"]>(old_meta, meta)

		if (Object.keys(changes).length < 1) {
			alert("No Changes to Save !")
			return
		}

		this.state.show_form && this.props.saveCustomerExperience(phone_number, this.state.customer_experience)
		!this.state.show_form && this.props.updateOrderMeta(this.state.order, changes, this.props.supplier_id, moment(start_date).valueOf())
	}

	handleChangeCompleteOrders = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		//truncate complete keyword from name e.g name => complete_product_price, it will return product_price
		const rating_key = name.substring(9)
		this.setState({
			customer_experience: {
				...this.state.customer_experience,
				complete_orders: {
					...this.state.customer_experience.complete_orders,
					rating: {
						...this.state.customer_experience.complete_orders.rating,
						[rating_key]: parseInt(value)
					}
				}
			}
		})
	}

	handleChangeCancelOrders = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		//truncate cancel keyword from name e.g name => cancel_product_price, it will return product_price
		const rating_key = name.substring(7)
		this.setState({
			customer_experience: {
				...this.state.customer_experience,
				cancel_orders: {
					...this.state.customer_experience.cancel_orders,
					rating: {
						...this.state.customer_experience.cancel_orders.rating,
						[rating_key]: parseInt(value)
					}
				}
			}
		})
	}

	render() {

		const { product_id, order_time, products, start_date } = this.props
		const { order, school } = this.state
		const ordered_product = products.db[product_id]
		const product_title = ordered_product ? ordered_product.title : ""
		const verified = order.verified ? order.verified === "VERIFIED" : false

		return <div className="order-info page">
			<div className="section form" style={{ width: "90%" }}>
				<div className="button red" onClick={() => this.onClose()} style={{ backgroundColor: "red" }}>Close</div>
				{!this.state.show_form && <><div className="divider">School Info</div>
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
					{/* <div className="row"> //In case they want to be able to set strategy for prev orders
					<label>Strategy</label>
					<select {...this.former.super_handle(["order", "meta", "strategy"])}>
						<option value="ONLINE">Online</option>
						<option value="HELPLINE">Helpline</option>
						<option value="SALES_REP">Sales Rep</option>
					</select>
				</div> */}
					{
						!verified && <div style={{ marginBottom: "5px" }} className="button blue" onClick={() => this.props.verifyOrder(order, ordered_product, school, moment(start_date).valueOf())}>
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
							<div className="row">
								<label>Notes</label>
								<textarea placeholder="notes" {...this.former.super_handle(["order", "meta", "notes"])} />
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
							<div className="row">
								<label>Notes</label>
								<textarea placeholder="notes" {...this.former.super_handle(["order", "meta", "notes"])} />
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
					}</>}

				{this.state.show_form && <> <div className="divider">Feedback</div>
					<div className="row">
						<label>School Name</label>
						<input type="text" {...this.former.super_handle(["customer_experience", "school_name"])} />
					</div>
					<div className="row">
						<label>Contact Number</label>
						<input type="number" {...this.former.super_handle(["customer_experience", "contact_number"])}
						/>
					</div>
					<div className="row">
						<label>Location</label>
						<input type="text" {...this.former.super_handle(["customer_experience", "location"])}
						/>
					</div>
					<div className="row">
						<label>Sales Representative</label>
						<input type="text" {...this.former.super_handle(["customer_experience", "sales_representative"])}
						/>
					</div>
					<div className="row">
						<label>Product Ordered</label>
						<input type="text" {...this.former.super_handle(["customer_experience", "product_odered"])}
						/>
					</div>
					<div className="row">
						<label>Date of Delivery</label>
						<input
							type="date"
							value={moment(this.state.customer_experience.date_of_delivery).format("YYYY-MM-DD")}
							onChange={this.former.handle(["customer_experience", "date_of_delivery"])}
						/>
					</div>
					<div className="divider">For Complete Orders</div>
					<div className="row">
						<label>Will you be ordering again from Ilm Exchange? If no, why not?</label>
						<textarea placeholder="Reason" {...this.former.super_handle(["customer_experience", "complete_orders", "will_order_again"])} />
					</div>
					{
						Object.entries(complete_orders).map(([key, value]) => {
							return <div className="rating-row" key={key}>
								<label>{value}</label>
								<div className="rating-div ">
									{
										[1, 2, 3, 4, 5].map(v => (
											<>
												<span>{v}</span>
												<input
													type="radio"
													value={v}
													name={`complete_${key}`}
													checked={(this.state.customer_experience.complete_orders.rating as any)[key] === v}
													onChange={this.handleChangeCompleteOrders} />
											</>
										))
									}
								</div>
							</div>
						})
					}
					<div className="divider">For Cancelled Orders</div>
					<div className="row">
						<label>Why did you not go ahead with the purchase? </label>
						<textarea placeholder="Reason" {...this.former.super_handle(["customer_experience", "cancel_orders", "purchase_cancel_reason"])} />
					</div>
					{
						Object.entries(cancel_orders).map(([key, value]) => {
							return <div className="rating-row">
								<label>{value}</label>
								<div className="rating-div ">
									{
										[1, 2, 3, 4, 5].map(v => (
											<>
												<span>{v}</span>
												<input
													type="radio"
													value={v}
													name={`cancel_${key}`}
													checked={(this.state.customer_experience.cancel_orders.rating as any)[key] === v}
													onChange={this.handleChangeCancelOrders} />
											</>
										))
									}
								</div>
							</div>
						})
					}
					<div className="row">
						<label>Will you be ordering again from Ilm Exchange? If no, why not?</label>
						<textarea placeholder="Reason" {...this.former.super_handle(["customer_experience", "cancel_orders", "will_order_again"])} />
					</div>
				</>}
				{verified && <div className="button blue" style={{ marginBottom: "5px" }} onClick={() => this.save_meta()}>Save</div>}
				{verified && !this.state.show_form && <div className="button blue" onClick={() => this.setState({ show_form: true })}>Customer Experience Form</div>}
			</div>
		</div >
	}
}
export default connect((state: RootReducerState) => ({
	products: state.products,
	orders: state.orders
}), (dispatch: Function) => ({
	saveCustomerExperience: (id: string, customer_experience: CustomerExperience) => dispatch(saveCustomerExperience(id, customer_experience)),
	updateOrderMeta: (order: Order, meta: any, supplier_id: string, start_date: number) => dispatch(updateOrderMeta(order, meta, supplier_id, start_date)),
	verifyOrder: (order: Order, product: Product, school: CERPSchool, start_date: number) => dispatch(verifyOrder(order, product, school, start_date)),
	rejectOrder: (order: Order, product: Product, start_date: number) => dispatch(rejectOrder(order, product, start_date))
}))(withRouter(OrderInfo))
