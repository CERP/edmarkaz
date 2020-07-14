import React from 'react'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

import './style.css'

interface P {
	text: string
}

export default ({ text }: P) => {
	return <div className="alert-bar">
		<InfoOutlinedIcon />
		<div className="alert-text"> {text} </div>
	</div>
}