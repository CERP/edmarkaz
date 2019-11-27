import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import { getProducts, placeOrder } from '../../../actions';

import './style.css'

interface S {

}

interface RouteInfo {
	supplier_id: string;
	product_id: string;
}

type P = {
	auth: RootReducerState['auth'];
	products: RootReducerState['products']['db'];
	connected: boolean;
	getProducts: () => void;
	placeOrder: (product: Product) => void;
} & RouteComponentProps<RouteInfo>

class ProductPage extends React.Component<P, S> {

	componentDidMount() {
		this.props.getProducts()
	}

	onOrder = () => {
		// dispatch onOrder action
		const product_id = this.props.match.params.product_id;
		this.props.placeOrder(this.props.products[product_id])

	}

	render() {
		const product_id = this.props.match.params.product_id;

		const product = this.props.products[product_id]
		const supplier_name = product.supplier_profile.name

		if (product === undefined) {
			return <div className="product-page page">Loading product {product_id}...</div>
		}

		return <div className="item-page">

			<img src={product.image && product.image.url} className="item-image" alt="Product" />
			<div className="item-info">
				<div className="title">{product.title}</div>
				<div className="subtitle">{supplier_name}</div>
				<div className="heading">{product.price}</div>
			</div>

			{this.props.connected && !this.props.auth.token && <Link to="/sign-up" className="order-button"> SignUp to Order Online</Link>}
			{this.props.connected && this.props.auth.token && <div className="order-button" onClick={this.onOrder}> Request Information</div>}

			<div className="description">{product.description}</div>
			{/* {this.props.connected && !this.props.auth.token && <Link className="button blue" to="/sign-up">Sign up to Order Online</Link>}
			{this.props.connected && this.props.auth.token && <div className="button blue" onClick={this.onOrder}>Request Information</div>} */}
		</div>

	}
}

export default connect((state: RootReducerState) => ({
	products: state.products.db,
	connected: state.connected,
	auth: state.auth
}), (dispatch: Function) => ({
	getProducts: () => dispatch(getProducts()),
	placeOrder: (product: Product) => dispatch(placeOrder(product))
}))(ProductPage)