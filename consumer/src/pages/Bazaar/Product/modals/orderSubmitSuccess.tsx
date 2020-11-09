import React from 'react'
import { Typography } from '@material-ui/core'

type P = {
	handleModalClose: () => void
}

const OrderSubmitSuccess: React.FC<P> = ({ handleModalClose }) => {

	return (<>
		<Typography gutterBottom variant="h4" align="center">Order Request</Typography>
		<Typography gutterBottom variant="body1" align="left">Your order request has been submitted. Our call representative will contact soom</Typography>
		<div style={{ marginTop: 10 }}>
			<button className="button save" onClick={handleModalClose}> Close </button>
		</div>
	</>)
}

export { OrderSubmitSuccess }