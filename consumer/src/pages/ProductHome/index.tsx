import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';

import { getProducts } from '../../actions';

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
		const categories = {} as {
			[category_id: string]: {
				[supplier_id: string]: Product['supplier_profile'];
			};
		}

		// create { [category]: { supplier_id: profile }}
		Object.values(this.props.products).forEach(p => {

			if (p.categories && p.supplier_profile) {

				Object.keys(p.categories).forEach(category => {

					const existing = categories[category]

					if (!existing) {
						categories[category] = {
							[p.supplier_id]: p.supplier_profile
						}
					}
					else if (existing && existing[p.supplier_id] === undefined) {
						existing[p.supplier_id] = p.supplier_profile
					}

				})
			}


		})

		return <div className="products">
			<div className="tabs-banner" style={{ height: "300px" }}></div>
			<div className="tabs-home">

				{
					Object.entries(categories)
						.map(([category, suppliers]) => {

							return <div className="item-row" key={category}>
								<div className="title">{category}</div>
								<div className="items">
									{
										Object.entries(suppliers)
											.map(([sid, profile]) => <Link className="item-card" to={`/supplier/${sid}`} key={`${category}-${sid}`}>
												<div style={{ backgroundImage: `url(${profile.logo && profile.logo.url})` }} className="item-image" />
												<div className="subtitle">{profile.name}</div>
											</Link>)
									}
								</div>
							</div>
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