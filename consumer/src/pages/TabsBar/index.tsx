import React, { Component } from 'react'
import { RouteComponentProps, Route } from 'react-router'
import Header from '../../components/Header'

import './style.css'
import ProductHome from '../ProductHome'
import SupplierHome from '../Supplier'
import ProductPage from '../accordian/Product'
import SignUp from '../SignUp'
import Profile from '../Profile'
import { Link } from 'react-router-dom'

interface S {

}

interface P {

}

interface RouteInfo {

}

type propTypes = RouteComponentProps<RouteInfo> & P

class TabsBar extends Component < propTypes, S > {
	
	constructor(props: propTypes) {
		super(props)
	
		this.state = {
			 
		}
	}
	
	render() {

		const current = this.props.location.pathname;
		const search = this.props.location.search;

		return <div className="tabs-page">
			<Header />

			<div className="tabs-bar subtitle">
				<Link to="" className="cell">Articles</Link>
				<Link to={{ pathname:"/", search}} className={ current === "/"? "cell active":"cell"}>Bazaar</Link>
				<Link to="" className="cell">FAQs</Link>
			</div>

			<div className="">
				<Route exact path="/" component={ProductHome} />
				<Route exact path="/supplier/:supplier_id/:product_id" component={ProductPage} />
				<Route exact path="/supplier/:supplier_id" component={SupplierHome} />
				<Route path="/sign-up" component={SignUp} />
				<Route path="/profile" component={Profile} />
			</div>
			{/* <div className="tabs-home">
				<div className="heading">Topic of the Month:</div>
				<div className="title">What is Education?</div>
				<div className="title" style={{ marginTop: "10px", marginBottom: "10px", textAlign:"right"}}> View All</div>
				<div className="item-row">
					<div className="item-card">
						<div className="item-image"></div>
						<div className="subtitle"> Article 1 Title</div>
						<div className="item-para">
						A simply dummy text of the printing and 
						typesetting industry ...
						</div>
					</div>

					<div className="item-card">
						<div className="item-image"></div>
						<div className="subtitle"> Article 1 Title</div>
						<div className="item-para">
						A simply dummy text of the printing and 
						typesetting industry ...
						</div>
					</div>
				</div>
			</div> */}
		</div>
	}
}
export default TabsBar
