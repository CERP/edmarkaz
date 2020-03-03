import React from 'react'
import { Route, Link, RouteComponentProps, withRouter } from 'react-router-dom'
import icon from './icon.svg'
import { connect } from 'react-redux';
import InputPage from '../../pages/input'
import qs from 'query-string'

import './style.css'
import Products from '../../pages/products';
import Orders from '../../pages/orders';
import Logs from '../../pages/logs';
import ProductInfo from '../../pages/products/productInfo';
import OrderInfo from '../../pages/orders/order_info';

interface P {
	user: string | undefined
}

type propTypes = RouteComponentProps & P

interface S {
	visible: boolean
}

class Accordian extends React.Component<propTypes, S> {

	constructor(props: propTypes) {
		super(props)

		this.state = {
			visible: false
		}
	}

	onMinimize = () => {
		this.setState({
			visible: !this.state.visible
		})
	}

	render() {

		const current = this.props.location.pathname;
		const search = this.props.location.search;

		const params = qs.parse(search)

		const p_supplier_id = params.p_supplier_id as string
		const p_product_id = params.p_product_id as string

		const o_school_id = params.o_school_id as string
		const o_product_id = params.o_product_id as string
		const o_order_time = params.o_order_time as string
		const o_supplier_id = params.o_supplier_id as string

		const product_page = current === "/products" && p_supplier_id && p_product_id
		const order_page = current === "/orders" && o_order_time && o_product_id && o_school_id && o_supplier_id

		return <div className={`root-page accordian ${this.state.visible ? "" : "minimized"}`}>
			<div className="header" style={{ justifyContent: "space-between" }}>
				<div>IlmExchange Call Center</div>
				<div>{this.props.user}</div>
			</div>

			<div className="burger">
				<div className="whopper" onClick={this.onMinimize} style={{ background: `url(${icon}) 50% 0 no-repeat` }} />
				{this.state.visible && <Link to={{ pathname: "/", search }} className={current === "/" ? "active" : ""}> Search </Link>}
				{this.state.visible && <Link to={{ pathname: "/products", search }} className={current === "/products" ? "active" : ""}> Products </Link>}
				{this.state.visible && <Link to={{ pathname: "/orders", search }} className={current === "/orders" ? "active" : ""}> Orders </Link>}
				{this.state.visible && <Link to={{ pathname: "/logs", search }} className={current === "/logs" ? "active" : ""}> Logs </Link>}
			</div>

			<div className="burger-stub">
				<Route exact path="/" component={InputPage} />
				<Route path="/products" component={Products} />
				<Route path="/orders" component={Orders} />
				<Route path="/logs" component={Logs} />
			</div>

			{
				(product_page) && <ProductInfo
					product_id={p_product_id}
					supplier_id={p_supplier_id}
				/>
			}
			{
				(order_page) && <OrderInfo
					school_id={o_school_id}
					product_id={o_product_id}
					supplier_id={o_supplier_id}
					order_time={parseFloat(o_order_time)}
				/>
			}

		</div>
	}
}

export default connect((state: RootReducerState) => ({
	user: state.auth.id
}))(withRouter(Accordian));