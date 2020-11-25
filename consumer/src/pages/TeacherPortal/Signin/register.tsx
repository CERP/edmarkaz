import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Typography, Button, TextField, FormControl, Box, MenuItem } from '@material-ui/core'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import IconButton from '@material-ui/core/IconButton'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import InputLabel from '@material-ui/core/InputLabel'
import InputAdornment from '@material-ui/core/InputAdornment'
import { signUp } from 'actions'

import '../../SignUp/style.css'

type P = {
	profile: RootReducerState['teacher_portal']['profile'];
	createAccount: (number: string, password: string, profile: Partial<TeacherProfile>) => void;
}

type S = {
	phone_number: string;
	password: string;
	gender: string;
	name: string;
	showPassword: boolean
	redirect: boolean;
}

const TeacherRegister: React.FC<P> = ({ profile, createAccount }) => {

	const [state, setState] = useState<S>({
		phone_number: "",
		password: "",
		gender: "",
		name: "",
		showPassword: false,
		redirect: false
	})

	const handleChange = (type: string, event: any) => {
		setState({ ...state, [type]: event.target.value });
	}

	const onSave = () => {
		const number = state.phone_number;
		const password = state.password;

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
			createAccount(number, password, {
				...profile,
				//@ts-ignore
				phone_number: number
			})
		}

	}

	const handleClickShowPassword = () => {
		setState({ ...state, showPassword: !state.showPassword })
	}

	const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	}

	if (state.redirect) {
		setTimeout(() => {
			window.location.replace("/teacher")
		}, 1500)
	}

	const { password, showPassword, phone_number } = state

	return (
		<div className="register-account">
			<Typography
				variant="h4"
				align="left"
				style={{ margin: "10px 0px", fontFamily: "futura" }}
				color="primary" >Register your Account </Typography>

			<TextField
				variant="outlined"
				label="Name"
				margin="normal"
				fullWidth
				placeholder="Name"
				type="text"
				onChange={(event) => handleChange("name", event)}
			/>
			<TextField
				variant="outlined"
				label="Phone Number"
				margin="normal"
				fullWidth
				placeholder="e.g. 0300 1110000"
				type="number"
				error={phone_number.length < 11 || phone_number.length > 11}
				onChange={(event) => handleChange("phone_number", event)}
			/>

			<FormControl variant="outlined" component="section" style={{ marginTop: 5 }} fullWidth>
				<InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
				<OutlinedInput
					id="outlined-adornment-password"
					type={showPassword ? 'text' : 'password'}
					defaultValue={password}
					onChange={(event) => handleChange("password", event)}
					endAdornment={
						<InputAdornment position="end">
							<IconButton
								aria-label="toggle password visibility"
								onClick={handleClickShowPassword}
								onMouseDown={handleMouseDownPassword}
								edge="end"
							>
								{showPassword ? <Visibility /> : <VisibilityOff />}
							</IconButton>
						</InputAdornment>
					}
					labelWidth={55}
				/>
			</FormControl>
			<TextField
				style={{ marginTop: 10 }}
				variant="outlined"
				select
				label="Gender"
				fullWidth
				onChange={(event) => handleChange("gender", event)}
			>
				<MenuItem value="M">Male</MenuItem>
				<MenuItem value="F">Female</MenuItem>
			</TextField>
			<Box width="1" style={{ textAlign: "center" }} >
				<Button
					style={{ width: "20ch", marginBottom: 20, marginTop: 20, background: "#f05967", color: "white", borderRadius: "32px", fontWeight: "bold", fontSize: "1.25rem" }}
					variant="contained"
					onClick={onSave}>
					Register
					</Button>
			</Box>
		</div>
	)
}

export default connect((state: RootReducerState) => ({
	profile: state.teacher_portal.profile,
}), (dispatch: Function) => ({
	//@ts-ignore
	createAccount: (number: string, password: string, profile: Partial<TeacherProfile>) => dispatch(signUp(number, password, profile))
}))(TeacherRegister)
