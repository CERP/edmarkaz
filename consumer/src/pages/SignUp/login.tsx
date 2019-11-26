import React, { Component } from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'

import { SMSAuth, verifyUrlAuth } from '../../actions'
import Former from 'former'
import { connect } from 'react-redux'


interface P {
	sent: boolean;
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

	onSendCode = () => {
		console.log("PHONE NUMBER", this.state.phone)

		this.props.sendAuthSms(this.state.phone)
	}

	verifyToken = () => {
		console.log("CODE", this.state.code)
		this.props.verify(this.state.code)
	}

	render() {
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
						onClick={() => this.onSendCode()}>
						Send Code
					</div>
				}

				{
					this.props.sent && <>
						<div className="row">
							<div className="subtitle"> Enter 4-digit Code </div>
							<input
								type="tel"
								{...this.former.super_handle(["code"])}
								placeholder="eg 0331 234567" />
						</div>

						<div
							className="tabs-button"
							style={{ marginTop: "10px", marginBottom: "10px" }}
							onClick={() => this.verifyToken()}>
							Enter Code
					</div>
					</>
				}

				<div className="subtitle">
					New to IlmExchange ? <Link to="/sign-up" >Sign-Up</Link>
				</div>
			</div>
		</div>
	}
}
export default connect((state: RootReducerState) => ({
	sent: state.auth.sms_sent
}), (dispatch: Function) => ({
	sendAuthSms: (phone: string) => dispatch(SMSAuth(phone)),
	verify: (token: string) => dispatch(verifyUrlAuth(token))
}))(Login)
