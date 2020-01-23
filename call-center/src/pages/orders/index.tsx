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

	const [verified, setVerified] = useState("NOT_VERIFIED")
	const [supplierFilter, setSupplierFilter] = useState("")
	const [start_date, setStartDate] = useState(moment().subtract(1, "week").format("YYYY-MM-DD"))
	const [end_date, setEndDate] = useState(moment().add(1, "day").format("YYYY-MM-DD"))

	const { loading, db } = orders
	const product_db = products.db
	const product_loading = products.loading

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

	return <div className="order page">
		<div className="title">Order List</div>
		<div className="section form" style={{ width: "75%" }}>
			<div className="row">
				<label>Supplier</label>
				<select onChange={(e) => setSupplierFilter(e.target.value)} value={supplierFilter}>
					<option value="">All</option>
					{
						Object.keys(orders.db || {}).map(sid => <option key={sid} value={sid}>{sid}</option>)
					}
				</select>
			</div>
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
		</div>
		{
			(loading && product_loading) ? <div> Loading...</div> :
				<div className="section form" style={{ width: "75%" }}>
					{
						Object.entries(db)
							.filter(([sid]) => supplierFilter ? sid === supplierFilter : true)
							.map(([sid, orders]) => {
								return <div key={sid}>
									<div className="title">{sid}</div>
									<div> Total: {Object.entries(orders).filter(([time, order]) => filterTime(parseFloat(time)) && filterOrder(order)).length} </div>
									<div className="list">
										{
											Object.entries(orders)
												.filter(([time, order]) => filterTime(parseFloat(time)) && filterOrder(order))
												.map(([time, order]) => {
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
