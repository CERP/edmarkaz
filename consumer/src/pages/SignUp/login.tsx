import React, { Component } from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'

import { SMSAuth, verifyUrlAuth } from '../../actions'
import Former from 'former'
import { connect } from 'react-redux'


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

		return <div className="login-page">
			<div className="form">

				<div className="title">Login</div>

				<div className="row">
					<div className="subtitle"> Phone Number </div>
					<input
						type="tel"
						{...this.former.super_handle(["phone"])}
						placeholder="eg 0331 234567"
					/>
				</div>

				{
					!this.props.sent &&
					<div
						className="tabs-button"
						style={{ marginTop: "10px", marginBottom: "10px" }}
						onClick={() => this.SendAuthSms()}>
						Send Code
					</div>
				}

				{
					this.props.sent && <>
						<div className="row">
							<div className="subtitle"> Enter 5-digit Code that has been sent to your phone </div>
							<input
								type="tel"
								{...this.former.super_handle(["code"])}
								placeholder="eg 12345" />
						</div>

						<div
							className="tabs-button"
							style={{ marginTop: "10px", marginBottom: "10px" }}
							onClick={() => this.verifyToken()}>
							Enter Code
						</div>
						<div className="subtitle">
							Did not get the sms ? <span style={{ cursor: "pointer", textDecoration: "underline", color: "#1BB4BB" }} onClick={() => this.SendAuthSms()}>Send Again</span>
						</div>
					</>
				}

				<div className="subtitle">
					New to IlmExchange ? <Link to="/sign-up"> Sign-Up </Link>
				</div>
			</div>
		</div>
	}
}
export default connect((state: RootReducerState) => ({
	sent: state.auth.sms_sent,
	token: state.auth.token
}), (dispatch: Function) => ({
	sendAuthSms: (phone: string) => dispatch(SMSAuth(phone)),
	verify: (token: string) => dispatch(verifyUrlAuth(token))
}))(Login)
