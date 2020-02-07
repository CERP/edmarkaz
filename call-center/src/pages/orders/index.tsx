import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { getOrders, getProducts } from '../../actions'
import { Link } from 'react-router-dom'
import moment from 'moment'

interface P {
	orders: RootReducerState["orders"]
	products: RootReducerState["products"]
	getOrders: () => any
	getProducts: () => any
}

const Orders = ({ orders, products, getOrders, getProducts }: P) => {

	useEffect(() => {
		getProducts()
		getOrders()
	}, [])
	const [viewBy, setViewBy] = useState("SCHOOL")
	const [showFilters, setShowFilters] = useState(false)
	const [verified, setVerified] = useState("NOT_VERIFIED")
	const [supplierFilter, setSupplierFilter] = useState("")
	const [schoolFilter, setSchoolFilter] = useState("")
	const [start_date, setStartDate] = useState(moment().subtract(1, "week").format("YYYY-MM-DD"))
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

			const school_id = order.school.school_name

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
		if (verified === "ORDER_VERIFIED") {
			return Boolean(order.verified)
		}
		else if (verified === "NOT_VERIFIED") {
			return !Boolean(order.verified)
		}
		else
			return true
	}

	const order_by_school = viewBy === "SCHOOL" ? getOrdersBySchool() : {}

	return <div className="order page">
		<div className="title">Order List</div>
		<div className="section form" style={{ width: "75%" }}>

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
					<select onChange={(e) => setSchoolFilter(e.target.value)} value={schoolFilter}>
						<option value="">All</option>
						{
							Object.keys(order_by_school || {}).map(sid => <option key={sid} value={sid}>{sid}</option>)
						}
					</select>
				</div>}
				<div className="row">
					<label>Type</label>
					<select onChange={(e) => setVerified(e.target.value)} value={verified}>
						<option value="">All</option>
						<option value="ORDER_VERIFIED" >Verified</option>
						<option value="NOT_VERIFIED">Not Verified</option>
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
		{
			(loading && product_loading) ? <div> Loading...</div> :
				viewBy === "SUPPLIER" ? <div className="section form" style={{ width: "75%" }}>
					{console.log("Orders", db)}
					{
						Object.entries(db)
							.filter(([sid]) => supplierFilter ? sid === supplierFilter : true)
							.map(([sid, orders]) => {
								return <div key={sid}>
									<div className="title">{sid}</div>
									<div> Total: {Object.entries(orders).filter(([time, { order }]) => filterTime(parseFloat(time)) && filterOrder(order)).length} </div>
									<div className="list">
										{
											Object.entries(orders)
												.filter(([time, { order }]) => filterTime(parseFloat(time)) && filterOrder(order))
												.map(([time, { order }]) => {
													return <Link to={`/orders?o_school_id=${order.meta.school_id}&o_supplier_id=${sid}&o_order_time=${time}&o_product_id=${order.meta.product_id}`} key={order.time}>
														{`${product_db[order.meta.product_id].title} - ${new Date(order.time).toLocaleString()}`}
													</Link>
												})
										}
									</div>
								</div>
							}
							)

					}
				</div> : <div className="section form" style={{ width: "75%" }}>
						{
							Object.entries(order_by_school)
								.filter(([school_id]) => schoolFilter ? school_id === schoolFilter : true)
								.map(([school_id, orders]) => {
									return <div key={school_id}>
										<div className="title">{school_id}</div>
										<div> Total: {Object.entries(orders).filter(([time, order]) => filterTime(parseFloat(time)) && filterOrder(order)).length} </div>
										<div className="list">
											{
												Object.entries(orders)
													.map(([time, order]) => {
														return <Link to={`/orders?o_school_id=${school_id}&o_supplier_id=${order.supplier_id}&o_order_time=${time}&o_product_id=${order.meta.product_id}`} key={order.time}>
															{`${product_db[order.meta.product_id].title} - ${new Date(order.time).toLocaleString()}`}
														</Link>
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
	getOrders: () => dispatch(getOrders()),
	getProducts: () => dispatch(getProducts())
}))(Orders);
