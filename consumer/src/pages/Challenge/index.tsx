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
				<div className="quotes">
					"Pakistan not only means freedom and independence but the Muslim Ideology which has to be preserved, which has come to us as a precious gift and treasure and which, we hope other will share with us"
					</div>
				<img className="poster" src={poster} alt="img" />
			</div>
		</div >
	</div>
}

export default Challenge