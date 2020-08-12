import React from 'react'
import { Link, withRouter, RouteComponentProps } from 'react-router-dom'
import { connect } from 'react-redux'
import BackIcon from '../../icons/back.svg'

import './style.css'

type Props = {
	auth: RootReducerState['auth'];
	path: string;
} & RouteComponentProps

const Header = ({ path, history }: Props) => {
	return <div className="header-tabs heading">
		{
			(path !== "/" && path !== "/about-us") && <img src={BackIcon} style={{ width: "20px", marginRight: "10px" }} onClick={() => history.goBack()} alt="back-arrow" />
		}
		<Link to="" className="logo" />
		<Link to="/challenge" className="challenge-btn">Challenge</Link>
		<Link to="/about-us" className={path !== "/about-us" ? "bttn" : "bttn active"}>About Us</Link>
	</div>
}

export default connect((state: RootReducerState) => ({
	auth: state.auth
}))(withRouter(Header));

export const PublicHeader = () => {
	return <div className="header-tabs heading">
		<Link to="/" className="logo" />
	</div>
}