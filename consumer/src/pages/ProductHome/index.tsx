import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';

import { getProducts } from '../../actions';
import getSupplierSection from '../../utils/getSupplierSection';

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
		const suppliers = {} as {[k: string]: number }

		Object.values(this.props.products).forEach(p => {
			suppliers[p.supplier_id] = 1
		});

		return <div className="products page">

			<div className="title">Products</div>

			<div className="divider">Finance</div>
			<div className="section" style={{ width: "75%" }}>
			{
				Object.keys(suppliers)
					.filter(s => getSupplierSection(s) === "FINANCE")
					.map(s => {
						return <Link className="supplier-box" to={`/supplier/${s}`} key={s}>
							<div>{s}</div>
						</Link>
					})
			}
			</div>

			<div className="divider">EdTech</div>
			<div className="section" style={{ width: "75%" }}>
			{
				Object.keys(suppliers)
					.filter(s => getSupplierSection(s) === "EDTECH")
					.map(s => {
						return <Link className="supplier-box" to={`/supplier/${s}`} key={s}>
							<div>{s}</div>
						</Link>
					})
			}

			</div>
		</div>
	}
}

export default connect((state: RootReducerState) => ({
	products: state.products.db
}), (dispatch: Function) => ({
	getProducts: () => dispatch(getProducts())
}))(LoggedOutHome)