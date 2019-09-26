import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'

import './style.css'
import { getProducts } from '../../actions'

interface S {

}

interface RouteInfo {
	supplier_id: string
}

type P =  {
	products: RootReducerState['products']['db']
	getProducts: () => void
} & RouteComponentProps<RouteInfo>

class SupplierHomePage extends React.Component<P, S>{

	componentDidMount() {
		const supplier_id = this.props.match.params.supplier_id;

		this.props.getProducts()
	}

	render() {

		const supplier_id = this.props.match.params.supplier_id;

		const products = Object.entries(this.props.products)
			.filter(([k, v]) => v.supplier_id === supplier_id && !v.deleted)

		return <div className="supplier-home page">
			<div className="title">{this.props.match.params.supplier_id}</div>
			<div className="divider">Products</div>
			<div className="product-list">
				{
					products.map(([k, p]) => <div className="product-box" key={k}>
						<div className="product-image" style={{backgroundImage: `url(${p.image && p.image.url})`}} />
						<Link to={`/supplier/${supplier_id}/${p.id}`}><b>{p.title}</b></Link>
						<div>{p.description}</div>
					</div>)
				}
			</div>
		</div>
	}

}


export default connect((state : RootReducerState) => ({
	products: state.products.db
}), (dispatch : Function) => ({
	getProducts: () => dispatch(getProducts())
}))(SupplierHomePage)