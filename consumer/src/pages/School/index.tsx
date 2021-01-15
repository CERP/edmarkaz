import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'
import { toTitleCase } from 'utils/generic'

interface P {
	auth: RootReducerState["auth"]
}

const School: React.FC<P> = ({ auth }) => {

	const { token, id, user } = auth
	if (user && user !== "SCHOOL") {
		window.alert(`You are already logged in as a ${toTitleCase(user, '_')}. Please logout to access School Portal`)
		return <Redirect to="/" />
	}
	if (token && id) {
		return <Redirect to="/dashboard" />
	}

	return <Redirect to="log-in" />
}

export default connect((state: RootReducerState) => ({
	auth: state.auth
}), (dispatch: Function) => ({})
)(School)