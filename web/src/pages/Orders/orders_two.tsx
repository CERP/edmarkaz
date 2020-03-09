import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import Former from '~src/utils/former'
import { reserveMaskedNumber, releaseMaskedNumber, getOwnProducts } from '~src/actions'
import { connect } from 'react-redux'
import moment from 'moment'
import OrderInfo from './orderInfo'

interface P {
	reserveNumber: (school_id: string) => any
	releaseNumber: (school_id: string) => any
	getProducts: () => void
	sync_state: RootBankState["sync_state"]
	schools: RootBankState["new_school_db"]
	products: RootBankState["products"]
}

interface S {
	filterMenu: boolean
	activeOrder: string
	filters: {
		status: "IN_PROGRESS" | "DONE" | "ORDERED" | ""
		text: string
	}
}

type propTypes = RouteComponentProps & P

class Orders extends Component<propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)

		this.state = {
			filterMenu: false,
			activeOrder: "",
			filters: {
				status: "",
				text: ""
			}
		}
		this.former = new Former(this, [])
	}
	setActive = (order_id: string) => {
		const activeOrder = this.state.activeOrder === order_id ? "" : order_id

		this.setState({
			activeOrder
		})
	}

	render() {
		const { sync_state, schools, products } = this.props
		const { filterMenu, activeOrder } = this.state

		const events = Object.entries(sync_state.matches)
			.filter(([sid, { status, history }]) => (status !== "REJECTED" && status !== "NEW") && Object.values(history).find((e) => e.event === "ORDER_PLACED"))
			.reduce((agg, [sid, { status, history }]) => ({ ...agg, ...history }), {} as SchoolMatch["history"])

		const orders = Object.entries(events)
			.filter(([id, e]) => e.event === "ORDER_PLACED")
			.sort(([, a_e], [, b_e]) => b_e.time - a_e.time) as [string, OrderPlacedEvent][]

		console.log("ITEMS", orders)
		return <div className="orders page">
			<div className="title">Orders</div>
			<div className="form" style={{ width: "90%", marginBottom: "20px" }}>
				<div className="row">
					<label>Search</label>
					<input type="text" placeholder="By School or Status" {...this.former.super_handle(["filters", "text"])} />
				</div>
				<div className="button blue" onClick={() => this.setState({ filterMenu: !filterMenu })}>Filters</div>
				{
					filterMenu && <>
						<div className="row">
							<label>Status</label>
							<select {...this.former.super_handle(["filters", "status"])}>
								<option value=""> All</option>
								<option value="ORDERED">Ordered</option>
								<option value="DONE">Done</option>
								<option value="IN_PROGRESS">In Progress</option>
							</select>
						</div>
					</>
				}
			</div>
			<div className="section newtable" style={{ width: "90%", padding: "5px" }}>
				<div className="newtable-row heading">
					<div>Date</div>
					<div>Product</div>
					<div>Status</div>
				</div>
				{
					orders.map(([id, order]) => {
						const school = schools[order.meta.school_id]
						const product = products.db[order.meta.product_id]
						return <div key={id}>
							<div className="newtable-row">
								<div> {moment(order.time).format("DD-MM-YY")} </div>
								<div className="clickable" onClick={() => this.setActive(id)}>{product.title}</div>
								<div> {order.meta.status ? order.meta.status : "-"}</div>
							</div>
							{
								activeOrder === id && <OrderInfo key={id} order={order} product={product} school={school} />
							}
						</div>
					})
				}
			</div>

		</div>
	}
}
export default connect((state: RootBankState) => ({
	sync_state: state.sync_state,
	schools: state.new_school_db,
	products: state.products,
}), (dispatch: Function) => ({
	reserveNumber: (school_id: string) => dispatch(reserveMaskedNumber(school_id)),
	releaseNumber: (school_id: string) => dispatch(releaseMaskedNumber(school_id)),
	getProducts: () => dispatch(getOwnProducts()),
}))(Orders)
