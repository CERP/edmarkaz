import * as React from 'react'
import poster from './poster.jpg'
import Header from '../../components/Header'
import './style.css'

function Challenge(props: any) {
	return <div>
		<Header path={"/"} />
		<div className="poster-div" >
			<h3 className="independence-heading">Happy Independence Day</h3>
			<div className="content-div">
				<img className="poster" src={poster} alt="img" />
			</div>
		</div >
	</div>
}

export default Challenge