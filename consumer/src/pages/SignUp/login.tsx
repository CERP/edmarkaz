import React, { Component } from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'

import { SMSAuth, verifyUrlAuth } from '../../actions'
import Former from 'former'
import { connect } from 'react-redux'
import Layout from '../../components/Layout'
import { Container, Button, Typography, Avatar, TextField } from '@material-ui/core'
import PhoneLockedOutlined from '@material-ui/icons/LockTwoTone'


interface P {
	sent: boolean;
	token: string | undefined;
	sendAuthSms: (phone: string) => any;
	verify: (token: string) => any;
}

interface RouteInfo {

}

interface S {
	phone: string;
	code: string;
}

type propTypes = RouteComponentProps<RouteInfo> & P

class Login extends Component<propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)

		this.state = {
			phone: "",
			code: "",
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
			}, 700);
		}
		return <Layout>

			<div className="login-page">
				<Container maxWidth="sm">
					<div className="section"
						style={{
							border: "none",
							display: "flex",
							flexDirection: "column",
							alignItems: "center"
						}}
					>
						<Avatar style={{ backgroundColor: "#F05967" }}>
							<PhoneLockedOutlined />
						</Avatar>
						<Typography
							variant="h4"
							style={{ fontFamily: "futura" }}
							color="primary" > Login </Typography>
						<>
							<TextField
								variant="outlined"
								label="Phone Number"
								margin="normal"
								fullWidth
								placeholder="e.g. 0300 00011100"
								type="number"
								{...this.former.super_handle(["phone"])}
							/>
							{
								!this.props.sent && <Button
									style={{ marginBottom: "20px" }}
									fullWidth
									variant="contained"
									color="primary"
									onClick={this.SendAuthSms}
								>
									Sign In
								</Button>
							}
							{
								this.props.sent && <>
									<TextField
										variant="outlined"
										margin="normal"
										fullWidth
										label="Code"
										helperText="Enter 5-digit Code that has been sent to your phone"
										type="tel"
										{...this.former.super_handle(["code"])}
										placeholder="eg 12345"
									/>
									<Button
										style={{ margin: "20px 0px" }}
										color="primary"
										variant="contained"
										fullWidth
										onClick={this.verifyToken}>
										Enter Code
									</Button>
									<Typography variant="subtitle1">
										Did not get the sms ? <span style={{ cursor: "pointer", textDecoration: "underline", color: "#1BB4BB" }} onClick={() => this.SendAuthSms()}>Send Again</span>
									</Typography>
								</>
							}

							<Typography variant="subtitle1">
								New to IlmExchange ? <Link to="/sign-up"> Sign-Up </Link>
							</Typography>
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
