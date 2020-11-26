import React from 'react'
import { Container, Avatar, TextField } from '@material-ui/core'
import { connect } from 'react-redux'

import HelpFooter from 'components/Footer/HelpFooter'
import Layout from 'components/Layout'
import ilmxLogo from 'components/Header/ilmx.svg'


type P = {
	profile: RootReducerState["teacher_portal"]["profile"]
}

const TeacherProfile: React.FC<P> = ({ profile }) => {

	const { name, phone, gender } = profile
	const callLink = false ? "https://api.whatsapp.com/send?phone=923481119119" : "tel:0348-1119-119"

	return (
		<Layout>
			<div className="login-page">
				<Container maxWidth="sm">
					<div
						className="section"
						style={{
							border: "none",
							display: "flex",
							flexDirection: "column",
						}}>
						<Avatar variant="square" style={{
							height: "100%",
							width: "70%",
							margin: "auto"
						}} src={ilmxLogo} alt="ilmx-logo" />
					</div>
					<TextField
						variant="outlined"
						label="Name"
						margin="normal"
						fullWidth
						type="text"
						defaultValue={name}
					/>
					<TextField
						variant="outlined"
						label="Phone Number"
						margin="normal"
						fullWidth
						type="number"
						defaultValue={phone}
					/>
					<TextField
						variant="outlined"
						label="Gender"
						margin="normal"
						fullWidth
						type="text"
						defaultValue={gender}
					/>
				</Container>
				<HelpFooter hlink={callLink} />
			</div>
		</Layout>
	)
}

export default connect((state: RootReducerState) => ({
	profile: state.teacher_portal.profile
}))(TeacherProfile)