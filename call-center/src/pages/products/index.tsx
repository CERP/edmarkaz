import React, { useState, Dispatch } from 'react'
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
import productInfo from './productInfo';

interface P {
	products: RootReducerState["products"]
}

const Products = ({ products }: P) => {

	const { db, loading, last_sync } = products

	const categories = {} as {
		[supplier_id: string]: {
			[id: string]: Product
		}
	}

	// create { [category]: { supplier_id: profile }}
	Object.entries(db).forEach(([pid, p]) => {
		if (!categories[p.supplier_id]) {
			categories[p.supplier_id] = {
				[pid]: p
			}
		}
		categories[p.supplier_id] = {
			...categories[p.supplier_id],
			[pid]: p
		}
	})

	return <div className="order page">
		<div className="title">Products Page</div>

		<div className="section form" style={{ width: "75%" }}>
			<div className="divider"> Products List </div>
			{
				Object.entries(categories).map(
					([sid, products]) => {
						return <div key={sid}>
							<div className="title"> {sid} </div>
							{
								Object.entries(products)
									.map(([pid, product]) => {
										return <div className="list" key={pid}>
											<Link to={`/products?supplier_id=${sid}&product_id=${product.id}`}> {product.title} </Link>
										</div>
									})
							}
						</div>
					}
				)
			}
		</div>

	</div>

}

export default connect((state: RootReducerState) => ({
	products: state.products,
}), (dispatch: Function) => ({}))(Products);