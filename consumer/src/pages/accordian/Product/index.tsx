import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import { getProducts, placeOrder } from '../../../actions';

import './style.css'

interface S {

}

interface RouteInfo {
	supplier_id: string
	product_id: string
}

type P = {
	auth: RootReducerState['auth']
	products: RootReducerState['products']['db']
	connected: boolean
	getProducts: () => void
} & RouteComponentProps<RouteInfo>

//TODO: should request product from backend if not in state
class ProductPage extends React.Component<P, S> {

	componentDidMount() {
		this.props.getProducts()
	}

	onOrder = () => {
		// dispatch onOrder action
		
	}

	render() {
		const product_id = this.props.match.params.product_id;

		const product = this.props.products[product_id]

		if(product === undefined) {
			return <div className="product-page page">Loading product {product_id}...</div>
		}

		return <div className="product-page page">
			<div className="title">{product.title}</div>
			<img src={product.image && product.image.url} />
			<div className="supplier">{product.supplier_id}</div>
			<div className="description">{product.description}</div>
			{ this.props.connected && !this.props.auth.token && <Link className="button blue" to="/sign-up">Sign up to Order Online</Link> }
			{ this.props.connected && this.props.auth.token && <div className="button blue" onClick={this.onOrder}>Place Order Online</div> }
			<div className="number">Call 03555935557 to Order now</div>
		</div>

	}
}

export default connect((state : RootReducerState) => ({
	products: state.products.db,
	connected: state.connected,
	auth: state.auth
}), (dispatch : Function) => ({
	getProducts: () => dispatch(getProducts()),
	placeOrder: (product : Product) => dispatch(placeOrder(product))
}))(ProductPage)