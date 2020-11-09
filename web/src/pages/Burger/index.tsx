import React from 'react'
import { Route, Link, RouteComponentProps, withRouter } from 'react-router-dom'
import qs from 'query-string'

import New from '../New'
import InProgress from '../InProgress'
import Done from '../Done'
import Rejected from '../Rejected'
import Settings from '../Settings'
import Products from '../Products'
import Orders from '../Orders/orders'
import icon from './icon.svg'
import SchoolInfo from '~/src/components/SchoolInfo'
import ProductInfo from '~/src/components/ProductInfo'

import './style.css'
import Dashboard from '../Dashboard';
import { connect } from 'react-redux'
import { EmptyHome } from '../Home/emptyHome'

interface P {
	auth: RootBankState["auth"]
}
interface S {
	visible: boolean
}

type propTypes = P & RouteComponentProps
class Burger extends React.Component<propTypes, S> {

	constructor(props: propTypes) {
		super(props)

		this.state = {
			visible: false
		}
	}

	onClose = () => {
		this.props.history.push({
			pathname: this.props.location.pathname,
			search: ''
		})
	}

	onMinimize = () => {
		this.setState({
			visible: !this.state.visible
		})
	}

	render() {

		const { auth } = this.props
		const { visible } = this.state
		const current = this.props.location.pathname;
		const search = this.props.location.search;
		const params = qs.parse(search)

		const selected_id = params.school_id as string;
		const product_id = params.product_id as string;

		const panel_exists = selected_id || product_id

		// this also can decide if there is a product page or not..

		return <div className={`root-page ${panel_exists ? '' : ''}`}>

			<div className="header">
				<div className="icon-container">
					<div className="icon" onClick={this.onMinimize} style={{ background: `url(${icon}) 50% 0 no-repeat` }} />
				</div>
				<div className="info">
					<div>
						<span style={{ color: "#f05967" }}> ilm </span>
						Exchange
					</div>
					<div>{auth.id}</div>
				</div>
			</div>

			{visible && <div className="burger">
				{/* <Link to={{ pathname: "/", search }} className={current === '/' ? "active" : ""}>Home</Link>
				<Link to={{ pathname: "/new", search }} className={current === '/new' ? "active" : ""}>New</Link>
				{ /* <Link to="/todo" className={current === '/todo' ? "active" : ""}>To-Do</Link>
				<Link to={{ pathname: "/progress", search }} className={current === '/progress' ? "active" : ""}>In Progress</Link>
				<Link to={{ pathname: "/done", search }} className={current === '/done' ? "active" : ""}>Done</Link>
				<Link to={{ pathname: "/rejected", search }} className={current === '/rejected' ? "active" : ""}>Rejected</Link> */}
				<Link to={{ pathname: "/orders", search }} className={current === '/orders' || current === '/' ? "active" : ""}>Orders</Link>
				<Link to={{ pathname: "/products", search }} className={current === '/products' ? "active" : ""}>Products</Link>
				<Link to="/dashboard/activities" className={current === '/dashboard' ? "active" : ""}>Dashboard</Link>
				<Link to="/settings" className={current === '/settings' ? "active" : ""}>Settings</Link>
			</div>}

			{!panel_exists && <div className={visible ? "burger-stub" : "burger-stub full-view"}>
				<Route exact path="/" component={Orders} />
				<Route path="/new" component={New} />
				<Route path="/progress" component={InProgress} />
				<Route path="/done" component={Done} />
				<Route path="/rejected" component={Rejected} title={"Rejected"} />
				<Route path="/products" component={Products} />
				<Route path="/orders" component={Orders} />
				<Route path="/dashboard" component={Dashboard} />
				<Route path="/settings" component={Settings} />
			</div>}
			{
				selected_id && <div className={visible ? "info-panel" : "info-panel full-view"}>
					<SchoolInfo school_id={selected_id} />
				</div>
			}
			{
				product_id && <div className={visible ? "info-panel" : "info-panel full-view"}>
					<ProductInfo product_id={product_id} />
				</div>
			}
		</div>
	}
}

export default connect((state: RootBankState) => ({
	auth: state.auth
}))(withRouter(Burger));