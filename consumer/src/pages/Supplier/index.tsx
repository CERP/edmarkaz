import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'

import { getProducts } from '../../actions'

import './style.css'

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
			.sort(([, p1], [, p2]) => (p1.order || 9999) - (p2.order || 9999))

		const { banner, logo, name, description } = products[0][1].supplier_profile

		return <div className="supplier-home">

			<div className="tabs-banner" style={{
				backgroundImage: `url(${banner && banner.url})`,
				height: "300px"
			}}>
				<div className="supp-logo-container">
					<img className="supplier-logo" crossOrigin="anonymous" src={logo && logo.url} />
				</div>
			</div>
			<div className="tabs-home">
				<div className="supplier-info">

					<div className="supplier-desc">
						<div className="title" style={{ marginLeft: "160px" }}>{name}</div>
						<div className="subtitle" style={{ marginTop: "10px" }}>{description}</div>
					</div>
				</div>
				<div className="item-row">
					<div className="title">Products</div>
					<div className="items">
						{
							products.map(([k, p]) => {

								let img_url = ""
								if (p.image && p.image.url) {
									return p.image.url.replace(/\.(png|jpg|jpeg|tif|gif)$/, "_thumb.png")
								}

								return <Link className="item-card" to={`/supplier/${supplier_id}/${p.id}`} key={k}>
									<div className="item-image" style={{ backgroundImage: `url(${img_url})` }} />
									<div className="subtitle">{p.title}</div>
									<div>{p.price}</div>
								</Link>
							})
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