import React from 'react'
import { Route, Link, RouteComponentProps, withRouter } from 'react-router-dom'

import ProductHome from '../ProductHome'

import icon from './icon.svg'
import './style.css'

type P = RouteComponentProps

interface S {
	visible: boolean
}

class Accordian extends React.Component<P, S> {

	constructor(props : P) {
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
			<div className="header">IlmExchange</div>

			<div className="burger">
				<div className="whopper" onClick={this.onMinimize} style={{ background: `url(${icon}) 50% 0 no-repeat`}} />
				{ this.state.visible && <Link to={{ pathname: "/", search }} className={current === "/" ? "active" : ""}>Products</Link> }
			</div>

			<div className="burger-stub">
				<Route exact path="/" component={ProductHome} />
			</div>

		</div>
	}
}

export default withRouter(Accordian);