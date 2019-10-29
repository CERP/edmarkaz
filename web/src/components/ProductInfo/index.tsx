import React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router';
import { v4 } from 'node-uuid'

import { saveProductAction, saveProductImage } from '~/src/actions'
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
	saveProductImage: (imageId: string, dataUrl: string, p: Product) => void
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
			price: "",
			phone_number: "",
			image: {
				id: "",
				url: ""
			},
			deleted: false
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

	componentWillReceiveProps(nextProps : propTypes) {
		if(nextProps.product && nextProps.product.id != this.props.product_id) {
			this.setState({
				product: nextProps.product
			})
		}
	}

	onSave = () => {
		this.props.saveProduct(this.state.product)

		const current_id = this.state.product.image && this.state.product.image.id;
		const prev_id = this.props.product && this.props.product.image && this.props.product.image.id;

		if(current_id !== prev_id) {
			console.log('saving new image')
			this.props.saveProductImage(
				current_id,
				this.state.imageDataString,
				this.state.product
			)
		}
	}

	onDelete = () => {

		if(window.confirm("are you sure you want to delete the product?")) {

			this.props.saveProduct({
				...this.state.product,
				deleted: true
			})

			this.onClose();
		}

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
					<label>Price</label>
					<input type="text" {...this.former.super_handle(["price"])} placeholder="Price" />
				</div>

				<div className="row">
					<label>Image</label>
					<input type="file" accept="image/*" onChange={this.uploadImage}/>
				</div>

				<div className="row">
					<label>Product Image</label>
					<img src={this.state.imageDataString || this.state.product.image && this.state.product.image.url} />
				</div>

			</div>
			{ this.props.connected && <div className="row save-delete">
				<div className="button red" onClick={this.onDelete}>Delete Product</div>
				<div className="button blue" onClick={this.onSave}>Save Product</div>
			</div>
			}
			{
				!this.props.connected && <div>Connecting...</div>
			}

		</div>
	}
}

export default connect<StateProps, DispatchProps, OwnProps>((state : RootBankState, props: OwnProps) => ({
	product: props.product_id === 'new' ? undefined : state.products.db[props.product_id],
	supplier_id: state.auth.id,
	connected: state.connected
}), (dispatch : Function) => ({
	saveProduct: (product: Product) => dispatch(saveProductAction(product)),
	saveProductImage: (imageId: string, dataUrl: string, product: Product) => dispatch(saveProductImage(imageId, dataUrl, product))
}))(withRouter(ProductInfo))