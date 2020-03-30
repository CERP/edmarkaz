import React from 'react'
import Header from '../../components/Header'

import Demo from './assets/demo.svg'

import './style.css'


const FrontPage = () => {
	return <div className="front">
		<Header path={""} />

		<div className="partition main">
			<div className="info-container">
				<div className="heading">Pakistans Best Digital Education Hub</div>
				<div className="para">
					A library of best educational resources
					from around the world, carefully
					curated for Pakistan
				</div>
				<div className="pill"> START HERE</div>
			</div>
			<div className="img-container">
				<img className="img" src={Demo} />
			</div>
		</div>
		<div className="partition">
			<div className="img-container">
				<div className="circle-frame">
					<img className="img" src={Demo} />
				</div>
			</div>
			<div className="info-container">
				<div className="heading">FOR STUDENTS</div>
				<div className="para">
					A library of best educational resources
					from around the world, carefully
					curated for Pakistan
				</div>
				<div className="pill"> Students, Start Here!</div>
			</div>
		</div>

		<div className="partition">
			<div className="img-container">
				<div className="circle-frame">
					<img className="img" src={Demo} />
				</div>
			</div>
			<div className="info-container">
				<div className="heading">FOR TEACHERS</div>
				<div className="para">
					A library of best educational resources
					from around the world, carefully
					curated for Pakistan
				</div>
				<div className="pill"> Teachers, Start Here!</div>
			</div>
		</div>

		<div className="partition">
			<div className="img-container">
				<div className="circle-frame">
					<img className="img" src={Demo} />
				</div>
			</div>
			<div className="info-container">
				<div className="heading">FOR SCHOOLS</div>
				<div className="para">
					A library of best educational resources
					from around the world, carefully
					curated for Pakistan
				</div>
				<div className="pill"> Schools, Start Here!</div>
			</div>
		</div>

	</div>
}
export default FrontPage