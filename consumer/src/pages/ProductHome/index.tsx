import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';

import { getProducts } from '../../actions';
import getSupplierSection from '../../utils/getSupplierSection';

import './style.css'

interface P {
	products: RootReducerState['products']['db'];
	getProducts: () => void;
}

interface S {

}

class LoggedOutHome extends React.Component<P, S> {

	componentDidMount() {
		this.props.getProducts()
	}

	/*
		Here we need to divide by category and by supplier.
		suppliers for now will be hardcoded to a category

	*/
	render() {

		// this should have a supplier image, title, and category
		const suppliers = {} as { [k: string]: string }

		Object.values(this.props.products).forEach(p => {
			suppliers[p.supplier_id] = (p.logo && p.logo.url) || ""
		});

		return <div className="products">
			<div className="tabs-banner"></div>
			<div className="tabs-home">

				<div className="item-row">
				<div className="title">Finance</div>
					{
						Object.keys(suppliers)
							.filter(s => getSupplierSection(s) === "FINANCE")
							.map(s => {
								return <Link className="item-card" to={`/supplier/${s}`} key={s}>
									<img src={suppliers[s]} className='item-image' alt="logo" />
									<div className="subtitle">{s}</div>
								</Link>
							})
					}
				</div>

				<div className="item-row">
					<div className="title">EdTech</div>
					<div className="items">
					{
						Object.keys(suppliers)
							.filter(s => getSupplierSection(s) === "EDTECH")
							.map(s => {
								return <Link className="item-card" to={`/supplier/${s}`} key={s}>
									<img className="item-image" alt="no-image"/>
									<div className="subtitle">{s}</div>
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
}))(LoggedOutHome)