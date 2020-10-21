import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';
import { getProducts } from '../../actions';
import { Container } from '@material-ui/core';
import Alert from 'components/Alert';

import './style.css'

interface P {
	products: RootReducerState['products']['db'];
	getProducts: () => void;
}

interface S {

}

const getCategoryOrder = (category: string) => {
	const orders = {
		"Library Books & Co-curricular Activities": 3,
		"Education Technology": 4,
		"School Loans": 1,
		"Textbooks": 2,
		"Stationery and Printing": 6,
		"Learning Materials": 5,
		"Solar Power": 7
	} as { [k: string]: number }

	if (orders[category]) {
		return orders[category]
	}

	return 999;
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
		Object.entries(this.props.products).forEach(([pid, p]) => {

			if (pid && p.categories && p.supplier_profile && !p.deleted) {

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

		const sorted = Object.entries(categories)
			.sort(([c1,], [c2,]) => getCategoryOrder(c1) - getCategoryOrder(c2))

		return <div className="products">
			<Container maxWidth="md">
				<div className="tabs-home">
					<Alert text="The availability of products and delivery charges may vary according to your location. Please contact 0348-1119-119 for more information." />
					{
						sorted
							.map(([category, suppliers]) => {

								return <div className="item-row" key={category}>
									<div className="title-row" >
										<div className="title">{category}</div>
									</div>
									<div className="items custom-scrollbar">
										{
											Object.entries(suppliers)
												.sort(([, s1], [, s2]) => (s1.order || 9999) - (s2.order || 9999))
												.map(([sid, profile]) => <Link className="item-card" to={`/supplier/${sid}`} key={`${category}-${sid}`}>
													<img crossOrigin="anonymous" src={profile.logo && profile.logo.url} className="item-image" alt="product" />
													<div className="subtitle">{profile.name}</div>
												</Link>)
										}
									</div>
								</div>
							})
					}
				</div>
			</Container>
		</div>
	}
}

export default connect((state: RootReducerState) => ({
	products: state.products.db
}), (dispatch: Function) => ({
	getProducts: () => dispatch(getProducts())
}))(LoggedOutHome)