import React from 'react'
import { connect } from 'react-redux'
import Former from '~/src/utils/former'

import { clearDB } from '~/src/utils/localStorage'

import { addSupplierNumber, deleteSupplierNumber, saveSupplierLogo, saveSupplierBanner, saveSupplierProfile } from '~/src/actions'
import { getDownsizedImage, getImageString } from '~src/utils/image'
import { v4 } from 'node-uuid'

interface propTypes {
	numbers: RootBankState['sync_state']['numbers']
	profile: RootBankState['sync_state']['profile']
	addNumber: (number: string, name: string) => void
	removeNumber: (number: string) => void
	saveLogo: (imageId: string, dataUrl: string) => void
	saveBanner: (imageId: string, dataUrl: string) => void
	saveProfile: (name: string, description: string) => void
}

interface stateType {
	current_number: string
	current_name: string
	logoDataString: string
	bannerDataString: string

	name: string
	description: string
}

class Settings extends React.Component<propTypes, stateType> {

	former: Former

	constructor(props: propTypes) {
		super(props)

		const profile = props.profile

		this.state = {
			current_number: "",
			current_name: "",
			logoDataString: "",
			bannerDataString: "",

			name: profile.name || "",
			description: profile.description || ""

		}

		this.former = new Former(this, [])
	}

	addNumber = () => {

		this.props.addNumber(this.state.current_number, this.state.current_name)

		this.setState({
			current_name: "",
			current_number: ""
		})
	}

	removeNumber = (number: string) => () => {
		this.props.removeNumber(number)
	}

	componentWillReceiveProps(nextProps: propTypes) {
	}

	onLogout = () => {
		clearDB();
		setTimeout(() => {
			window.location.reload();
		}, 1000)
	}


	uploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {

		getImageString(e)
			.then(res => getDownsizedImage(res, 544))
			.then(imgString => {
				this.setState({
					logoDataString: imgString
				})

				this.props.saveLogo(v4(), imgString)
			})
	}

	uploadBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
		getImageString(e)
			.then(res => getDownsizedImage(res, 544))
			.then(imgString => {
				this.setState({
					bannerDataString: imgString
				})

				this.props.saveBanner(v4(), imgString)
			})
	}

	save = () => {
		this.props.saveProfile(this.state.name, this.state.description)
	}

	render() {

		const profile = this.props.profile

		const curr_banner_url = profile.banner && profile.banner.url
		const curr_logo_url = profile.logo && profile.logo.url

		return <div className="page">
			<div className="title">Settings</div>

			<div className="form" style={{ width: "90%" }}>

				<div className="row">
					<label>Supplier Display Name</label>
					<input type="text" {...this.former.super_handle(["name"])} placeholder="Supplier Display Name" />
				</div>

				<div className="row">
					<label>Supplier Description</label>
					<input type="text" {...this.former.super_handle(["description"])} placeholder="Supplier Description" />
				</div>

				<div className="row">
					<div className="button green" onClick={this.save}>Save</div>
				</div>

				<div className="row">
					<label>Change Logo</label>
					<input type="file" accept="image/*" onChange={this.uploadLogo} />
				</div>

				<div className="row">
					<label>Current Logo</label>
					<img className="logo-preview" src={this.state.logoDataString || curr_logo_url} />
				</div>

				<div className="row">
					<label>Change Banner Image</label>
					<input type="file" accept="image/*" onChange={this.uploadBanner} />
				</div>

				<div className="row">
					<label>Current Logo</label>
					<img className="logo-preview" src={this.state.bannerDataString || curr_banner_url} />
				</div>

				<div className="divider">Add New Number</div>
				<div className="row">
					<label>Number</label>
					<input type="tel" {...this.former.super_handle(["current_number"])} placeholder="New Number" />
				</div>
				<div className="row">
					<label>Name</label>
					<input type="text" {...this.former.super_handle(["current_name"])} placeholder="Name" />
				</div>
				<div className="button green" onClick={this.addNumber}>Add Number</div>

				<div className="divider">Existing Numbers</div>
				{
					Object.entries(this.props.numbers)
						.map(([number, info]) => {
							return <div className="row" key={number}>
								<div>{info.name}</div>
								<div>{number}</div>
								<div className="button red" onClick={this.removeNumber(number)} style={{
									padding: "5px 10px",
									borderRadius: "50%",
									width: "initial"
								}}>X</div>
							</div>
						})
				}

				<div className="button red" onClick={this.onLogout}>Logout</div>
			</div>
		</div>

	}
}

export default connect((state: RootBankState) => ({
	numbers: state.sync_state.numbers || {},
	profile: state.sync_state.profile || {}
}), (dispatch: (x: any) => void) => ({
	addNumber: (number: string, name: string) => dispatch(addSupplierNumber(number, name)),
	removeNumber: (number: string) => dispatch(deleteSupplierNumber(number)),
	saveLogo: (imageId: string, dataUrl: string) => dispatch(saveSupplierLogo(imageId, dataUrl)),
	saveBanner: (imageId: string, dataUrl: string) => dispatch(saveSupplierBanner(imageId, dataUrl)),
	saveProfile: (name: string, description: string) => dispatch(saveSupplierProfile(name, description))
}))(Settings)