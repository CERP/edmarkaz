import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { getOrders, getProducts } from '../../actions'
import { Link } from 'react-router-dom'
import moment from 'moment'

interface P {
	orders: RootReducerState["orders"]
	products: RootReducerState["products"]
	getOrders: (start_date?: number) => any
	getProducts: () => any
}

const Orders = ({ orders, products, getOrders, getProducts }: P) => {

	const [start_date, setStartDate] = useState(moment().subtract(3, "days").format("YYYY-MM-DD"))
	useEffect(() => {
		getProducts()
		getOrders(moment(start_date).valueOf())
	}, [start_date])
	const [viewBy, setViewBy] = useState("SCHOOL")
	const [showFilters, setShowFilters] = useState(false)
	const [status, setStatus] = useState("NOT_VERIFIED")
	const [supplierFilter, setSupplierFilter] = useState("")
	const [schoolFilter, setSchoolFilter] = useState("")
	const [end_date, setEndDate] = useState(moment().add(1, "day").format("YYYY-MM-DD"))

	const { loading, db } = orders
	const product_db = products.db
	const product_loading = products.loading

	const getOrdersBySchool = () => {
		type newOrder = { supplier_id: string; school: CERPSchool } & Order

		const mutated_orders = Object.entries(db || {}).reduce((agg, [sid, orders]) => {

			const new_orders = Object.entries(orders || {})
				.filter(([time, { order }]) => filterTime(parseFloat(time)) && filterOrder(order))
				.reduce((agg, [time, { order, school }]) => {
					return {
						...agg,
						[time]: {
							...order,
							supplier_id: sid,
							school
						}
					}
				}, {} as { [id: string]: newOrder })

			return {
				...agg,
				...new_orders
			}
		}, {} as { [id: string]: newOrder })

		const order_by_school = Object.entries(mutated_orders).reduce((agg, [time, order]) => {

			const school_id = order.school.school_name || "NO_SCHOOL"

			if (agg[school_id]) {
				return {
					...agg,
					[school_id]: {
						...agg[school_id],
						[time]: order
					}
				}
			}

			return {
				...agg,
				[school_id]: {
					[time]: order
				}
			}
		}, {} as { [school_id: string]: { [id: string]: newOrder } })

		return order_by_school
	}

	const filterTime = (time: number) => {
		return moment(time).isSameOrAfter(start_date) && moment(time).isSameOrBefore(end_date)
	}

	const filterOrder = (order: Order) => {

		if (status === "" || !order.verified)
			return true

		if (status === "ORDER_VERIFIED" || order.verified === "NOT_VERIFIED" || status === order.meta.status) {
			return true
		}

		return false
	}

	const order_by_school = viewBy === "SCHOOL" ? getOrdersBySchool() : {}

	const getOrderStatus = (order: Order) => {

		if (order.verified && order.verified === "VERIFIED") {
			return order.meta.status ? order.meta.status : "NOT_SET"
		}
		return "NOT_VERIFIED"
	}

	const getOrdersCount = () => {
		return Object.values(db).reduce((agg, curr) => (agg + Object.values(curr).length), 0)
	}

	const getOrdersAmount = () => {
		return Object.values(db).reduce((agg, curr) => {
			const inner_sum = Object.values(curr)
				.reduce((inner_agg, { order }) => {
					return inner_agg + getIntegerAmount(order.meta.total_amount)
				}, 0)
			return agg + inner_sum
		}, 0)
	}

	const getIntegerAmount = (amount: string): number => {
		if (amount) {
			const int_amount = amount.replace(/[^\d.]/g, '').split(".").filter(i => i).join(".")
			return parseFloat(int_amount) || 0
		}
		return 0
	}

	return <div className="order page">
		<div className="title">Order List</div>
		<div className="section form" style={{ width: "85%" }}>

			<div className="row">
				<label>View By</label>
				<select onChange={(e) => setViewBy(e.target.value)} value={viewBy}>
					<option value="SCHOOL">School</option>
					<option value="SUPPLIER">Supplier</option>
				</select>
			</div>
			<div className={!showFilters ? "button blue" : "button red"} onClick={() => setShowFilters(!showFilters)}>{!showFilters ? "Filters" : "Close"}</div>
			{showFilters && <>
				{viewBy === "SUPPLIER" && <div className="row">
					<label>Supplier</label>
					<select onChange={(e) => setSupplierFilter(e.target.value)} value={supplierFilter}>
						<option value="">All</option>
						{
							Object.keys(orders.db || {}).map(sid => <option key={sid} value={sid}>{sid}</option>)
						}
					</select>
				</div>}
				{viewBy === "SCHOOL" && <div className="row">
					<label>School</label>
					<input list="schools" onChange={(e) => setSchoolFilter(e.target.value)} value={schoolFilter} />
					{/* <select onChange={(e) => setSchoolFilter(e.target.value)} value={schoolFilter}>
						<option value="">All</option>
						{
							Object.keys(order_by_school || {}).map(sid => <option key={sid} value={sid}>{sid}</option>)
						}
					</select> */}
				</div>}
				<datalist id="schools">
					{
						Object.keys(order_by_school || {}).map(sid => <option key={sid} value={sid}>{sid}</option>)
					}
				</datalist>
				<div className="row">
					<label>Status</label>
					<select onChange={(e) => setStatus(e.target.value)} value={status}>
						<option value="">All</option>
						<option value="ORDER_VERIFIED">Verified</option>
						<option value="NOT_VERIFIED">Not Verified</option>
						<option value="ORDER_PLACED">Order Placed</option>
						<option value="IN_PROGRESS">In Progress</option>
						<option value="COMPLETED">Completed</option>
						<option value="SCHOOL_CANCELLED">School Cancelled</option>
						<option value="SUPPLIER_CANCELLED">Supplier Cancelled</option>
					</select>
				</div>
				<div className="row">
					<label>Start Date</label>
					<input type="date" onChange={(e) => setStartDate(e.target.value)} value={start_date} />
				</div>
				<div className="row">
					<label>End Date</label>
					<input type="date" onChange={(e) => setEndDate(e.target.value)} value={end_date} />
				</div>
			</>}
		</div>
		<div className="section form" style={{ width: "85%" }}>
			<div className="row">
				<p>Total Orders: {getOrdersCount()}</p>
				<p>Total Amount: {getOrdersAmount()}</p>
			</div>
		</div>
		{
			(loading && product_loading) ? <div> Loading...</div> :
				viewBy === "SUPPLIER" ? <div className="section form" style={{ width: "85%" }}>
					{
						Object.entries(db)
							.filter(([sid]) => supplierFilter ? sid === supplierFilter : true)
							.map(([sid, orders]) => {
								return <div key={sid}>
									<div className="title">{sid}</div>
									<div className="section newtable" style={{ width: "inherit" }}>
										<div className="newtable-row heading">
											<div>Date</div>
											<div>School</div>
											<div>Status</div>
											<div>Contact</div>
											<div>Address </div>
										</div>
										{
											Object.entries(orders)
												.filter(([time, { order }]) => filterTime(parseFloat(time)) && filterOrder(order))
												.map(([time, { order, school }]) => {
													return <div className="newtable-row" key={order.time}>
														<div>{moment(order.time).format("DD-MM-YY")}</div>
														<div>
															<Link to={`/orders?o_school_id=${order.meta.school_id}&o_supplier_id=${sid}&o_order_time=${time}&o_product_id=${order.meta.product_id}&start_date=${start_date}&end_date=${end_date}`} key={order.time}>
																{school.school_name || 'NO_SCHOOL'}
															</Link>
														</div>
														<div>{getOrderStatus(order)}</div>
														<div>{school.phone_number}</div>
														<div>{school.school_address}</div>
													</div>
												})
										}
									</div>
								</div>
							}
							)

					}
				</div> : <div className="section form" style={{ width: "85%" }}>
						{
							Object.entries(order_by_school)
								.filter(([school_id]) => schoolFilter ? school_id === schoolFilter : true)
								.map(([school_id, orders]) => {
									return <div key={school_id}>
										<div className="title">{school_id}</div>
										<div className="newtable section" style={{ width: "inherit" }}>
											<div className="newtable-row heading">
												<div>Date</div>
												<div>Supplier</div>
												<div>Status</div>
												<div>Contact</div>
												<div>Address </div>
											</div>
											{
												Object.entries(orders)
													.map(([time, order]) => {
														const school = order.school
														return <div key={time} className="newtable-row">
															<div>{moment(order.time).format("DD-MM-YY")}</div>
															<div>
																<Link to={`/orders?o_school_id=${order.meta.school_id}&o_supplier_id=${order.supplier_id}&o_order_time=${time}&o_product_id=${order.meta.product_id}&start_date=${start_date}&end_date=${end_date}`} key={order.time}>
																	{order.supplier_id}
																</Link>
															</div>
															<div>{getOrderStatus(order)}</div>
															<div>{school.phone_number}</div>
															<div>{school.school_address}</div>
														</div>
													})
											}
										</div>
									</div>
								}
								)

						}
					</div>
		}

	</div>

}

export default connect((state: RootReducerState) => ({
	orders: state.orders,
	products: state.products
}), (dispatch: Function) => ({
	getOrders: (start_date?: number) => dispatch(getOrders(start_date)),
	getProducts: () => dispatch(getProducts())
}))(Orders);
