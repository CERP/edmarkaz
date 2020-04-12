import * as React from 'react'
import { connect } from 'react-redux'
import Former from 'former'

import { SchoolForm } from '../SignUp/form'
import { RouteComponentProps } from 'react-router'
import './style.css'
import { TextField, Divider, Typography, MenuItem, CssBaseline } from '@material-ui/core'

type P = {
	school: Partial<CERPSchool>;
} & RouteComponentProps;

interface S {
	profile: Partial<CERPSchool>
}

class SchoolProfile extends React.Component<P, S> {

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
		const {
			school_name,
			school_address,
			school_district,
			school_tehsil,
			total_enrolment,
			lowest_fee,
			highest_fee,
			respondent_owner
		} = this.state.profile

		return <div className="school-profile">
			<CssBaseline />
			<form>
				<div className="heading">
					School Information
			</div>
				<TextField
					label="School Name"

				/>
				<TextField
					label="Address"
				/>
				<TextField
					select
					label="District"
					helperText="Please select your district"
				>
					<MenuItem value="Hello"> Hello</MenuItem>
					<MenuItem value="Hello"> Hello</MenuItem>
					<MenuItem value="Hello"> Hello</MenuItem>
				</TextField>
				<div>
					<TextField
						select
						label="Tehsil"
						helperText="Please select your Tehsil"
					>
						<MenuItem value="Hello"> Hello</MenuItem>
					</TextField>
				</div>
				<Divider />
				{/* <div className="heading">
				Additional Information
			</div> */}
				<TextField
					label="Enrollment"
				/>
				<TextField
					label="Lowest Fee"
				/>
				<TextField
					label="Highest Fee"
				/>
				<TextField
					label="Owner"
				/>
			</form>
		</div >
	}
}
export default connect((state: RootReducerState) => ({
	school: state.sync_state.profile
}))(SchoolProfile)
