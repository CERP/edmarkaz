import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import { Typography, Button, TextField, FormControl, Box } from '@material-ui/core'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import IconButton from '@material-ui/core/IconButton'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import InputLabel from '@material-ui/core/InputLabel'
import InputAdornment from '@material-ui/core/InputAdornment'
import { AppUserRole } from 'constants/app'


type P = {
	auth: RootReducerState['auth']
	createLogin: (number: string, password: string) => void
}

type S = {
	phone_number: string
	password: string
	showPassword: boolean
}

export const TeacherLogin: React.FC<P> = ({ auth, createLogin }) => {

	const [state, setState] = useState<S>({
		phone_number: "",
		password: "",
		showPassword: false
	})

	const { phone_number, password, showPassword } = state

	const handle_change = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		setState({ ...state, [name]: value })
	}

	const login = () => {
		createLogin(phone_number, password)
	}

	if (auth.token && auth.user === AppUserRole.TEACHER) {
		return <Redirect exact from="/teacher-login" to="/teacher" />
	}

	return <>
		<Typography
			variant="h4"
			align="left"
			style={{ marginTop: 20, fontFamily: "futura" }}
			color="primary" >Sign In </Typography>
		<TextField
			variant="outlined"
			label="Phone Number"
			margin="normal"
			fullWidth
			placeholder="e.g. 0300 1110000"
			type="number"
			name="phone_number"
			error={!phone_number.startsWith('03') || phone_number.length < 11 || phone_number.length > 11}
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
		<Box width="1" style={{ textAlign: "center" }} >
			<Button
				className=""
				disabled={!password || !phone_number || !phone_number.startsWith('03') || phone_number.length < 11 || phone_number.length > 11}
				style={{ width: "20ch", margin: "auto", marginBottom: 20, marginTop: 20, background: "#f05967", color: "white", borderRadius: "32px", fontWeight: "bold", fontSize: "1.25rem" }}
				variant="contained"
				onClick={login}
			>
				Sign In
			</Button>
		</Box>
		<Typography variant="subtitle1">
			New here? Create an Account
		</Typography>
	</>

}
