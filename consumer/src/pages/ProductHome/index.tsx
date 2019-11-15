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
		const suppliers = {} as { [k: string]: Product['supplier_profile'] }

		const categories = {} as {
			[category_id: string]: {
				[supplier_id: string]: Product['supplier_profile']
			}
		}

		// create { [category]: { supplier_id: profile }}
		Object.values(this.props.products).forEach(p => {

			if (p.categories && p.supplier_profile) {

				p.categories.forEach(category => {

					let existing = categories[category]

					if (!existing) {
						categories[category] = {
							[p.supplier_id]: p.supplier_profile
						}
					}
					else if (existing && existing[p.supplier_id] == undefined) {
						existing[p.supplier_id] = p.supplier_profile
					}

				})
			}


		})

		return <div className="products">
			<div className="tabs-banner"></div>
			<div className="tabs-home">

				<div className="item-row">

					{
						Object.entries(categories)
							.map(([category, suppliers]) => {

								return <>
									<div className="title">{category}</div>
									{
										Object.entries(suppliers)
											.map(([sid, profile]) => <Link className="item-card" to={`/supplier/${sid}`}>
												<img src={profile.logo && profile.logo.url} className="item-image" alt="logo" />
												<div className="subtitle">{profile.name}</div>
											</Link>)
									}
								</>
							})
					}
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