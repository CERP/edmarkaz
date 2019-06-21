import React from 'react'
import { connect } from 'react-redux'

class ProductInfo extends React.Component {

	render() {
		return <div className="page">
			<div className="title">Product Info</div>
		</div>
	}
}

export default connect((state : RootBankState) => ({
	products: state.products.db
}), (dispatch : Function) => ({

}))(ProductInfo)