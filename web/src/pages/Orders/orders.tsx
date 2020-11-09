import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import Former from '~src/utils/former'
import { reserveMaskedNumber, releaseMaskedNumber, getOwnProducts, getSchoolProfiles } from '~src/actions'
import { sendSlackAlert } from '~src/actions/core'
import { connect } from 'react-redux'
import moment from 'moment'
import OrderInfo from './orderInfo'

interface P {
	reserveNumber: (school_id: string) => any
	releaseNumber: (school_id: string) => any
	getProducts: () => void
	loadSchools: (ids: string[]) => void
	sendSlackAlert: (message: string, channel: string) => any
	sync_state: RootBankState["sync_state"]
	schools: RootBankState["new_school_db"]
	products: RootBankState["products"]
}

interface S {
	// filterMenu: boolean
	loadingSchools: boolean
	activeOrder: string
	filters: {
		status: "IN_PROGRESS" | "DONE" | "ORDERED" | ""
		text: string
		start_date: number
		end_date: number
	}
}

type propTypes = RouteComponentProps & P


class Orders extends Component<propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)

		const blank = Object.keys(props.sync_state.matches)
			.filter(k => props.schools[k] == undefined)

		if (blank.length > 0) {
			props.loadSchools(blank)
		}

		this.state = {
			// filterMenu: false,
			loadingSchools: blank.length > 0,
			activeOrder: "",
			filters: {
				status: "",
				text: "",
				start_date: moment().subtract(3, "days").valueOf(),
				end_date: moment().add(1, "day").valueOf()
			}
		}

		this.former = new Former(this, [])
	}

	componentDidMount() {
		this.props.getProducts()
	}

	componentWillReceiveProps(nextProps: propTypes) {

		const blank = Object.keys(nextProps.sync_state.matches)
			.filter(k => nextProps.schools[k] === undefined)

		//  need to put some kind of threshold here.
		console.log("NEW PROPS: ", blank)
		this.setState({ loadingSchools: false })
	}

	setActive = (order_id: string) => {
		const activeOrder = this.state.activeOrder === order_id ? "" : order_id

		this.setState({
			activeOrder
		})
	}

	textfilter = (e: OrderPlacedEvent) => {
		const { text } = this.state.filters
		const school = this.props.schools[e.meta.school_id]
		const product = this.props.products.db[e.meta.product_id]

		if (text !== "") {
			return school.school_name.toLowerCase().includes(text.toLowerCase()) ||
				product.title.toLowerCase().includes(text.toLowerCase())
		}
		return true
	}

	dateFilter = (time: number) => {
		return time > this.state.filters.start_date && time < this.state.filters.end_date
	}

	render() {
		const { sync_state, schools, products } = this.props
		const { activeOrder, filters } = this.state
		const events = Object.entries(sync_state.matches)
			.filter(([sid, { status, history }]) => (status !== "REJECTED" && status !== "NEW") && Object.values(history).find((e) => e.event === "ORDER_PLACED"))
			.reduce((agg, [sid, { status, history }]) => ({ ...agg, ...history }), {} as SchoolMatch["history"])

		const orders = Object.entries(events)
			.filter(([id, e]) => e.event === "ORDER_PLACED" && e.verified && (this.textfilter(e) && this.dateFilter(e.time)))
			.sort(([, a_e], [, b_e]) => b_e.time - a_e.time) as [string, OrderPlacedEvent][]

		return (products.loading || this.state.loadingSchools) ? <div> Loading... </div> : <div className="orders page">
			<div className="title">Orders</div>
			<div className="form" style={{ width: "90%", marginBottom: "20px" }}>
				<div className="row">
					<label>Search</label>
					<input type="text" placeholder="By School or Product" {...this.former.super_handle(["filters", "text"])} />
				</div>
				<div className="row">
					<label>Start Date</label>
					<input type="date" value={moment(filters.start_date).format("YYYY-MM-DD")} onChange={this.former.handle(["filters", "start_date"])} />
				</div>
				<div className="row">
					<label>End Date</label>
					<input type="date" value={moment(filters.end_date).format("YYYY-MM-DD")} onChange={this.former.handle(["filters", "end_date"])} />
				</div>
				<div className="row">
					<label>Status</label>
					<select {...this.former.super_handle(["filters", "status"])}>
						<option value="">Select status</option>
						<option value="ORDER_PLACED">Order Placed</option>
						<option value="IN_PROGRESS">In Progress</option>
						<option value="COMPLETED">Completed</option>
						<option value="SCHOOL_CANCELLED">School Cancelled</option>
						<option value="SUPPLIER_CANCELLED">Supplier Cancelled</option>
					</select>
				</div>
				{/* <div className="button blue" onClick={() => this.setState({ filterMenu: !filterMenu })}>Filters</div>
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

				} */}
			</div>
			<div className="section newtable" style={{ width: "90%", padding: "5px" }}>
				<div className="newtable-row heading">
					<div>Date</div>
					<div>Product</div>
					<div>School</div>
					<div>Status</div>
				</div>
				{
					orders
						.filter(([id, order]) => order.verified === "VERIFIED" &&
							(this.state.filters.status ? order.meta.status === this.state.filters.status : true))
						.map(([id, order]) => {
							const school = schools[order.meta.school_id]
							const product = products.db[order.meta.product_id]
							const schoolMatch = sync_state.matches[order.meta.school_id]
							return <div key={id}>
								<div className="newtable-row">
									<div> {moment(order.time).format("DD-MM-YY")} </div>
									<div className="clickable" onClick={() => this.setActive(id)}>{product.title}</div>
									<div> {(school && school.school_name) || ''} </div>
									<div> {order.meta.status ? order.meta.status : "-"}</div>
								</div>
								{
									activeOrder === id && <OrderInfo key={`${id}-${JSON.stringify(order.meta)}`} order={order} product={product} school={school} schoolMatch={schoolMatch} />
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
	loadSchools: (school_ids: string[]) => dispatch(getSchoolProfiles(school_ids)),
	sendSlackAlert: (message: string, channel: string) => dispatch(sendSlackAlert(message, channel))
}))(Orders)