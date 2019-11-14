import React from 'react'
import { Link } from 'react-router-dom'

const Header = ({ path }: { path: string}) => {
	return <div className="header-tabs heading">
		<Link to="" style={{ textDecoration: "none", color: "#222" }} className=""> ilmExchange </Link>
		{path !== "/sign-up" ?
			<Link to="/sign-up" style={{ textDecoration: "none", color: "#222", fontSize: "18px", alignSelf: "center" }} className="">
				Sign Up
			</Link>: <Link to="/" style={{ textDecoration:"none", color: "#000000"}}> x </Link>
		}
	</div>
}

export default Header;