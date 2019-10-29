import * as React from 'react'
import { connect } from 'react-redux'
import Former from 'former'

import { SchoolForm } from '../SignUp/form'
import { RouteComponentProps } from 'react-router'

type P = {
	school: Partial<CERPSchool>

} & RouteComponentProps;

interface S {


}

class Profile extends React.Component<P, S> {

	former: Former
	constructor(props : P) {
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

	render() {

		return <div className="user-profile page">
			<div className="title">Profile</div>

			<SchoolForm school={this.props.school} former={this.former} base_path={["profile"]} />

		</div>
	}
}

export default connect((state : RootReducerState) => ({
	school: state.sync_state.profile
}))(Profile)