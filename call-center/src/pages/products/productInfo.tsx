import React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router';
import { v4 } from 'uuid'

import { saveProductAction, saveProductImage } from '../../actions'
import Former from '@cerp/former'

import './style.css'
import { getDownsizedImage } from '../../utils/image';

interface OwnProps {
	product_id: string
	supplier_id: string
}

interface StateProps {
	connected: boolean
	product?: Product
}

interface DispatchProps {
	saveProduct: (p: Product, supplier_id: string) => void
	saveProductImage: (imageId: string, dataUrl: string, p: Product) => void
}

type propTypes = OwnProps & StateProps & DispatchProps & RouteComponentProps

interface S {
	product: Product
	imageDataString: string
	newCategory: string
}

const newProduct = (supplier_id: string): Product => ({
	id: v4(),
	supplier_id,
	title: "",
	description: "",
	img_url: "",
	price: "",
	phone_number: "",
	image: {
		id: "",
		url: ""
	},
	deleted: false,
	tags: {},
	categories: {}
})

class ProductInfo extends React.Component<propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props);

		this.state = {
			product: this.props.product || newProduct(props.supplier_id),
			imageDataString: "",
			newCategory: ""

		}

		this.former = new Former(this, [])
	}

	onClose = () => {
		this.props.history.push({
			pathname: window.location.pathname,
			search: ''
		})
	}

	componentWillReceiveProps(nextProps: propTypes) {
		console.log(this.props.product_id, nextProps.product_id, nextProps.product)
		if (nextProps.product_id != this.props.product_id) {
			this.setState({
				product: nextProps.product || newProduct(nextProps.supplier_id)
			})
		}
	}

	onSave = () => {

		console.log("saving product")
		this.props.saveProduct(this.state.product, this.props.supplier_id)

		const current_id = this.state.product.image && this.state.product.image.id || "";
		const prev_id = this.props.product && this.props.product.image && this.props.product.image.id;

		if (current_id !== prev_id) {
			console.log('saving new image')
			this.props.saveProductImage(
				current_id,
				this.state.imageDataString,
				this.state.product
			)
		}
	}

	onDelete = () => {

		if (window.confirm("are you sure you want to delete the product?")) {

			this.props.saveProduct({
				...this.state.product,
				deleted: true
			}, this.props.supplier_id)

			this.onClose();
		}

	}

	uploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {

		const file = e.target.files && e.target.files[0]
		if (file === undefined) {
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

		reader.readAsDataURL(file as File)
	}

	addCategory = () => {
		this.setState({
			product: {
				...this.state.product,
				categories: {
					...this.state.product.categories,
					[this.state.newCategory]: true
				}
			},
			newCategory: ""
		})
	}

	removeCategory = (c: string) => () => {

		const { [c]: val, ...nextCategory } = this.state.product.categories

		this.setState({
			product: {
				...this.state.product,
				categories: nextCategory
			}
		})
	}

	render() {
		return <div className="product-info page">
			<div className="close" onClick={this.onClose}>Close</div>
			<div className="title">Product Info</div>

			<div className="form">
				<div className="row">
					<label>Title</label>
					<input type="text" {...this.former.super_handle(["product", "title"])} placeholder="Title of Product" />
				</div>

				<div className="row">
					<label>Description</label>
					<textarea {...this.former.super_handle(["product", "description"])} placeholder="Description of Product" />
				</div>

				<div className="row">
					<label>Phone Number</label>
					<input type="number" {...this.former.super_handle(["product", "phone_number"])} placeholder="Product Helpline Number" />
				</div>

				<div className="row">
					<label>Price</label>
					<input type="text" {...this.former.super_handle(["product", "price"])} placeholder="Price" />
				</div>

				<div className="section">

					<div className="divider">Product Categories</div>

					<div className="row" style={{ flexDirection: "row" }}>
						<select {...this.former.super_handle(["newCategory"])}>
							<option value="">Select a Category</option>
							<option>Library and Reference Books</option>
							<option>EdTech</option>
							<option>Co-curricular</option>
						</select>

						<div className="button green" onClick={this.addCategory} style={{ width: "24px", height: "24px", marginLeft: "10px" }}>+</div>
					</div>

					<div className="categories">
						{
							Object.keys(this.state.product.categories || {})
								.map(c => <div className="row" style={{ flexDirection: "row" }} key={Math.random()}>
									<label>{c}</label>
									<div className="button red" onClick={this.removeCategory(c)} style={{ width: "initial" }}>Remove</div>
								</div>)
						}
					</div>

				</div>

				<div className="row">
					<label>Image</label>
					<input type="file" accept="image/*" onChange={this.uploadImage} />
				</div>

				<div className="row">
					<label>Product Image</label>
					<img src={this.state.imageDataString || this.state.product.image && this.state.product.image.url} />
				</div>

			</div>
			{this.props.connected && <div className="row save-delete">
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

export default connect((state: RootReducerState, props: OwnProps) => ({
	product: props.product_id === 'new' ? undefined : state.products.db[props.product_id],
	connected: state.connected
}), (dispatch: Function) => ({
	saveProduct: (product: Product, supplier_id: string) => dispatch(saveProductAction(product, supplier_id)),
	saveProductImage: (imageId: string, dataUrl: string, product: Product) => dispatch(saveProductImage(imageId, dataUrl, product))
}))(withRouter(ProductInfo))