import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProducts } from '../../actions';

interface P {
	products: RootReducerState["products"]
	getProducts: () => any
}

const Products = ({ products, getProducts }: P) => {

	useEffect(() => {
		getProducts()
	}, [])

	const { db, loading } = products

	const [supplier_id, setSupplierId] = useState("")
	const [newProductMenu, showNewProduct] = useState(false)

	const categories = {} as {
		[supplier_id: string]: {
			[id: string]: Product
		}
	}

	Object.entries(db).forEach(([pid, p]) => {

		if (!p.deleted) {
			if (!categories[p.supplier_id]) {
				categories[p.supplier_id] = {
					[pid]: p
				}
			}
			categories[p.supplier_id] = {
				...categories[p.supplier_id],
				[pid]: p
			}
		}
	})

	const setHooksToDeaultValue = () => {
		setSupplierId("");
		showNewProduct(false)
	}

	return <div className="order page">
		<div className="title">Products Page</div>
		{loading ? <div> Loading...</div> : <div className="section form" style={{ width: "75%" }}>
			<div className="button blue" onClick={() => showNewProduct(!newProductMenu)}>Add New Product</div>
			{
				newProductMenu && <div className="row">
					<label>Supplier</label>
					<select onChange={(e) => setSupplierId(e.target.value)}>
						<option value="">Select</option>
						{
							Object.keys(categories)
								.map(sid => <option key={sid} value={sid}>
									{sid}
								</option>
								)
						}
					</select>
				</div>
			}
			{supplier_id && <Link className="button green" to={`/products?supplier_id=${supplier_id}&product_id=new`} onClick={setHooksToDeaultValue}> + </Link>}
			<div className="divider"> Product List </div>
			{
				Object.entries(categories).map(
					([sid, products]) => {
						return <div key={sid}>
							<div className="title"> {sid} </div>
							{
								Object.entries(products)
									.map(([pid, product]) => {
										return <div className="list" key={pid}>
											<Link to={`/products?supplier_id=${sid}&product_id=${product.id}`} onClick={setHooksToDeaultValue}> {product.title} </Link>
										</div>
									})
							}
						</div>
					}
				)
			}
		</div>}

	</div>

}

export default connect((state: RootReducerState) => ({
	products: state.products,
}), (dispatch: Function) => ({
	getProducts: () => dispatch(getProducts())
}))(Products);