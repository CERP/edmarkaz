import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'

interface S {

}

interface RouteInfo {
	supplier_id: string
	product_id: string
}

type P = {
	products: RootReducerState['products']['db']
} & RouteComponentProps<RouteInfo>

//TODO: should request product from backend if not in state
class ProductPage extends React.Component<P, S> {

	render() {
		const product_id = this.props.match.params.product_id;

		const product = this.props.products[product_id] || {}

		return <div className="product-page page">
			<div className="title">{product.title}</div>
			<div className="prod-image" style={{ backgroundImage: `url(${product.image && product.image.url})`}} />
			<div className="supplier">{product.supplier_id}</div>
			<div className="description">{product.description}</div>
		</div>

	}
}

export default connect((state : RootReducerState) => ({
	products: state.products.db
}))(ProductPage)