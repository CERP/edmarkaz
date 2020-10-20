import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Typography, TextField, MenuItem } from '@material-ui/core'
import { getDistricts } from 'constants/index'

const useStyles = makeStyles((theme) => ({
	root: {
		'& > *': {
			margin: theme.spacing(1),
			width: 'calc(100% - 16px)'
		}
	}
}))

type P = {
	handleModalClose?: () => void
}

const OrderRequestSubmit: React.FC<P> = ({ handleModalClose }) => {

	const classes = useStyles()

	return (<>
		<Typography gutterBottom variant="h4" align="center">Order Details Form</Typography>
		<form className={classes.root} noValidate autoComplete="off">
			<TextField name="name" label="Your Name" variant="outlined" placeholder="e.g. Aslam" />
			<TextField name="phone" type="number" label="Your Phone" variant="outlined" placeholder="e.g. 03014869789" />
			<TextField name="address" label="Delivery Address" placeholder="" type="text" variant="outlined" />
			{/* <TextField
				style={{ marginTop: 10 }}
				variant="outlined"
				select
				label="District"
				fullWidth
			>
				{
					getDistricts().map(district => <MenuItem value={district}>{district}</MenuItem>)
				}
			</TextField> */}
			<div className="">
				<button className="button save"> Submit Order Request </button>
			</div>
			<div className="">
				<button className="button cancel" onClick={handleModalClose}> Cancel </button>
			</div>
		</form>
	</>)
}

export { OrderRequestSubmit }