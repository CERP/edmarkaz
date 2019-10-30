import React from 'react'
import { Route, Link, RouteComponentProps, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import ProductHome from '../ProductHome'
import SupplierHome from '../Supplier'
import ProductPage from './Product'
import SignUp from '../SignUp'
import Profile from '../Profile'

import icon from './icon.svg'
import './style.css'

type P = {
	auth: RootReducerState['auth'];
} & RouteComponentProps

interface S {
	visible: boolean;
}

class Accordian extends React.Component<P, S> {

	constructor(props: P) {
		super(props)

		this.state = {
			visible: false
		}
	}

	onMinimize = () => {
		this.setState({
			visible: !this.state.visible
		})
	}

	render() {

		const current = this.props.location.pathname;
		const search = this.props.location.search;

		return <div className={`root-page accordian ${this.state.visible ? "" : "minimized"}`}>
			<div className="header">IlmExchange (Consumer)</div>

			<div className="burger">
				<div className="whopper" onClick={this.onMinimize} style={{ background: `url(${icon}) 50% 0 no-repeat`}} />
				{ this.state.visible && <Link to={{ pathname: "/", search }} className={current === "/" ? "active" : ""}>Products</Link> }
				{ this.state.visible && this.props.auth.token && <Link to={{ pathname: "/profile", search }} className={current === "/profile" ? "active" : ""}>Profile</Link> }
				{ this.state.visible && !this.props.auth.token && <Link to={{ pathname: "/sign-up", search }} className={current === "/sign-up" ? "active" : ""}>Sign Up</Link> }
			</div>

			<div className="burger-stub">
				<Route exact path="/supplier/:supplier_id/:product_id" component={ProductPage} />
				<Route exact path="/supplier/:supplier_id" component={SupplierHome} />
				<Route path="/sign-up" component={SignUp} />
				<Route path="/profile" component={Profile} />
				<Route exact path="/" component={ProductHome} />
			</div>

		</div>
	}
}

export default connect((state: RootReducerState) => ({
	auth: state.auth
}))(withRouter(Accordian));