import React from 'react'
import { Container, Avatar } from '@material-ui/core'
import { connect } from 'react-redux'
import { teacherLogin, teacherSignup } from 'actions'
import { TeacherRegister } from './register'
import { TeacherLogin } from './login'
import { validation } from 'utils/teacherPortal'

import HelpFooter from 'components/Footer/HelpFooter'
import Layout from 'components/Layout'
import ilmxLogo from 'components/Header/ilmx.svg'



type P = {
	auth: RootReducerState['auth'];

	validation: (number: string, password: string) => void;
	createLogin: (number: string, password: string) => void;
	createAccount: (number: string, password: string, profile: Partial<TeacherProfile>) => void;
}

const TeacherSignin: React.FC<P> = ({ auth, createLogin, createAccount }) => {

	const callLink = false ? "https://api.whatsapp.com/send?phone=923481119119" : "tel:0348-1119-119"

	return (
		<Layout>
			<div className="login-page">
				<Container maxWidth="sm">
					<div
						className="section"
						style={{
							border: "none",
							display: "flex",
							flexDirection: "column",
						}}>
						<Avatar variant="square" style={{
							height: "100%",
							width: "70%",
							margin: "auto"
						}} src={ilmxLogo} alt="ilmx-logo" />
					</div>

					<TeacherLogin
						auth={auth}
						validation={validation}
						createLogin={createLogin}
					/>
					<TeacherRegister
						validation={validation}
						createAccount={createAccount}
					/>

				</Container>
				<HelpFooter hlink={callLink} />
			</div>
		</Layout>
	)
}

export default connect((state: RootReducerState) => ({
	auth: state.auth,
}), (dispatch: Function) => ({
	createLogin: (number: string, password: string) => dispatch(teacherLogin(number, password)),
	//@ts-ignore
	createAccount: (number: string, password: string, profile: Partial<TeacherProfile>) => dispatch(teacherSignup(number, password, profile))
}))(TeacherSignin)
