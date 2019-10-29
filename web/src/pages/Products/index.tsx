import React from 'react'
import { connect } from 'react-redux'

import { getOwnProducts } from '~/src/actions'
import { RouteComponentProps } from 'react-router-dom';

/*
	products page
	first we load a list of all existing products (grid)

	then there's a button for 'create new'

	that will open up a new single product
*/

type propTypes = {
	products: RootBankState['products']['db']
	getProducts: () => void
} & RouteComponentProps

class ProductsPage extends React.Component<propTypes> {

	constructor(props : propTypes) {
		super(props);

		props.getProducts()
	}

	onAddProduct = () => {
		this.props.history.push({
			pathname: this.props.location.pathname,
			search: `?product_id="new"`
		})
	}

	onProductClick = (p : Product) => {

		return () => {
			console.log('button clicked')
			this.props.history.push({
				pathname: this.props.location.pathname,
				search: `?product_id=${p.id}`
			})
		}

	}

	render() {

		return <div className="products page">
			<div className="title">Products</div>

			<div className="button blue" onClick={this.onAddProduct}>Add Product</div>
			<div className="list">
			{
				Object.values(this.props.products)
					.filter(p => !p.deleted)
					.map(p => <div key={p.id} onClick={this.onProductClick(p)}>
						<ProductEntry product={p} />
					</div>)
			}
			</div>
		</div>
	}
}

const ProductEntry : React.SFC<{product: Product }> = (props) => {

	return <div className="product-entry">
		<div className="name">{props.product.title}</div>
		<div>{props.product.description}</div>
	</div>
}

export default connect((state : RootBankState) => ({
	products: state.products.db
}), (dispatch : Function) => ({
	getProducts: () => dispatch(getOwnProducts())
}))(ProductsPage)