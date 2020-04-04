import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'
import { Link } from 'react-router-dom'
import TrackedRoute from '../../components/TrackedRoute'
import SignUp from '../SignUp'
import ProductHome from '../ProductHome'

interface P {
	auth: RootReducerState["auth"]
}

const School: React.FC<P> = ({ auth }) => {

	const { token, id, user } = auth

	if (token && id) {
		return <Redirect to="/bazaar" />
	}

	return <Redirect to="log-in" />
}

export default connect((state: RootReducerState) => ({
	auth: state.auth
}), (dispatch: Function) => ({})
)(School)