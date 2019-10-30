import React from 'react'
import { RouteComponentProps} from 'react-router-dom'
import Former from '~/src/utils/former'
import EstimateMonthlyRevenue from '~/src/utils/estimate_revenue'

import './style.css'

import callAnswered from '../../utils/call_answered'

type propTypes = {
	title: string;
	status: SchoolMatch['status'];
	matches: RootBankState['sync_state']['matches'];
	school_db: RootBankState['new_school_db'];
	connected: boolean;
	addSchools: (ids: string[]) => void;
} & RouteComponentProps

interface stateType {
	loading: boolean;
	filters: {
		active: boolean;
		name: string;
		tehsil: string;
		contact_history: "" | "NEVER" | "ONCE" | "TWICE" | "MULTIPLE";
		min_year_established: string;
		max_year_established: string;
		min_revenue: string;
		max_revenue: string;
	};
}

export default class SchooList extends React.Component<propTypes, stateType> {

	former: Former
	constructor(props: propTypes) {
		super(props)

		const blank = Object.keys(props.matches)
			.filter(k => props.school_db[k] == undefined)

		if(blank.length > 0) {
			props.addSchools(blank)
		}


		this.state = {
			loading: blank.length > 0,
			filters: {
				active: false,
				name: "",
				tehsil: "",
				contact_history: "",
				min_year_established: "",
				max_year_established: "",
				min_revenue: "",
				max_revenue: ""
			}
		}

		this.former = new Former(this, ["filters"])
	}

	onSchoolClick = (school: CERPSchool) => () => {
		this.props.history.push({
			pathname: this.props.location.pathname,
			search: `?school_id=${school.refcode}`
		})
	}

	componentWillReceiveProps(nextProps: propTypes) {

		const blank = Object.keys(nextProps.matches)
			.filter(k => nextProps.school_db[k] == undefined)

		console.log("NEW PROPS: ", blank)
		this.setState({ loading: blank.length > 0 })

	}

	render() {

		const { school_db, matches } = this.props;


		const tehsils = Object.entries(matches)
			.filter(([k, v]) => school_db[k] && school_db[k].school_tehsil && v.status === this.props.status)
			.map(([k, v]) => school_db[k].school_tehsil)
		
		const unique_tehsils = new Set(tehsils)

		return <div className="page school-list">

			<div className="title">{this.props.title}</div>

			{ this.state.loading && <div className="loading">Loading School Info....</div>}

			<div className="button blue filter" onClick={() => this.setState({filters: { ...this.state.filters, active: !this.state.filters.active}})}>{this.state.filters.active ? "Hide Filters" : "Show Filters"}</div>

			{ this.state.filters.active && 
				<div className="filters">
					<div className="row">
						<input type="text" {...this.former.super_handle(["name"])} placeholder="Filter School Name" />
					</div>

					<div className="row">
						<label>Tehsil</label>
						<select {...this.former.super_handle(["tehsil"])}>
							<option value="">Select Tehsil Filter</option>
							{
								Array.from(unique_tehsils)
									.map(x => <option key={x} value={x}>{x}</option>)
							}
						</select>
					</div>

					<div className="row">
						<label>Contact History</label>
						<select {...this.former.super_handle(["contact_history"])}>
							<option value="">Select Contact History</option>
							<option value="NEVER">Never Contacted</option>
							<option value="ONCE">Contacted Once</option>
							<option value="TWICE">Contacted Twice</option>
							<option value="MULTIPLE">Contacted more than twice</option>
						</select>
					</div>

					<div className="row">
						<label>Minimum Year Established</label>
						<input type="number" {...this.former.super_handle(["min_year_established"])} placeholder="Minimum Year Established"/>
					</div>

					<div className="row">
						<label>Maximum Year Established</label>
						<input type="number" {...this.former.super_handle(["max_year_established"])} placeholder="Maximum Year Established"/>
					</div>

					<div className="row">
						<label>Minimum Revenue</label>
						<input type="number" {...this.former.super_handle(["min_revenue"])} placeholder="Minimum Revenue"/>
					</div>

					<div className="row">
						<label>Maximum Revenue</label>
						<input type="number" {...this.former.super_handle(["max_revenue"])} placeholder="Maximum Revenue"/>
					</div>
				</div>
			}

			<div className="list">
			{
				Object.entries(this.props.matches)
					.filter(([id, v]) => v.status === this.props.status && this.props.school_db[id] !== undefined)
					.filter(([id, v]) => (school_db[id].school_name || "").toLowerCase().includes(this.state.filters.name))
					.filter(([id, v]) => this.state.filters.tehsil === "" || (school_db[id].school_tehsil || "") === this.state.filters.tehsil)
					.filter(([id, v]) => {

						if(this.state.filters.contact_history === "") {
							return true;
						}

						if(this.props.matches[id].history === undefined) {
							if(this.state.filters.contact_history === "NEVER") {
								return true;
							}
							return false;
						}

						const calls = Object.values(this.props.matches[id].history)
							.filter(x => x.event === "CALL_END" && callAnswered(x))
							.length

						if(this.state.filters.contact_history === "NEVER") {
							return calls === 0
						}

						if(this.state.filters.contact_history === "ONCE") {
							return calls === 1
						}

						if(this.state.filters.contact_history === "TWICE") {
							return calls === 2
						}

						if(this.state.filters.contact_history === "MULTIPLE") {
							return calls > 2
						}
					})
					.filter(([id, v]) => {

						const school = school_db[id]
						const min_year = parseInt(this.state.filters.min_year_established)
						const max_year = parseInt(this.state.filters.max_year_established)

						if(school.year_established == undefined) {
							return this.state.filters.min_year_established === ""
						}

						const year = parseInt(school.year_established)

						return (isNaN(min_year) || year >= min_year) && (isNaN(max_year) || year <= max_year)

					})
					.filter(([id, v]) => {

						const school = school_db[id]
						const min_revenue = parseInt(this.state.filters.min_revenue)
						const max_revenue = parseInt(this.state.filters.max_revenue)
						
						const estimated_revenue = EstimateMonthlyRevenue(school)

						if(estimated_revenue == undefined) {
							return this.state.filters.min_revenue === ""
						}

						return (isNaN(min_revenue) || estimated_revenue >= min_revenue) && (isNaN(max_revenue) || estimated_revenue <= max_revenue)

					})
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