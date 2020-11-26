import React, { useState } from 'react'
import { Typography, Button, TextField, FormControl, Box, MenuItem } from '@material-ui/core'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import IconButton from '@material-ui/core/IconButton'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import InputLabel from '@material-ui/core/InputLabel'
import InputAdornment from '@material-ui/core/InputAdornment'

import '../../SignUp/style.css'

type P = {
	validation: (number: string, password: string) => void;
	createAccount: (number: string, password: string, profile: Partial<TeacherProfile>) => void;
}

type S = {
	phone_number: string
	password: string
	gender?: "M" | "F"
	name: string
	showPassword: boolean
}

const TeacherRegister: React.FC<P> = ({ validation, createAccount }) => {

	const [state, setState] = useState<S>({
		phone_number: "",
		password: "",
		gender: "M",
		name: "",
		showPassword: false,
	})

	const { phone_number, password, gender, name, showPassword } = state

	const handle_change = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		setState({ ...state, [name]: value })
	}

	const onSave = () => {

		validation(phone_number, password)

		if (password) {
			createAccount(phone_number, password, {
				phone: phone_number,
				gender: gender,
				name: name
			})
		}
	}

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
				name="name"
				onChange={handle_change}
			/>
			<TextField
				variant="outlined"
				label="Phone Number"
				margin="normal"
				fullWidth
				placeholder="e.g. 0300 1110000"
				type="number"
				name="phone_number"
				error={phone_number.length < 11 || phone_number.length > 11}
				onChange={handle_change}
			/>
			<FormControl variant="outlined" component="section" style={{ marginTop: 5 }} fullWidth>
				<InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
				<OutlinedInput
					id="outlined-adornment-password"
					type={showPassword ? 'text' : 'password'}
					defaultValue={password}
					name="password"
					onChange={handle_change}
					endAdornment={
						<InputAdornment position="end">
							<IconButton
								aria-label="toggle password visibility"
								onClick={() => setState({ ...state, showPassword: !state.showPassword })}
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
				name="gender"
				onChange={handle_change}
			>
				<MenuItem value="M">Male</MenuItem>
				<MenuItem value="F">Female</MenuItem>
			</TextField>
			<Box width="1" style={{ textAlign: "center" }} >
				<Button
					style={{ width: "20ch", margin: "auto", marginBottom: 20, marginTop: 20, background: "#f05967", color: "white", borderRadius: "32px", fontWeight: "bold", fontSize: "1.25rem" }}
					variant="contained"
					onClick={onSave}>
					Register
					</Button>
			</Box>
		</div>
	)
}

export { TeacherRegister };
