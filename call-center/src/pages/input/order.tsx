import React, { useState } from 'react'

interface P {
	placeOrder: (product: Product) => void
	products: RootReducerState['products']
}

const OrderPage = ({ placeOrder, products }: P) => {

	if (products.loading) {
		return <div>Loading products...</div>
	}

	const [supplier_filter, setSupplier] = useState("")
	const [product_filter, setProductFilter] = useState("")


	const suppliers = Object.values(products.db)
		.reduce((agg, curr) => {

			if (!curr.supplier_profile) {
				return agg;
			}

			agg[curr.supplier_id] = curr.supplier_profile.name
			return agg;
		}, {} as Record<string, string>)


	return <>

		<div className="row">
			<label>Filter Supplier</label>
			<select value={supplier_filter} onChange={(e) => setSupplier(e.target.value)}>
				<option value="">Select a Supplier</option>
				{
					Object.entries(suppliers)
						.map(([sid, s]) => <option value={sid} key={sid}>{s}</option>)
				}
			</select>
		</div>

		<div className="row">
			<label>Filter Product Name</label>
			<input
				type="text"
				value={product_filter}
				onChange={(e) => setProductFilter(e.target.value.toLowerCase())} />
		</div>

		{
			Object.entries(products.db)
				.filter(([, p]) => !p.deleted &&
					p.supplier_profile &&
					(supplier_filter ? p.supplier_id == supplier_filter : true) &&
					(product_filter ? p.title.toLowerCase().includes(product_filter) : true)
				)
				.map(([id, p]) => {

					return <div key={id} className="product-card">
						<div className="left">
							<div className="id">{id}</div>
							<div className="name">{p.title}</div>
							<div className="supplier">{p.supplier_profile.name}</div>
						</div>
						<div className="right">
							<div className="order button blue" onClick={() => placeOrder(p)}>Place Order</div>
						</div>
					</div>
				})
		}

	</>
}

export default OrderPage;