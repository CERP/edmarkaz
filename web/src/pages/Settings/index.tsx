import React from 'react'
import { connect } from 'react-redux'
import Former from '~/src/utils/former'

import { clearDB } from '~/src/utils/localStorage'

import { addSupplierNumber, deleteSupplierNumber } from '~/src/actions'
import { getDownsizedImage } from '~src/utils/image'

interface propTypes {
	numbers: RootBankState['sync_state']['numbers'];
	addNumber: (number: string, name: string) => void;
	removeNumber: (number: string) => void;
}

interface stateType {
	current_number: string;
	current_name: string;
	logoDataString: string;
}

class Settings extends React.Component<propTypes, stateType> {

	former: Former

	constructor(props: propTypes) {
		super(props)

		this.state = {
			current_number: "",
			current_name: "",
			logoDataString: ""
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

		const file = e.target.files[0]
		if(file === undefined) {
			return
		}

		const reader = new FileReader();

		reader.onloadend = () => {
			const res = reader.result as string;

			getDownsizedImage(res, 544)
				.then(imgString => {

					this.setState({
						logoDataString: imgString
					})
				})
		}
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
					<label>Official Logo</label>
					<input type="file" accept="image/*" onChange={this.uploadLogo} />
				</div>

				<div className="divider">Add New Number</div>
				<div className="row">
					<label>Number</label>
					<input type="tel" {...this.former.super_handle(["current_number"])} placeholder="New Number"/>
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
									borderRadius: "50%"
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
	numbers: state.sync_state.numbers || {}
}), (dispatch: (x: any) => void) => ({
	addNumber: (number: string, name: string) => dispatch(addSupplierNumber(number, name)),
	removeNumber: (number: string) => dispatch(deleteSupplierNumber(number))
}))(Settings)