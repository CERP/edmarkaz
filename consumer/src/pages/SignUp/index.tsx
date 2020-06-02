import * as React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'
import { v4 } from 'uuid'
import { Typography, Button, TextField, FormControl, Box } from '@material-ui/core'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import IconButton from '@material-ui/core/IconButton'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import InputLabel from '@material-ui/core/InputLabel'
import InputAdornment from '@material-ui/core/InputAdornment'
import { loadProfile, signUp } from '../../actions'

import Former from 'former'
import { SchoolForm } from './form'

import './style.css'

type P = {
	auth: RootReducerState['auth'];
	profile: RootReducerState['sync_state']['profile'];
	loadProfile: (number: string) => void;
	createAccount: (number: string, password: string, profile: Partial<CERPSchool>) => void;
}

type S = {
	phone_number: string;
	password: string;
	showPassword: boolean
	button_pressed: boolean;
	loading: boolean;
	redirect: boolean;

	school: Partial<CERPSchool>;
}

export const Span = (): any => <span style={{ color: "#FF6347" }}>{`* `}</span>

const initSchool = (): Partial<CERPSchool> => ({
	refcode: v4(),
	school_name: "",
	school_address: "",
	school_tehsil: "",
	school_district: "",
	total_enrolment: "",
	lowest_fee: "",
	highest_fee: "",
	respondent_owner: ""
})

class SignUp extends React.Component<P, S> {

	former: Former

	constructor(props: P) {
		super(props)

		this.state = {
			phone_number: "",
			password: "",
			showPassword: false,
			button_pressed: false,
			loading: false,
			school: initSchool(),
			redirect: false
		}

		this.former = new Former(this, [])

	}

	onLoad = () => {

		if (this.state.phone_number === "") {
			return alert("please enter phone number")
		}

		this.props.loadProfile(this.state.phone_number)

		this.setState({
			loading: true,
		})

		setTimeout(() => {
			this.setState({
				button_pressed: true
			})
		}, 5000)
	}

	onSave = () => {
		// create profile and authenticate

		const number = this.state.phone_number;
		const password = this.state.password;
		const profile = this.state.school;

		if (profile === undefined) {
			alert("please fill out profile");
			return;
		}

		if (!number) {
			alert("Phone Number is required")
		}

		if (!number.startsWith("03")) {
			return alert("phone number must start with 03")
		}

		if (number.length > 11 || number.length < 11) {
			return alert("please enter a valid number")
		}

		if (!password) {
			alert("Password is required")
		}

		if (!profile.school_name) {
			alert("school name is required")
		}

		if (!profile.school_district) {
			alert("school district is required")
		}

		if (password && profile.school_name && profile.school_district) {
			this.props.createAccount(number, password, {
				...profile,
				phone_number: number
			})
		}

	}

	componentWillReceiveProps(nextProps: P) {
		if (nextProps.profile && Object.keys(nextProps.profile).length > 0) {
			this.setState({
				school: JSON.parse(JSON.stringify(nextProps.profile)),
				button_pressed: true
			})
		}
		this.setState({
			loading: false
		})

		if (nextProps.auth.token) {
			this.setState({
				redirect: true
			})
		}
	}

	handleClickShowPassword = () => {
		this.setState({ showPassword: !this.state.showPassword })
	}

	handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	}

	render() {

		if (this.state.redirect) {
			return <Redirect to="/" />
		}

		const { password, showPassword, phone_number, school } = this.state

		return (
			<div className="register-account">
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
					error={phone_number.length < 11 || phone_number.length > 11}
					{...this.former.super_handle(["phone_number"])}
				/>

				<FormControl variant="outlined" component="section" style={{ marginTop: 5 }} fullWidth>
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

				<SchoolForm school={school} former={this.former} base_path={["school"]} />
				<Box width="1" style={{ textAlign: "center" }} >
					<Button
						style={{ width: "20ch", marginBottom: 20, marginTop: 20, background: "#f05967", color: "white", borderRadius: "32px", fontWeight: "bold", fontSize: "1.25rem" }}
						variant="contained"
						onClick={this.onSave}>
						Register
					</Button>
				</Box>
			</div>
		)
	}
}

export default connect((state: RootReducerState) => ({
	connected: state.connected,
	profile: state.sync_state.profile,
	auth: state.auth
}), (dispatch: Function) => ({
	loadProfile: (number: string) => dispatch(loadProfile(number)),
	createAccount: (number: string, password: string, profile: Partial<CERPSchool>) => dispatch(signUp(number, password, profile))
}))(SignUp)
