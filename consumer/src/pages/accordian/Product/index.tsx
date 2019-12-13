import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import { getProducts, placeOrder } from '../../../actions';
import Modal from "../../../components/Modal";

import './style.css'

interface S {
	showModal: boolean;
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

	constructor(props: P) {
		super(props)

		this.state = {
			showModal: false
		}
	}


	componentDidMount() {
		this.props.getProducts()
	}

	onOrder = () => {
		// dispatch onOrder action
		const product_id = this.props.match.params.product_id;

		this.setState({
			showModal: true
		})

		this.props.placeOrder(this.props.products[product_id])
	}

	closeModal = () => {
		this.setState({
			showModal: false
		})
	}

	render() {
		const product_id = this.props.match.params.product_id;

		const product = this.props.products[product_id]
		const supplier_name = product.supplier_profile.name

		if (product === undefined) {
			return <div className="product-page page">Loading product {product_id}...</div>
		}

		return <div className="item-page">

			{this.state.showModal && <Modal>
				<div className="modal-box">

					<div className="title">Congratulations</div>
					<div className="subtitle" style={{ margin: "10px 0px" }}>
						Our Representative will soon contact you with further information.
					</div>

					<div className="button save" onClick={() => this.closeModal()}>
						Great
					</div>
				</div>
			</Modal>}


			<img src={product.image && product.image.url} className="item-image" alt="Product" />
			<div className="item-info">
				<div className="title">{product.title}</div>
				<div className="subtitle">{supplier_name}</div>
				<div className="heading">{product.price}</div>
			</div>

			{this.props.connected && !this.props.auth.token && <Link to="/log-in" className="order-button"> Login to Order Online</Link>}
			{this.props.connected && this.props.auth.token && <div className="order-button" onClick={this.onOrder}> Request Information</div>}

			<div className="description">{
				product.description.split('\n')
					.map((t, k) => <div key={k}>{t}</div>)
			}</div>
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