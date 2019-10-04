import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router';
import { Link, Route } from 'react-router-dom';
import Activities from './Activities';
import Survey from './Survey';

import './style.css'

type propTypes = {} & RouteComponentProps

interface stateType {}

class Dashboard extends React.Component <propTypes, stateType> {
	
	constructor(props: propTypes) {
		super(props)
	
		this.state = {
			 
		}
	}
	
	
	render() {

		const loc = this.props.location.pathname.split('/').slice(-1).pop();
		
		return	<div className="page dashboard">
			
			<div className="row tabs">
				<Link className={`button ${loc === "activities" ? "blue" : false}`} to="activities" replace={true}>Activities</Link>
				<Link className={`button ${loc === "survey" ? "orange" : false}`} to="survey" replace={true}>Survey</Link>
			</div>

			<Route path="/dashboard/survey" component={Survey} />
			<Route path="/dashboard/activities" component={Activities} />

		</div>
		
	}
}

export default Dashboard