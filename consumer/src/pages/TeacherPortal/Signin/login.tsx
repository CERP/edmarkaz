import React from 'react'
import { Button, Typography, TextField, Box } from '@material-ui/core'

type P = {

}

const TeacherLogin: React.FC<P> = () => {
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