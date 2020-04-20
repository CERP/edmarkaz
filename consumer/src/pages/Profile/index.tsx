import * as React from 'react'
import { connect } from 'react-redux'
import Former from 'former'

import { SchoolForm } from '../SignUp/form'
import { RouteComponentProps } from 'react-router'
import './style.css'
import { Typography, Container, Paper, Button } from '@material-ui/core'

type P = {
	school: Partial<CERPSchool>;

} & RouteComponentProps;

interface S {

	profile: Partial<CERPSchool>

}

class Profile extends React.Component<P, S> {

	former: Former
	constructor(props: P) {
		super(props)

		this.state = {
			profile: JSON.parse(JSON.stringify(this.props.school)) as Partial<CERPSchool>
		}

		this.former = new Former(this, [])
	}

	onSave = () => {
		// TODO: create "update profile" action
		// should just be a sync, set up a consumer genserver
	}

	onLogout = () => {

		localStorage.removeItem("auth")
		localStorage.removeItem("sync_state")
		window.history.pushState(undefined, '', '/')
		window.location.reload()

	}

	render() {

		const { phone_number } = this.state.profile
		const st = phone_number ? phone_number.split("").reverse().join("").substring(0, phone_number.length - 1) : ""
		return <div className="user-profile">
			<Container maxWidth="sm">
				<Paper className="section" style={{ border: "none" }}>
					<Typography variant="h5" style={{ fontFamily: "futura" }}>Student Referral</Typography>
					<label style={{ userSelect: "auto" }}> {`https://ilmexchange.com/student?referral=${st}`}</label>
				</Paper>
				<SchoolForm school={this.state.profile} former={this.former} base_path={["profile"]} />
				<Button color="primary" variant="contained" fullWidth style={{ marginTop: "20px" }} onClick={this.onSave}> Save</Button>
				<Button color="secondary" variant="contained" fullWidth style={{ margin: "10px 0px" }} onClick={this.onLogout}>Logout</Button>
			</Container>
		</div>
	}
}

export default connect((state: RootReducerState) => ({
	school: state.sync_state.profile
}))(Profile)