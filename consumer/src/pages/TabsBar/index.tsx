import React, { Component } from 'react'
import { RouteComponentProps, Route } from 'react-router'
import Header from '../../components/Header'

import './style.css'
import ProductHome from '../ProductHome'
import SupplierHome from '../Supplier'
import ProductPage from '../accordian/Product'
import SignUp from '../SignUp'
import Profile from '../Profile'
import Articles, { ArticleRouter } from '../Articles'
import { Link } from 'react-router-dom'

interface S {

}

interface P {

}

interface RouteInfo {

}

type propTypes = RouteComponentProps<RouteInfo> & P

class TabsBar extends Component<propTypes, S> {

	constructor(props: propTypes) {
		super(props)

		this.state = {

		}
	}

	render() {

		const current = this.props.location.pathname;
		const search = this.props.location.search;

		return <div className="tabs-page">
			<Header path={current} />

			{current !== "sign-up" && <div className="tabs-bar subtitle">
				<Link to="/articles" className={current === "/articles" ? "cell active" : "cell"}>Library</Link>
				<Link to={{ pathname: "/", search }} className={current === "/" ? "cell active" : "cell"}>Bazaar</Link>
				<Link to="" className="cell">FAQs</Link>
			</div>}

			<div className="">
				<Route exact path="/" component={ProductHome} />
				<Route exact path="/supplier/:supplier_id/:product_id" component={ProductPage} />
				<Route exact path="/supplier/:supplier_id" component={SupplierHome} />
				<Route path="/sign-up" component={SignUp} />
				<Route path="/profile" component={Profile} />
				<Route path="/articles/:article_id" component={ArticleRouter} />
				<Route exact path="/articles" component={Articles} />
			</div>
		</div>
	}
}
export default TabsBar
