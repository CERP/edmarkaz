import React from 'react'
import { Container, Avatar, Typography } from '@material-ui/core'
import { connect } from 'react-redux'
import { teacherLogin, teacherSignup } from 'actions'
import { TeacherRegister } from './register'
import { TeacherLogin } from './login'
import HelpFooter from 'components/Footer/HelpFooter'
import Layout from 'components/Layout'
import ilmxLogo from 'components/Header/ilmx.svg'

interface P {
	auth: RootReducerState['auth']
	createLogin: (number: string, password: string) => void;
	createAccount: (number: string, password: string, profile: Partial<TeacherProfile>) => void
}

const TeacherSignin: React.FC<P> = ({ auth, createLogin, createAccount }) => {

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
						<Typography variant="h4" align="center" color="primary">Teacher Portal</Typography>
					</div>

					<TeacherLogin
						auth={auth}
						createLogin={createLogin}
					/>
					<TeacherRegister
						createAccount={createAccount}
					/>

				</Container>
				<HelpFooter hlink={'tel:0348-1119-119'} />
			</div>
		</Layout>
	)
}

export default connect((state: RootReducerState) => ({
	auth: state.auth,
}), (dispatch: Function) => ({
	createLogin: (number: string, password: string) => dispatch(teacherLogin(number, password)),
	createAccount: (number: string, password: string, profile: Partial<TeacherProfile>) => dispatch(teacherSignup(number, password, profile))
}))(TeacherSignin)
