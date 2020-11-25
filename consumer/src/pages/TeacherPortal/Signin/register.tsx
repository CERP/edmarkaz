import * as React from 'react'
import { connect } from 'react-redux'
import { Typography, Button, TextField, FormControl, Box } from '@material-ui/core'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import IconButton from '@material-ui/core/IconButton'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import InputLabel from '@material-ui/core/InputLabel'
import InputAdornment from '@material-ui/core/InputAdornment'
import { loadProfile, signUp } from 'actions'
import Former from 'former'
import LoadingIcon from '../../../icons/load.svg'

import '../../SignUp/style.css'

type P = {
	auth: RootReducerState['auth'];
	profile: RootReducerState['sync_state']['profile'];
	client_id: string
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
}

export const Span = (): any => <span style={{ color: "#FF6347" }}>{`* `}</span>

class TeacherRegister extends React.Component<P, S> {

	former: Former

	constructor(props: P) {
		super(props)

		this.state = {
			phone_number: "",
			password: "",
			showPassword: false,
			button_pressed: false,
			loading: false,
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
		const number = this.state.phone_number;
		const password = this.state.password;

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

		if (password) {
			this.props.createAccount(number, password, {
				phone_number: number
			})
		}

	}

	componentWillReceiveProps(nextProps: P) {
		if (nextProps.profile && Object.keys(nextProps.profile).length > 0) {
			this.setState({
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

		const { auth } = this.props

		if (auth.loading) {
			return <div className="loading">
				<img className="icon" src={LoadingIcon} alt="loading" />
				<div className="text">Loading, might take a few seconds depending on your connection speed</div>
			</div>
		}

		if (this.state.redirect) {
			setTimeout(() => {
				window.location.replace("/school")
			}, 1500)
		}

		const { password, showPassword, phone_number } = this.state

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
						defaultValue={password}
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
						labelWidth={55}
					/>
				</FormControl>

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
	auth: state.auth,
	client_id: state.client_id
}), (dispatch: Function) => ({
	loadProfile: (number: string) => dispatch(loadProfile(number)),
	createAccount: (number: string, password: string, profile: Partial<CERPSchool>) => dispatch(signUp(number, password, profile))
}))(TeacherRegister)
