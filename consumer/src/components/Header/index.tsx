import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => <div className="header-tabs heading">
	<Link to="" style={{ textDecoration:"none", color:"#222"}} className=""> ilmExchange </Link>
	<Link to="/sign-up" style={{ textDecoration:"none", color:"#222", fontSize:"18px",alignSelf:"center"}} className=""> Sign Up </Link>
	</div>

export default Header;