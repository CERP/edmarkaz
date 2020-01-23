import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux';
import { getSchoolProfiles, verifyOrder } from '../../actions';
import { RouteComponentProps, withRouter } from 'react-router';

interface P {
	product_id: string
	order_time: number
	school_id: string
	supplier_id: string
	active_school: RootReducerState["active_school"]
	products: RootReducerState["products"]
	orders: RootReducerState["orders"]
	verifyOrder: (order: Order, product: Product, school: CERPSchool) => any
	getSchoolProfiles: (school_ids: string[]) => any
}

type propTypes = P & RouteComponentProps
const OrderInfo = ({ product_id, supplier_id, order_time, school_id, active_school, products, orders, verifyOrder, getSchoolProfiles, history }: propTypes) => {

	useEffect(() => {
		console.log("SSID", school_id)
		getSchoolProfiles([school_id])
	}, [school_id])

	const onClose = () => {
		history.push({
			pathname: window.location.pathname,
			search: ''
		})
	}

	const ordered_product = products.db[product_id]
	const order_details = orders.db[supplier_id] ? orders.db[supplier_id][order_time] : false
	const school_name = active_school ? active_school.school_name : ""
	const school_number = active_school ? active_school.phone_number : ""
	const verified = order_details && !order_details.verified
	const product_title = ordered_product ? ordered_product.title : ""

	return <div className="order-info page">
		<div className="section form">
			<div className="button red" onClick={onClose} style={{ backgroundColor: "red" }}>Close</div>
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
			{(verified && active_school && order_details) && <div className="button blue" onClick={() => verifyOrder(order_details, ordered_product, active_school)}> Verify Order</div>}
		</div>
	</div >
}

export default connect((state: RootReducerState) => ({
	products: state.products,
	orders: state.orders,
	active_school: state.active_school
}), (dispatch: Function) => ({
	verifyOrder: (order: Order, product: Product, school: CERPSchool) => dispatch(verifyOrder(order, product, school)),
	getSchoolProfiles: (school_ids: string[]) => dispatch(getSchoolProfiles(school_ids))
}))(withRouter(OrderInfo));