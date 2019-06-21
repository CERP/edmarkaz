import React from 'react'
import { Route, Link, RouteComponentProps, withRouter } from 'react-router-dom'
import qs from 'query-string'

import Home from '../Home'
import New from '../New'
import InProgress from '../InProgress'
import Done from '../Done'
import Rejected from '../Rejected'
import Settings from '../Settings'
import Products from '../Products'

import SchoolInfo from '~/src/components/SchoolInfo'
import ProductInfo from '~/src/components/ProductInfo'

import './style.css'

class Burger extends React.Component<RouteComponentProps> {

	onClose = () => {
		this.props.history.push({
			pathname: this.props.location.pathname,
			search: ''
		})
	}

	render() {

		const current = this.props.location.pathname;
		const search = this.props.location.search;
		const params = qs.parse(search)
		const selected_id = params.school_id as string;
		const product_id = params.product_id as string;

		// this also can decide if there is a product page or not..

		return <div className={`root-page ${selected_id ? 'double' : ''}`}>

			<div className="header">IlmExchange</div>

			<div className="burger">
				<Link to={{ pathname: "/", search }}  className={current === '/' ? "active" : ""}>Home</Link>
				<Link to={{ pathname: "/new", search }} className={current === '/new' ? "active" : ""}>New</Link>
				{ /* <Link to="/todo" className={current === '/todo' ? "active" : ""}>To-Do</Link> */ }
				<Link to={{ pathname: "/progress", search }} className={current === '/progress' ? "active" : ""}>In Progress</Link>
				<Link to={{ pathname: "/done", search }} className={current === '/done' ? "active" : ""}>Done</Link>
				<Link to={{ pathname: "/rejected", search }} className={current === '/rejected' ? "active" : ""}>Rejected</Link>
				<Link to={{ pathname: "/products", search}} className={current === '/products' ? "active" : ""}>Products</Link>
				<Link to="/settings" className={current === '/settings' ? "active" : ""}>Settings</Link>
			</div>

			<div className="burger-stub">
				<Route exact path="/" component={Home} />
				<Route path="/new" component={New} />
				<Route path="/progress" component={InProgress} />
				<Route path="/done" component={Done} />
				<Route path="/rejected" component={Rejected} title={"Rejected"}/>
				<Route path="/products" component={Products} />
				<Route path="/settings" component={Settings} />
			</div>
				{
					selected_id && <div className="info-panel">
						<SchoolInfo school_id={selected_id} />
					</div>
				}
				{
					product_id && <div className="info-panel">
						<ProductInfo product_id={product_id} />
					</div>
				}
		</div>
	}
}

export default withRouter(Burger);