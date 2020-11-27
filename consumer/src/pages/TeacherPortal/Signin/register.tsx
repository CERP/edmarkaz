import React, { useState } from 'react'
import { Typography, Button, TextField, FormControl, Box, MenuItem } from '@material-ui/core'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import IconButton from '@material-ui/core/IconButton'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import InputLabel from '@material-ui/core/InputLabel'
import InputAdornment from '@material-ui/core/InputAdornment'

type P = {
	createAccount: (number: string, password: string, profile: Partial<TeacherProfile>) => void
}

type S = Partial<TeacherProfile> & {
	phone_number: string
	password: string
	showPassword: boolean
}

export const TeacherRegister: React.FC<P> = ({ createAccount }) => {

	const [state, setState] = useState<S>({
		phone_number: "",
		password: "",
		gender: "M",
		name: "",
		school_name: '',
		showPassword: false,
	})

	const { phone_number, password, gender, name, showPassword, school_name } = state

	const handle_change = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		setState({ ...state, [name]: value })
	}

	const onSave = () => {
		if (password) {
			createAccount(phone_number, password, {
				phone: phone_number,
				gender,
				name,
				school_name
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
				style={{ marginTop: 10 }}
				fullWidth
				placeholder="Name"
				type="text"
				name="name"
				onChange={handle_change}
			/>
			<TextField
				variant="outlined"
				label="Phone Number"
				style={{ marginTop: 10 }}
				fullWidth
				placeholder="e.g. 0300 1110000"
				type="number"
				name="phone_number"
				error={!phone_number.startsWith('03') || phone_number.length < 11 || phone_number.length > 11}
				onChange={handle_change}
			/>

			<TextField
				variant="outlined"
				label="School Name"
				style={{ marginTop: 10 }}
				fullWidth
				placeholder="School Name"
				type="text"
				name="school_name"
				onChange={handle_change}
			/>

			<FormControl variant="outlined" component="section" style={{ marginTop: 10 }} fullWidth>
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
				style={{ marginTop: 10, marginBottom: 20 }}
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
					disabled={!name || !password || !phone_number || !phone_number.startsWith('03')}
					style={{ width: "20ch", background: "#f05967", color: "white", borderRadius: "32px", fontWeight: "bold", fontSize: "1.25rem" }}
					variant="contained"
					onClick={onSave}>
					Register
					</Button>
			</Box>
		</div>
	)
}
