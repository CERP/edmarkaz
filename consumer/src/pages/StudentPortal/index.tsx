import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Redirect, RouteComponentProps } from 'react-router'
import qs from 'query-string'
import { verifyStudentToken, createGuestStudentLogin } from '../../actions'
import LoadingIcon from '../../icons/load.svg'
import './style.css'

interface RouteInfo {
	student_token?: string
}
type P = {
	auth: RootReducerState["auth"]
	connected: boolean
	activeStudent: RootReducerState["activeStudent"]
	verifyStudentToken: (token: string) => void
	createGuestStudentLogin: () => void
} & RouteComponentProps<RouteInfo>

const StudentRouter: React.FC<P> = ({ connected, auth, location, history, activeStudent, verifyStudentToken, createGuestStudentLogin }) => {

	const params = qs.parse(location.search)

	const student_token = params.referral as string | undefined
	const [studentToken, setStudentToken] = useState("")

	// if (auth.user === "STUDENT" && activeStudent === undefined) {
	// 	return <Redirect to="/student-profile" />
	// }

	if (auth.user === "STUDENT" || auth.user === "GUEST_STUDENT" || auth.token) {
		return <Redirect to="/library" />
	}

	if (student_token && !auth.verifying_user) {
		verifyStudentToken(student_token)
	}

	// const createGuestLogin = () => {
	// 	createGuestStudentLogin()
	// }

	if (!student_token && !auth.verifying_user) {
		createGuestStudentLogin()
	}

	return auth.verifying_user ? <div className="loading">
		<img className="icon" src={LoadingIcon} />
		<div className="text">Verifying, Please wait</div>
	</div> : <div className="student">
			<div className="title"> Redirecting... if it's been more than 2 minutues <a href={`https://ilmexchange.com/student`}>Click Here</a> </div>
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
	verifyStudentToken: (token: string) => dispatch(verifyStudentToken(token)),
	createGuestStudentLogin: () => dispatch(createGuestStudentLogin())
}))(StudentRouter)
