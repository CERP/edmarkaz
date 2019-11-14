import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, Redirect } from 'react-router'

import { loadProfile, signUp } from '../../actions'
import Former from 'former'

import { SchoolForm } from './form'

import './style.css'

type P = {
	auth: RootReducerState['auth'];
	profile: RootReducerState['sync_state']['profile'];
	loadProfile: (number: string) => void;
	createAccount: (number: string, password: string, profile: CERPSchool) => void;

} & RouteComponentProps

type S = {
	phone_number: string;
	password: string;
	button_pressed: boolean;
	loading: boolean;
	redirect: boolean;

	school?: CERPSchool;
}

export const Span = (): any => <span style={{ color: "#FF6347"}}>{`* `}</span>

class SignUp extends React.Component<P, S> {

	former: Former

	constructor(props: P) {
		super(props)

		this.state = {
			phone_number: "0331",
			password: "",
			button_pressed: false,
			loading: false,
			school: undefined,
			redirect: false
		}

		this.former = new Former(this, [])

	}

	onLoad = () => {

		if (this.state.phone_number === "") {
			return alert("please enter phone number")
		}

		this.props.loadProfile(this.state.phone_number)

		this.setState({
			loading: true,
		})

		setTimeout(() => {
			this.setState({
				button_pressed: true
			})
		}, 5000)
	}

	onSave = () => {
		// create profile and authenticate

		const number = this.state.phone_number;
		const password = this.state.password;
		const profile = this.state.school;

		if (profile === undefined) {
			alert("please fill out profile");
			return;
		}

		if (!number) {
			alert("Phone Number is required")
		}

		if (!password) {
			alert("Password is required")
		}

		if (!profile.school_name) {
			alert("school name is required")
		}

		if (!profile.school_district) {
			alert("school district is required")
		}

		if (password && profile.school_name && profile.school_district) {
			this.props.createAccount(number, password, profile)
		}

	}

	componentWillReceiveProps(nextProps: P) {
		if (nextProps.profile && Object.keys(nextProps.profile).length > 0) {
			this.setState({
				school: JSON.parse(JSON.stringify(nextProps.profile)),
				button_pressed: true
			})
		}
		this.setState({
			loading: false
		})

		if (nextProps.auth.token) {
			this.setState({
				redirect: true
			})
		}
	}

	render() {

		if (this.state.redirect) {
			return <Redirect to="/" />
		}


		return <div className="sign-up">

			<div className="form">
				<div className="title">Sign Up</div>
				<div className="subtitle">
					<Span/>
					Required Information
				</div>

				<div className="row">
					<div className="subtitle">Phone Number <Span/></div>
					<input type="tel" {...this.former.super_handle(["phone_number"])} />
				</div>

				<div className="row">
					<div className="subtitle">Password <Span/></div>
					<input type="text" {...this.former.super_handle(["password"])} />
				</div>

				<div className="row">
					<div className="tabs-button" onClick={this.onLoad}>Load Data</div>
				</div>

				{this.state.loading && <div>Loading...</div>}
			</div>
			{this.state.button_pressed && <SchoolForm school={this.state.school} former={this.former} base_path={["school"]} />}
			{this.state.button_pressed && <div className="tabs-button" style={{ marginTop: "10px",marginBottom: "10px"}} onClick={this.onSave}>Sign Up</div>}
		</div>
	}
}

export default connect((state: RootReducerState) => ({
	connected: state.connected,
	profile: state.sync_state.profile,
	auth: state.auth
}), (dispatch: Function) => ({
	loadProfile: (number: string) => dispatch(loadProfile(number)),
	createAccount: (number: string, password: string, profile: CERPSchool) => dispatch(signUp(number, password, profile))
}))(SignUp)
