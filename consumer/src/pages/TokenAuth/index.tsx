import React from 'react'
import { RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'
import { verifyUrlAuth } from '../../actions'

type P = {
	verify: (token: string) => void,
	auth: RootReducerState['auth']
} & RouteComponentProps<{
	token: string
}>

const SMSAuth = (props: P) => {

	if (props.auth.token) {
		console.log("can redirect to /")
		props.history.push("/")
	}

	const { token } = props.match.params

	props.verify(token)

	return <div>
		<div>token is {props.match.params.token}</div>
	</div>
}

export default connect((state: RootReducerState) => ({
	auth: state.auth
}), (dispatch: Function) => ({
	verify: (token: string) => dispatch(verifyUrlAuth(token))
}))(SMSAuth)