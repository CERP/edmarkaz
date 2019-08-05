import React from 'react'
import { connect } from 'react-redux'
import { getProducts } from '../../actions';

interface P {
	products: RootReducerState['products']['db']
	getProducts: () => void
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
		return <div className="products page">

			<div className="title">Products</div>

			<div className="divider">Finance</div>
			<div className="section">
			{
				Object.entries(this.props.products)
					.filter(([, v]) => 
						v.supplier_id === "finca" || v.supplier_id === "telenor"
						|| v.supplier_id === "jsbank" || v.supplier_id === "kashf"
					)
					.map(([k, v]) => {
						return <div className="supplier-box">
							<div>{v.supplier_id}</div>
						</div>
					})
			}

			</div>
			{
				Object.entries(this.props.products)
					.map(([k, v]) => {
						console.log(v)
						return <div>{v.title}</div>
					})
			}

		</div>
	}
}

export default connect((state : RootReducerState) => ({
	products: state.products.db
}), (dispatch : Function) => ({
	getProducts: () => dispatch(getProducts())
}))(LoggedOutHome)