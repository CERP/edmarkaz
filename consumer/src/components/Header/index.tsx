import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import './style.css'

type Props = {
	auth: RootReducerState['auth'];
	path: string;
}

const Header = ({ path, auth }: Props) => {
	return <div className="header-tabs heading">
		<Link to="" className="logo"><span className="ilm">ilm</span>exchange</Link>
		{
			auth.token === undefined ?
				(
					path !== "/log-in" ?
						<Link to="/log-in" style={{ textDecoration: "none", color: "#222", fontSize: "18px", alignSelf: "center" }} className="">
							Log In
					</Link> : <Link to="/">X</Link>
				)
				: <Link to="/profile" style={{ textDecoration: "none", color: "#000000" }}> Profile</Link>
		}
	</div>
}
{/* <Link to="/sign-up" style={{ textDecoration: "none", color: "#222", fontSize: "18px", alignSelf: "center" }} className="">
				Sign Up
			</Link> */}
export default connect((state: RootReducerState) => ({
	auth: state.auth
}))(Header);