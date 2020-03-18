import React, { useState } from 'react'
import { getSalesReps } from '../../utils/sales_rep'

interface P {
	placeOrder: (product: Product, meta: Partial<Order["meta"]>) => void
	products: RootReducerState['products']
}

const OrderPage = ({ placeOrder, products }: P) => {

	const [supplier_filter, setSupplier] = useState("")
	const [product_filter, setProductFilter] = useState("")
	const [strategy, setStrategy] = useState<Order["meta"]["strategy"]>("HELPLINE")
	const [salesRep, setSalesRep] = useState("")

	if (products.loading) {
		return <div>Loading products...</div>
	}

	const suppliers = Object.values(products.db)
		.reduce((agg, curr) => {

			if (!curr.supplier_profile) {
				return agg;
			}

			agg[curr.supplier_id] = curr.supplier_profile.name
			return agg;
		}, {} as Record<string, string>)

	const onOrderPlaced = (product: Product) => {

		const meta = {
			strategy,
			sales_rep: strategy === "SALES_REP" ? salesRep : ""
		}
		placeOrder(product, meta)
	}
	return <>

		<div className="row">
			<label>Filter Supplier</label>
			<select value={supplier_filter} onChange={(e) => setSalesRep(e.target.value)}>
				<option value="">Select a Supplier</option>
				{
					Object.entries(suppliers)
						.map(([sid, s]) => <option value={sid} key={sid}>{s}</option>)
				}
			</select>
		</div>
		<div className="row">
			<label>Strategy</label>
			<select value={strategy} onChange={(e) => setStrategy(e.target.value as Order["meta"]["strategy"])}>
				<option value="HELPLINE">Helpline</option>
				<option value="SALES_REP">Sales Rep</option>
			</select>
		</div>
		{
			strategy === "SALES_REP" && <div className="row">
				<label>Sales Rep</label>
				<select value={salesRep} onChange={(e) => setSalesRep(e.target.value)}>
					<option value="">Select</option>
					{
						Object.entries(getSalesReps()).map(([key, val]) => <option key={key} value={key}>{val}</option>)
					}
				</select>
			</div>
		}

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
							<div className="supplier">{p.supplier_profile && p.supplier_profile.name}</div>
						</div>
						<div className="right">
							<div className="order button blue" onClick={() => onOrderPlaced(p)}>Place Order</div>
						</div>
					</div>
				})
		}

	</>
}

export default OrderPage;