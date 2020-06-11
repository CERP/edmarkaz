import React from 'react'
import { connect } from 'react-redux'
import { Container, Typography, IconButton } from '@material-ui/core'
//@ts-ignore
import mis from '../../../icons/mis.ico'

interface P {
	auth: RootReducerState["auth"]
	client_id: string
	profile: RootReducerState["sync_state"]["profile"]
}

const SchoolDashboard: React.FC<P> = ({ auth, client_id, profile }) => {
	return <div style={{ marginTop: "20px", padding: "0px 30px", display: "flex", flexDirection: "column" }}>

		<Typography
			variant="h3"
			color="primary"
			align="center"
		>
			{`Welcome, ${profile.school_name}`}
		</Typography>
		<IconButton href={`https://localhost:3001/auto-login?id=${auth.id}&key=${auth.token}&cid=${client_id}&ref=${profile.refcode}`} edge="start" color="inherit" aria-label="menu" >
			<img src={mis} style={{ height: "100px" }} />
		</IconButton>
		<Typography
			variant="h6"
			color="primary"
			align="center"
		>
			Enter School Information
		</Typography>
	</div>
}


export default connect((state: RootReducerState) => ({
	auth: state.auth,
	client_id: state.client_id,
	profile: state.sync_state.profile
}))(SchoolDashboard)