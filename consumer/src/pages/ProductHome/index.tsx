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

	render() {
		return <div className="products page">

			<div className="title">Products</div>

			{
				Object.entries(this.props.products)
					.map(([k, v]) => {
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