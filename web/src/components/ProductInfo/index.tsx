import React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router';
import { v4 } from 'node-uuid'

import { saveProductAction } from '~/src/actions'
import Former from '~/src/utils/former'

import './style.css'
import { getDownsizedImage } from '~src/utils/image';

interface OwnProps {
	product_id: string
}

interface StateProps {
	supplier_id: string
	connected: boolean
	product?: Product
}

interface DispatchProps {
	saveProduct: (p: Product) => void
}

type propTypes = OwnProps & StateProps & DispatchProps & RouteComponentProps

interface S {
	product: Product
	imageDataString: string
}

class ProductInfo extends React.Component<propTypes, S> {

	former: Former
	constructor(props : propTypes) {
		super(props);

		const newProduct : Product = {
			id: v4(),
			supplier_id: this.props.supplier_id,
			title: "",
			description: "",
			img_url: "",
			phone_number: "",
			image: {
				id: "",
				url: ""
			}
		}

		this.state = {
			product: this.props.product || newProduct,
			imageDataString: ""
		}

		this.former = new Former(this, ["product"])
	}

	onClose = () => {
		this.props.history.push({
			pathname: window.location.pathname,
			search: ''
		})
	}

	onSave = () => {
		this.props.saveProduct(this.state.product)

		// check if this is different than before?
		// this.props.saveProductImage(this.state.imageDataString)
	}

	uploadImage = (e : React.ChangeEvent<HTMLInputElement>) => {

		const file = e.target.files[0]
		if(file === undefined) {
			return
		}

		const reader = new FileReader();

		reader.onloadend = () => {
			const res = reader.result as string;

			getDownsizedImage(res, 544)
				.then(imgString => {

					// this should also change the Image property of the product
					// image id
					this.setState({
						imageDataString: imgString,
						product: {
							...this.state.product,
							image: {
								id: v4()
							}
						}
					})
				})
		}

		reader.readAsDataURL(file)
	}

	render() {
		return <div className="product-info page">
			<div className="close" onClick={this.onClose}>Close</div>
			<div className="title">Product Info</div>

			<div className="form">
				<div className="row">
					<label>Title</label>
					<input type="text" {...this.former.super_handle(["title"])} placeholder="Title of Product"/>
				</div>

				<div className="row">
					<label>Description</label>
					<textarea {...this.former.super_handle(["description"])} placeholder="Description of Product" />
				</div>

				<div className="row">
					<label>Phone Number</label>
					<input type="number" {...this.former.super_handle(["phone_number"])} placeholder="Product Helpline Number" />
				</div>

				<div className="row">
					<label>Image</label>
					<input type="file" accept="image/*" onChange={this.uploadImage}/>
				</div>

				<img src={this.state.imageDataString} />

			</div>
			<div className="row">
				<div className="button blue" onClick={this.onSave}>Save Product</div>
			</div>
		</div>
	}
}

export default connect<StateProps, DispatchProps, OwnProps>((state : RootBankState, props: OwnProps) => ({
	product: props.product_id === 'new' ? undefined : state.products.db[props.product_id],
	supplier_id: state.auth.id,
	connected: state.connected
}), (dispatch : Function) => ({
	saveProduct: (product: Product) => { dispatch(saveProductAction(product)) }
}))(withRouter(ProductInfo))