import React, { Component } from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router-dom'
import { Container, Button, Typography, TextField, Avatar } from '@material-ui/core'

import Former from 'former'
import Layout from '../../components/Layout'
import ilmxLogo from 'components/Header/ilmx.svg'
import { SMSAuth, verifyUrlAuth } from '../../actions'


import SignUp from '.'

interface P {
	sent: boolean
	token: string | undefined
	sendAuthSms: (phone: string) => any
	verify: (token: string) => any
}

interface RouteInfo {

}

interface S {
	phone: string
	code: string
}

type propTypes = RouteComponentProps<RouteInfo> & P

class Login extends Component<propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)

		this.state = {
			phone: "",
			code: ""
		}

		this.former = new Former(this, [])
	}

	SendAuthSms = () => {

		const { phone } = this.state

		if (phone.trim().length !== 11) {
			return window.alert("Please enter a valid mobile number")
		}
		if (!phone.startsWith("03")) {
			return alert("phone number must start with 03")
		}

		this.props.sendAuthSms(this.state.phone)
	}

	verifyToken = () => {
		const { code } = this.state

		if (code.trim().length !== 5) {
			window.alert("Please enter a valid 5-digit code")
			return
		}

		this.props.verify(this.state.code)
	}

	render() {

		if (this.props.token) {
			setTimeout(() => {
				window.location.replace("/school")
			}, 1500)
		}

		return <Layout>

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

						<Typography
							variant="h4"
							align="left"
							style={{ marginTop: 20, fontFamily: "futura" }}
							color="primary" >Sign In </Typography>
						<>
							<TextField
								variant="outlined"
								label="Phone Number"
								margin="normal"
								fullWidth
								placeholder="e.g. 0300 1110000"
								type="number"
								{...this.former.super_handle(["phone"])}
							/>

							{
								!this.props.sent && <Button
									style={{ width: "20ch", margin: "auto", marginBottom: 20, marginTop: 20, background: "#f05967", color: "white", borderRadius: "32px", fontWeight: "bold", fontSize: "1.25rem" }}
									variant="contained"
									onClick={this.SendAuthSms}>
									Sign In
								</Button>
							}

							{
								this.props.sent && <>
									<TextField
										variant="outlined"
										style={{ marginTop: 5 }}
										fullWidth
										label="Code"
										helperText="Enter 5-digit Code that has been sent to your phone"
										type="tel"
										{...this.former.super_handle(["code"])}
										placeholder="e.g. 12345"
									/>
									<Button
										style={{ width: "20ch", margin: "auto", marginBottom: 20, marginTop: 20, background: "#f05967", color: "white", borderRadius: "32px", fontWeight: "bold", fontSize: "1.25rem" }}
										variant="contained"
										onClick={this.verifyToken}>
										Verify Code
									</Button>
									<Typography variant="subtitle1">
										Didn't get the code through sms ? <span style={{ cursor: "pointer", textDecoration: "underline", color: "#1BB4BB" }} onClick={() => this.SendAuthSms()}>Send Again</span>
									</Typography>
								</>
							}

							<Typography variant="subtitle1">
								Doesn't have any account?
							</Typography>

							<SignUp />

						</>
					</div>
				</Container>
			</div>
		</Layout>
	}
}
export default connect((state: RootReducerState) => ({
	sent: state.auth.sms_sent,
	token: state.auth.token
}), (dispatch: Function) => ({
	sendAuthSms: (phone: string) => dispatch(SMSAuth(phone)),
	verify: (token: string) => dispatch(verifyUrlAuth(token))
}))(Login)
