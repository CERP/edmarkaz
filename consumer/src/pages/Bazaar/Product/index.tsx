import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { getProducts, placeOrder, placeOrderAsVisitor } from 'actions'
import Modal from "components/Modal"
import { Container, Grid, Typography, Paper } from '@material-ui/core'
import { toTitleCase } from 'utils/generic'
import { OrderRequestSubmit, OrderSubmitSuccess } from './modals'

import './style.css'

interface S {
	showModal: boolean
	showFormModal: boolean
}

interface RouteInfo {
	supplier_id: string
	product_id: string
}

type P = {
	auth: RootReducerState['auth']
	products: RootReducerState['products']['db']
	connected: boolean
	getProducts: () => void
	placeOrder: (product: Product) => void
	placeOrderAsVisitor: (order: ProductOrderAsVisitor) => void
} & RouteComponentProps<RouteInfo>

class ProductPage extends React.Component<P, S> {

	constructor(props: P) {
		super(props)

		this.state = {
			showModal: false,
			showFormModal: false
		}
	}


	componentDidMount() {
		this.props.getProducts()
	}

	onOrder = () => {
		// dispatch onOrder action
		const product_id = this.props.match.params.product_id
		this.props.placeOrder(this.props.products[product_id])
		this.toggleModal()
	}

	onOrderAsVisitor = (request: OrderRequestForm) => {

		this.toggleFormModal();

		// dispatch onOrder action
		const product_id = this.props.match.params.product_id
		const product = this.props.products[product_id]

		this.props.placeOrderAsVisitor({ product, request })

		this.toggleModal()
	}

	toggleModal = () => {
		this.setState({
			showModal: !this.state.showModal
		})
	}

	toggleFormModal = () => {
		this.setState({
			showFormModal: !this.state.showFormModal
		})
	}

	locationString = (product: Product) => {
		const { province = '', district = '', tehsil = '' } = product.location || { province: '', district: '', tehsil: '' }
		const makeString = [province, district, tehsil].join(", ")

		return product.location ? toTitleCase(makeString, ", ") : ''
	}

	render() {
		const product_id = this.props.match.params.product_id

		const product = this.props.products[product_id]
		const supplier_name = product.supplier_profile.name

		if (product === undefined) {
			return <div className="product-page page">Loading product {product_id}...</div>
		}

		const productLocation = this.locationString(product)

		return <div className="item-page">
			<Container maxWidth="md" disableGutters>
				{this.state.showModal && <Modal>
					<div className="product modal-box">
						<div className="modal-box-inner">
							<OrderSubmitSuccess handleModalClose={this.toggleModal} />
						</div>
					</div>
				</Modal>}

				{this.state.showFormModal && <Modal>
					<div className="product modal-box">
						<div className="modal-box-inner">
							<OrderRequestSubmit
								productLocation={productLocation}
								handleRequestSubmit={this.onOrderAsVisitor}
								handleModalClose={this.toggleFormModal} />
						</div>
					</div>
				</Modal>}

				<div style={{ flexGrow: 1, marginTop: 20 }}>
					<Paper style={{ padding: '1rem', paddingBottom: '1.5rem' }}>
						<Grid container spacing={2}>
							<Grid item style={{ maxWidth: 310, height: 320, marginBottom: '.45rem' }}>
								<img alt="product" style={{ width: 'auto', maxWidth: 310, height: 320, borderRadius: '1rem' }} src={product.image && product.image.url} />
							</Grid>
							<Grid item xs={12} sm container style={{ marginLeft: '1rem' }}>
								<Grid item xs container direction="column" spacing={2}>
									<Grid item xs>
										<Typography gutterBottom variant="h4">{product.title}</Typography>
										<Typography gutterBottom variant="subtitle1" className="bold">{supplier_name}</Typography>
										<Typography variant="subtitle1" className="bold"> Description </Typography>
										<div className="description">
											{
												product.description.split('\n')
													.map((t, k) => <div key={k}>{t}</div>)
											}
										</div>
										<Typography variant="subtitle1"><span className="bold">Available: </span> {product.location ? this.locationString(product) : 'Across Pakistan'}</Typography>
									</Grid>
									<Grid>
										{this.props.connected && this.props.auth.token && this.props.auth.user === "SCHOOL" && <div className="order-button" onClick={this.onOrder}> Request More Information</div>}
										{this.props.connected && !this.props.auth.token && <div className="order-button" onClick={this.toggleFormModal}>Request More Information</div>}
									</Grid>
								</Grid>
								<Grid item style={{ height: 20 }}>
									<Typography className="bold" variant="h5" style={{ color: 'var(--red)' }} gutterBottom>{product.price}</Typography>
								</Grid>
							</Grid>
						</Grid>
					</Paper>
				</div>
			</Container>

			{/* {this.props.connected && !this.props.auth.token && <Link className="button blue" to="/sign-up">Sign up to Order Online</Link>}
			{this.props.connected && this.props.auth.token && <div className="button blue" onClick={this.onOrder}>Request Information</div>} */}
		</div >

	}
}


export default connect((state: RootReducerState) => ({
	products: state.products.db,
	connected: state.connected,
	auth: state.auth
}), (dispatch: Function) => ({
	getProducts: () => dispatch(getProducts()),
	placeOrder: (product: Product) => dispatch(placeOrder(product)),
	placeOrderAsVisitor: (order: ProductOrderAsVisitor) => dispatch(placeOrderAsVisitor(order))
}))(ProductPage)