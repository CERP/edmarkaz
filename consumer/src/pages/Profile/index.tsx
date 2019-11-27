import * as React from 'react'
import { connect } from 'react-redux'
import Former from 'former'

import { SchoolForm } from '../SignUp/form'
import { RouteComponentProps } from 'react-router'
import './style.css'

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

		console.log("PROFILE", this.state.profile)

		return <div className="user-profile">
			<SchoolForm school={this.state.profile} former={this.former} base_path={["profile"]} />
			<div className="tabs-button red" onClick={this.onLogout}>Logout</div>
			<div className="tabs-button save" onClick={this.onSave}>Save</div>
		</div>
	}
}

export default connect((state: RootReducerState) => ({
	school: state.sync_state.profile
}))(Profile)