import React from 'react'
import { RouteComponentProps, Redirect } from 'react-router'
import { connect } from 'react-redux'
import { autoLogin } from '../../actions'
import qs from "query-string"
import LoadingIcon from '../../icons/load.svg'

interface p {
	connected: boolean
	auth: RootReducerState["auth"]
	createAutoLogin: (user: string, school_id: string, client_id: string, token: string, phone: string) => void
}

const AutoLogin: React.FC<p & RouteComponentProps> = ({ connected, auth, createAutoLogin, location }) => {

	const params = qs.parse(location.search)
	const user = params.type && params.type.toString()
	const school_id = params.id && params.id.toString()
	const token = params.key && params.key.toString()
	const client_id = params.cid && params.cid.toString()
	const phone = params.phone && params.phone.toString()


	//will need to handle both teacher and school
	if (auth.token && auth.user === user) {
		if (user === "SCHOOL") {
			return <Redirect to="/school" />
		}
		return <Redirect to="/teacher" />
	}

	if (connected && !auth.token && !auth.loading && user && school_id && token && phone && client_id) {
		createAutoLogin(user, school_id, client_id, token, phone)
	}

	if (auth.loading) {
		return <div className="loading">
			<img className="icon" src={LoadingIcon} alt="loader" />
			<div className="text">Loading, might take a few seconds depending on your connection speed</div>
		</div>
	}

	if (!connected) {
		return <div>Connecting...</div>
	}

	return <div>

	</div>
}
export default connect((state: RootReducerState) => ({
	connected: state.connected,
	auth: state.auth
}), (dispatch: Function) => ({
	createAutoLogin: (user: string, school_id: string, client_id: string, token: string, phone: string) => dispatch(autoLogin(user, school_id, client_id, token, phone))
}))(AutoLogin)