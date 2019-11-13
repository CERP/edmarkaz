import React from 'react'
import { connect } from 'react-redux'
import Former from '~/src/utils/former'

import { clearDB } from '~/src/utils/localStorage'

import { addSupplierNumber, deleteSupplierNumber, saveSupplierLogo, saveSupplierBanner } from '~/src/actions'
import { getDownsizedImage, getImageString } from '~src/utils/image'
import { v4 } from 'node-uuid'

interface propTypes {
	numbers: RootBankState['sync_state']['numbers'];
	logo: RootBankState['sync_state']['logo']
	banner: RootBankState['sync_state']['banner']
	addNumber: (number: string, name: string) => void
	removeNumber: (number: string) => void
	saveLogo: (imageId: string, dataUrl: string) => void
	saveBanner: (imageId: string, dataUrl: string) => void
}

interface stateType {
	current_number: string;
	current_name: string;
	logoDataString: string;
	bannerDataString: string
}

class Settings extends React.Component<propTypes, stateType> {

	former: Former

	constructor(props: propTypes) {
		super(props)

		this.state = {
			current_number: "",
			current_name: "",
			logoDataString: "",
			bannerDataString: ""
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
		window.location.reload();
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

	render() {

		return <div className="page">
			<div className="title">Settings</div>

			<div className="form" style={{ width: "90%" }}>

				<div className="row">
					<label>Supplier Name</label>
					<input type="text" {...this.former.super_handle(["supplier_name"])} placeholder="Supplier Name" />
				</div>

				<div className="row">
					<label>Change Logo</label>
					<input type="file" accept="image/*" onChange={this.uploadLogo} />
				</div>

				<div className="row">
					<label>Current Logo</label>
					<img className="logo-preview" src={this.state.logoDataString || this.props.logo.url} />
				</div>

				<div className="row">
					<label>Change Banner Image</label>
					<input type="file" accept="image/*" onChange={this.uploadBanner} />
				</div>

				<div className="row">
					<label>Current Logo</label>
					<img className="logo-preview" src={this.state.bannerDataString || this.props.banner.url} />
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
	logo: state.sync_state.logo || {},
	banner: state.sync_state.banner || {}
}), (dispatch: (x: any) => void) => ({
	addNumber: (number: string, name: string) => dispatch(addSupplierNumber(number, name)),
	removeNumber: (number: string) => dispatch(deleteSupplierNumber(number)),
	saveLogo: (imageId: string, dataUrl: string) => dispatch(saveSupplierLogo(imageId, dataUrl)),
	saveBanner: (imageId: string, dataUrl: string) => dispatch(saveSupplierBanner(imageId, dataUrl))
}))(Settings)