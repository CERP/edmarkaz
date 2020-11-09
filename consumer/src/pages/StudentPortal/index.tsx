import React from 'react'
import { connect } from 'react-redux'
import { Redirect, RouteComponentProps } from 'react-router'
import qs from 'query-string'
import { createUniqueStudentLogin, createGeneralStudentLogin, createGuestStudentLogin } from '../../actions'
import LoadingIcon from '../../icons/load.svg'
import './style.css'

interface RouteInfo {
	student_token?: string
}
type P = {
	auth: RootReducerState["auth"]
	connected: boolean
	activeStudent: RootReducerState["activeStudent"]
	createUniqueStudentLogin: (token: string, std_id: string) => void
	createGeneralStudentLogin: (token: string) => void
	createGuestStudentLogin: () => void
} & RouteComponentProps<RouteInfo>

const StudentRouter: React.FC<P> = ({ connected, auth, location, history, activeStudent, createUniqueStudentLogin, createGeneralStudentLogin, createGuestStudentLogin }) => {

	const params = qs.parse(location.search)

	const student_token = params.referral as string | undefined
	const std_id = (params.std_id && params.std_id.toString()) || ""

	// if (auth.user === "STUDENT" && activeStudent === undefined) {
	// 	return <Redirect to="/student-profile" />
	// }

	if (auth.user === "STUDENT" || auth.user === "GUEST_STUDENT" || auth.token) {
		return <Redirect to="/library" />
	}

	if (connected && student_token && std_id && !auth.verifying_user) {
		createUniqueStudentLogin(student_token, std_id)
	}

	if (connected && student_token && !std_id && !auth.verifying_user) {
		createGeneralStudentLogin(student_token)
	}

	// const createGuestLogin = () => {
	// 	createGuestStudentLogin()
	// }

	if (!student_token && !auth.verifying_user) {
		createGuestStudentLogin()
	}

	return auth.verifying_user ? <div className="loading">
		<img className="icon" src={LoadingIcon} alt="loading-icon" />
		<div className="text">Verifying, Please wait</div>
	</div> : <div className="student">

			{
				connected ? <div className="title"> Redirecting... if it's been more than 2 minutues <a href={`https://ilmexchange.com/student`}>Click Here</a> </div>
					: <div className="loading">
						<img className="icon" src={LoadingIcon} alt="loading-icon" />
						<div className="text">Connecting to server, Please wait</div>
					</div>
			}
			{/* <div className="form" >
				<div className="heading">Student Login</div>
				<div className="row">
					<label>Please Use Referral Link Or Please Enter Referral Code (Sent to Registered Schools) </label>
					<input type="number" value={studentToken} placeholder="code" onChange={(e) => setStudentToken(e.target.value)} />
				</div>
				<div className="button blue" onClick={(e) => verifyStudentToken("")}> Enter </div>
				<div className="divider">Or</div>
				<div className="button blue" onClick={createGuestLogin}>Continue as a Guest</div>
			</div> */}
		</div >
}

export default connect((state: RootReducerState) => ({
	connected: state.connected,
	auth: state.auth,
	activeStudent: state.activeStudent
}), (dispatch: Function) => ({
	createUniqueStudentLogin: (token: string, std_id: string) => dispatch(createUniqueStudentLogin(token, std_id)),
	createGeneralStudentLogin: (token: string) => dispatch(createGeneralStudentLogin(token)),
	createGuestStudentLogin: () => dispatch(createGuestStudentLogin())
}))(StudentRouter)
