import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'

import './style.css'
import { getProducts } from '../../actions'

interface S {

}

interface RouteInfo {
	supplier_id: string;
}

type P = {
	products: RootReducerState['products']['db'];
	getProducts: () => void;
} & RouteComponentProps<RouteInfo>

class SupplierHomePage extends React.Component<P, S>{

	componentDidMount() {
		this.props.getProducts()
	}

	render() {

		const supplier_id = this.props.match.params.supplier_id;

		const products = Object.entries(this.props.products)
			.filter(([k, v]) => v.supplier_id === supplier_id && !v.deleted)

		const { banner, logo } = products[0][1]

		return <div className="supplier-home">

			<div className="tabs-banner" style={{ backgroundImage: `url(${banner && banner.url})` }}>
				<img className="supplier-logo" src={logo && logo.url} />
			</div>
			<div className="tabs-home">
				<div className="supplier-info">

					<div className="supplier-desc">
						<div className="title" style={{ marginLeft: "160px" }}>{this.props.match.params.supplier_id}</div>
						<div>
							Lorem ipsum, or lipsum as it is sometimes known,
							is dummy text used in laying out print, graphic
							or web designs. The passage is attributed to an
							unknown typesetter in the 15th century who is
							thought to have scrambled parts of Cicero's De
							Finibus Bonorum et Malorum for use in a type
							specimen book.
						</div>
					</div>
				</div>
				<div className="item-row">
					<div className="title">Products</div>
					<div className="items">
					{
						products.map(([k, p]) => <div className="item-card" key={k}>
							<div className="item-image" style={{ backgroundImage: `url(${p.image && p.image.url})` }} />
							<Link className="subitle" to={`/supplier/${supplier_id}/${p.id}`}><b>{p.title}</b></Link>
						</div>)
					}
					</div>
				</div>
			</div>
		</div>
	}

}


export default connect((state: RootReducerState) => ({
	products: state.products.db
}), (dispatch: Function) => ({
	getProducts: () => dispatch(getProducts())
}))(SupplierHomePage)