import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Typography, TextField } from '@material-ui/core'
import { getDistricts } from 'constants/index'
import { checkCompulsoryFields, toTitleCase } from 'utils/generic'
import { grey } from '@material-ui/core/colors'

const useStyles = makeStyles((theme) => ({
	root: {
		'& > *': {
			margin: theme.spacing(1),
			width: 'calc(100% - 16px)'
		}
	}
}))

type P = {
	productLocation: string
	handleRequestSubmit: (request: OrderRequestForm) => void
	handleModalClose: () => void
}

const OrderRequestSubmit: React.FC<P> = ({ handleModalClose, handleRequestSubmit, productLocation }) => {

	const classes = useStyles()

	const initialState = {
		school_owner: '',
		phone_number: '',
		school_name: '',
		school_address: '',
		school_district: ''
	}

	const [state, setState] = useState<OrderRequestForm>(initialState)

	const handle_change = (e: React.ChangeEvent<HTMLInputElement & HTMLSelectElement>) => {
		const { name, value } = e.target
		setState({ ...state, [name]: value })
	}

	const handle_submit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		console.log("product location", productLocation)


		const check = checkCompulsoryFields(state, [...Object.keys(state)])

		if (check) {
			window.alert("Please fill all required fields")
			return
		}

		// if (productLocation ? productLocation.includes(state.location) : true) {
		handleRequestSubmit(state)
		// } else {
		// 	window.alert("Sorry this product is not available in this selected district")
		// }
	}

	return (<>
		<Typography gutterBottom variant="h4" align="center">Order Details Form</Typography>
		<form className={classes.root} noValidate autoComplete="off" onSubmit={(e) => handle_submit(e)}>
			<TextField name="school_owner" label="Your Name" variant="outlined" onChange={handle_change} required={true} placeholder="e.g. Aslam" />
			<TextField name="phone_number" type="text" label="Your Phone" onChange={handle_change} required={true} variant="outlined" placeholder="e.g. 03014869789" />
			<TextField name="school_name" type="text" label="School Name" onChange={handle_change} required={true} variant="outlined" placeholder="e.g. The Nation School" />
			<TextField name="school_address" label="Delivery Address" onChange={handle_change} placeholder="" required={true} type="text" variant="outlined" />
			<select onChange={handle_change} name="school_district" style={{ height: 50, color: grey[500], borderRadius: 4 }} required={true}>
				<option value="">Select District</option>
				{
					getDistricts().sort().map(district => <option key={district} value={district}>{toTitleCase(district)}</option>)
				}
			</select>
			<div className="">
				<button className="button save" type="submit"> Submit Order Request </button>
			</div>
		</form>
		<div style={{ margin: 8 }}>
			<button type="button" className="button cancel" onClick={handleModalClose}> Cancel </button>
		</div>
	</>)
}

export { OrderRequestSubmit }