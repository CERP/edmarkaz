import * as React from 'react'
import { connect } from 'react-redux'
import Former from 'former'

import { SchoolForm } from '../SignUp/form'
import { RouteComponentProps } from 'react-router'
import './style.css'
import { TextField } from '@material-ui/core'

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
		window.history.pushState(undefined, '', '/')
		window.location.reload()

	}

	render() {

		const { phone_number } = this.state.profile
		const st = phone_number ? phone_number.split("").reverse().join("").substring(0, phone_number.length - 1) : ""
		return <div className="user-profile">

			<div className="referral section">
				<div className="title">Student Referral </div>
				<label style={{ userSelect: "auto" }}> {`https://ilmexchange.com/student?referral=${st}`}</label>
			</div>

			<SchoolForm school={this.state.profile} former={this.former} base_path={["profile"]} />
			<div className="tabs-button red" onClick={this.onLogout}>Logout</div>
			<div className="tabs-button" onClick={this.onSave} style={{ marginTop: "10px" }}>Save</div>
		</div>
	}
}

export default connect((state: RootReducerState) => ({
	school: state.sync_state.profile
}))(Profile)