import React, { useState } from 'react'
import { Typography, Button, TextField, FormControl, Box } from '@material-ui/core'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import IconButton from '@material-ui/core/IconButton'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import InputLabel from '@material-ui/core/InputLabel'
import InputAdornment from '@material-ui/core/InputAdornment'

type P = {

}

const TeacherLogin: React.FC<P> = () => {

	const [state, setState] = useState({
		phone_number: "",
		password: "",
		showPassword: false,
	})

	const handleClickShowPassword = () => {
		setState({ ...state, showPassword: !state.showPassword })
	}

	const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	}

	const inputFieldHandler = () => {

	}

	const { phone_number, password, showPassword } = state

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
		/>
		<FormControl variant="outlined" component="section" style={{ marginTop: 5 }} fullWidth>
			<InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
			<OutlinedInput
				id="outlined-adornment-password"
				type={showPassword ? 'text' : 'password'}
				defaultValue={password}
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
		<Box width="1" style={{ textAlign: "center" }} >
			<Button
				style={{ width: "20ch", margin: "auto", marginBottom: 20, marginTop: 20, background: "#f05967", color: "white", borderRadius: "32px", fontWeight: "bold", fontSize: "1.25rem" }}
				variant="contained"
			>
				Sign In
			</Button>
		</Box>
		<Typography variant="subtitle1">
			New here? Create an Account
		</Typography>
	</>

}

export { TeacherLogin }