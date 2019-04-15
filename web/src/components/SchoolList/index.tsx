import React from 'react'
import { RouteComponentProps} from 'react-router-dom'
import Former from '~/src/utils/former'

import './style.css'

type propTypes = {
	title: string
	status: SchoolMatch['status']
	matches: RootBankState['sync_state']['matches']
	school_db: RootBankState['new_school_db']
	connected: boolean
	addSchools: (ids : string[]) => void
} & RouteComponentProps

interface stateType {
	loading: boolean,
	filters: {
		name: string,
		tehsil: string
	}
}

export default class SchooList extends React.Component<propTypes, stateType> {

	former: Former
	constructor(props : propTypes) {
		super(props)

		const blank = Object.keys(props.matches)
			.filter(k => props.school_db[k] == undefined)

		if(blank.length > 0) {
			props.addSchools(blank)
		}


		this.state = {
			loading: blank.length > 0,
			filters: {
				name: "",
				tehsil: ""
			}
		}

		this.former = new Former(this, ["filters"])
	}

	onSchoolClick = (school : CERPSchool) => () => {
		this.props.history.push({
			pathname: this.props.location.pathname,
			search: `?school_id=${school.refcode}`
		})
	}

	componentWillReceiveProps(nextProps : propTypes) {

		const blank = Object.keys(nextProps.matches)
			.filter(k => nextProps.school_db[k] == undefined)

		console.log("NEW PROPS: ", blank)
		this.setState({ loading: blank.length > 0 })

	}

	render() {

		const { school_db, matches } = this.props;

		const tehsils = Object.keys(matches)
			.filter(k => school_db[k] && school_db[k].school_tehsil)
			.map(k => school_db[k].school_tehsil)
		
		const unique_tehsils = new Set(tehsils)

		return <div className="page school-list">

			<div className="title">{this.props.title}</div>

			{ this.state.loading && <div className="loading">Loading School Info....</div>}

			<div className="filters">
				<div className="row">
					<input type="text" {...this.former.super_handle(["name"])} placeholder="Filter School Name" />
				</div>
				<div className="row">
					<select {...this.former.super_handle(["tehsil"])}>
						<option value="">Select Tehsil Filter</option>
						{
							Array.from(unique_tehsils)
								.map(x => <option key={x} value={x}>{x}</option>)
						}
					</select>
				</div>
			</div>
			<div className="list">
			{
				Object.entries(this.props.matches)
					.filter(([id, v]) => v.status === this.props.status && this.props.school_db[id] !== undefined)
					.filter(([id, v]) => (school_db[id].school_name || "").toLowerCase().includes(this.state.filters.name))
					.filter(([id, v]) => this.state.filters.tehsil === "" || (school_db[id].school_tehsil || "") === this.state.filters.tehsil)
					.sort(([a,] , [b,]) => (school_db[a].school_name || "").localeCompare(school_db[b].school_name))
					.map(([sid, v]) => {
						const school = school_db[sid];

						return <div key={sid} onClick={this.onSchoolClick(school)}>
							<div>{school.school_name}</div>
						</div>
					})
			}
			</div>
		</div>
	}
}