import React, { Component } from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'

import { SMSAuth, verifyUrlAuth } from '../../actions'
import Former from 'former'
import { connect } from 'react-redux'
import Layout from '../../components/Layout'
import { Container, Button, Typography, TextField, FormControl, MenuItem } from '@material-ui/core'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import IconButton from '@material-ui/core/IconButton'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import InputLabel from '@material-ui/core/InputLabel'
import InputAdornment from '@material-ui/core/InputAdornment'

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
	password: string
	showPassword: boolean
}

type propTypes = RouteComponentProps<RouteInfo> & P

class Login extends Component<propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)

		this.state = {
			phone: "",
			code: "",
			password: "",
			showPassword: false
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

	handleClickShowPassword = () => {
		this.setState({ showPassword: !this.state.showPassword })
	}

	handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	}


	render() {

		if (this.props.token) {
			setTimeout(() => {
				window.location.replace("/school")
			}, 700)
		}

		const { password, showPassword } = this.state

		return <Layout>

			<div className="login-page">
				<Container maxWidth="sm">
					<div className="section"
						style={{
							border: "none",
							display: "flex",
							flexDirection: "column",
						}}
					>
						<Typography
							variant="h4"
							align="left"
							style={{ fontFamily: "futura" }}
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
								<FormControl variant="outlined" style={{ marginTop: 5 }}>
									<InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
									<OutlinedInput
										id="outlined-adornment-password"
										type={showPassword ? 'text' : 'password'}
										value={password}
										{...this.former.super_handle(["password"])}
										endAdornment={
											<InputAdornment position="end">
												<IconButton
													aria-label="toggle password visibility"
													onClick={this.handleClickShowPassword}
													onMouseDown={this.handleMouseDownPassword}
													edge="end"
												>
													{showPassword ? <Visibility /> : <VisibilityOff />}
												</IconButton>
											</InputAdornment>
										}
										labelWidth={70}
									/>
								</FormControl>
							}
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

							<Typography variant="h6">
								Doesn't have any account?
							</Typography>
							<Typography
								variant="h4"
								align="left"
								style={{ margin: "10px 0px", fontFamily: "futura" }}
								color="primary" >Register your Account </Typography>

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
								<FormControl variant="outlined" style={{ marginTop: 5 }}>
									<InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
									<OutlinedInput
										id="outlined-adornment-password"
										type={showPassword ? 'text' : 'password'}
										value={password}
										{...this.former.super_handle(["password"])}
										endAdornment={
											<InputAdornment position="end">
												<IconButton
													aria-label="toggle password visibility"
													onClick={this.handleClickShowPassword}
													onMouseDown={this.handleMouseDownPassword}
													edge="end"
												>
													{showPassword ? <Visibility /> : <VisibilityOff />}
												</IconButton>
											</InputAdornment>
										}
										labelWidth={70}
									/>
								</FormControl>
							}
							<Typography
								variant="h6"
								align="left"
								style={{ marginTop: 15, fontFamily: "futura" }}
								color="primary" >SCHOOL PROFILE </Typography>
							<TextField
								variant="outlined"
								label="School Name"
								fullWidth
								style={{ marginTop: 15 }}
								type="text"
								{...this.former.super_handle(["school_name"])}
							/>
							<TextField
								variant="outlined"
								label="Address"
								fullWidth
								style={{ marginTop: 10 }}
								type="text"
								{...this.former.super_handle(["school_address"])}
							/>
							<Typography
								variant="h6"
								align="left"
								style={{ marginTop: 15, fontFamily: "futura" }}
								color="primary" >LOCATION</Typography>
							<TextField
								variant="outlined"
								label="District"
								fullWidth
								style={{ marginTop: 15 }}
								type="text"
								{...this.former.super_handle(["school_district"])}
							/>
							<TextField
								variant="outlined"
								label="Tehsil"
								fullWidth
								style={{ marginTop: 10 }}
								type="text"
								{...this.former.super_handle(["school_tehsil"])}
							/>
							<Typography
								variant="h6"
								align="left"
								style={{ marginTop: 15, fontFamily: "futura" }}
								color="primary" >ADDITIONAL INFORMATION</Typography>
							<TextField
								variant="outlined"
								label="Lowest Fee"
								fullWidth
								style={{ marginTop: 15 }}
								type="number"
								{...this.former.super_handle(["lowest_fee"])}
							/>
							<TextField
								variant="outlined"
								label="Highest Fee"
								fullWidth
								style={{ marginTop: 10 }}
								type="number"
								{...this.former.super_handle(["highest_fee"])}
							/>
							<TextField
								variant="outlined"
								label="Enrollment"
								fullWidth
								style={{ marginTop: 10 }}
								type="number"
								{...this.former.super_handle(["total_enrollment"])}
							/>
							<TextField
								variant="outlined"
								select
								label="Are you the Owner of the school?"
								fullWidth
								style={{ marginTop: 10 }}
								{...this.former.super_handle(["respondent_owner"])}
							>
								<MenuItem value="YES">Yes</MenuItem>
								<MenuItem value="NO">No</MenuItem>
							</TextField>

							{
								!this.props.sent && <Button
									style={{ width: "20ch", margin: "auto", marginBottom: 20, marginTop: 20, background: "#f05967", color: "white", borderRadius: "32px", fontWeight: "bold", fontSize: "1.25rem" }}
									variant="contained">
									Register
								</Button>
							}
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
