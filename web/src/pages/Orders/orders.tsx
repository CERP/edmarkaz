import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'

import './style.css'
import Former from '~src/utils/former'
import { reserveMaskedNumber, releaseMaskedNumber } from '~src/actions'

interface P {
	reserveNumber: (school_id: string) => any
	releaseNumber: (school_id: string) => any
	sync_state: RootBankState["sync_state"]
	schools: RootBankState["new_school_db"]
	products: RootBankState["products"]
}

interface S {
	filterMenu: boolean
	activeSchool: string
	filters: {
		status: "IN_PROGRESS" | "DONE" | "ORDERED" | ""
		text: string
	}
}

type propTypes = RouteComponentProps & P

class Orders extends Component<propTypes, S> {
	former: Former
	constructor(props: propTypes) {
		super(props)

		this.state = {
			filterMenu: false,
			activeSchool: "",
			filters: {
				status: "",
				text: ""
			}
		}
		this.former = new Former(this, [])
	}

	setActive = (school_id: string) => {
		const activeSchool = this.state.activeSchool === school_id ? "" : school_id

		this.setState({
			activeSchool
		})
	}

	onShowNumber = () => {
		this.props.reserveNumber(this.state.activeSchool)
	}

	onMarkComplete = () => {

		const res = confirm('Are you sure you want to Mark as Complete?')

		if (res) {
			this.props.releaseNumber(this.state.activeSchool)
		}
	}
	filterItem = (item_status: "IN_PROGRESS" | "DONE" | "ORDERED" | "") => {
		const { status } = this.state.filters

		return status ? status === item_status : true
	}

	getLatestDate = (orders: SchoolMatch["history"]): number => Object.values(orders).reduce((prev, curr) => prev > curr.time ? prev : curr.time, 0)

	render() {
		const { sync_state, schools, products } = this.props
		const { filterMenu, activeSchool } = this.state

		const items = Object.entries(sync_state.matches)
			.filter(([sid, { status, history }]) =>
				(status !== "REJECTED" && status !== "NEW") && Object.values(history).find((e) => e.event === "ORDER_PLACED")
				&& this.filterItem(status)
			)
			.sort(([, event_a], [, event_b]) => {
				return this.getLatestDate(event_b.history) - this.getLatestDate(event_a.history)
			})
			.map(([sid, event]) => ({ ...event, school: schools[sid] }))

		const schoolMatch = sync_state.matches[activeSchool]

		return <div className="order page">
			<div className="title">Orders</div>
			<div className="form" style={{ width: "90%", marginBottom: "20px" }}>

				<div className="button blue" onClick={() => this.setState({ filterMenu: !filterMenu })}>Filters</div>
				{
					filterMenu && <>
						{/* <div className="row">
							<label>Search</label>
							<input type="text" />
						</div> */}
						<div className="row">
							<label>Status</label>
							<select {...this.former.super_handle(["filters", "status"])}>
								<option value=""> All</option>
								<option value="ORDERED">Ordered</option>
								<option value="DONE">Done</option>
								<option value="IN_PROGRESS">In Progress</option>
							</select>
						</div>
					</>
				}
			</div>

			<div className="section newtable" style={{ width: "90%", padding: "5px" }}>
				<div className="newtable-row heading">
					<div>Date</div>
					<div>School</div>
					<div>Status</div>
				</div>
				{
					items.map(({ history, school, status }) => {
						const latest_order = Object.values(history).reduce((prev, curr) => prev > curr.time ? prev : curr.time, 0)
						const school_id = school.refcode
						const reserved = schoolMatch && schoolMatch.status === "IN_PROGRESS"
						const orders = Object.values(history)
							.filter(e => e.event === "ORDER_PLACED")
						const orders_length = orders.length > 0

						return <div key={school_id}>
							<div className="newtable-row">
								<div> {moment(latest_order).format("DD-MM-YY")} </div>
								<div className="clickable" onClick={() => this.setActive(school_id)}>{school.school_name}</div>
								<div> {status}</div>
							</div>
							{
								activeSchool === school_id && <div className="more">
									<div className="form">
										<div className="divider">School Info</div>
										<div className="row">
											<label>Address</label>
											<div> {school.school_address} </div>
										</div>
										<div className="row">
											<label>Tehsil</label>
											<div> {school.school_tehsil} </div>
										</div>
										<div className="row">
											<label> District</label>
											<div> {school.school_district} </div>
										</div>
										<div className="row">
											<label> Lowest Fee</label>
											<div> {school.lowest_fee} </div>
										</div>
										<div className="row">
											<label> Highest Fee</label>
											<div> {school.highest_fee} </div>
										</div>
										<div className="row">
											<label> Enrollment </label>
											<div> {school.enrolment_range} </div>
										</div>
										{(status === "DONE" || status === "ORDERED") && <div className="button blue" onClick={this.onShowNumber}>Show Number</div>}
										{
											reserved && <>
												<div className="divider"> Contact Information </div>
												<div className="row">
													<label>Phone Number</label>
													<div className="row" style={{ flexDirection: "row" }}>
														<div style={{ width: "70%" }}> {schoolMatch.masked_number}</div>
														<a href={`tel:${schoolMatch.masked_number}`} className="button green" style={{ width: "20%", marginRight: "10px" }}>Call</a>
													</div>
												</div>
											</>
										}
										{status === "IN_PROGRESS" && <div className="button green" onClick={this.onMarkComplete}>Mark Complete</div>}
										{orders_length && <div className="divider">Orders</div>}
										{
											orders_length && <div className="newtable">
												<div className="newtable-row heading">
													<div>Date </div>
													<div>Product</div>
												</div>
												{
													orders
														.map(e => {
															const product_id = e.event === "ORDER_PLACED" && e.meta.product_id
															return <div className="newtable-row">
																<div>{moment(e.time).format("DD-MM-YY")}</div>
																<div>{products.db[product_id].title}</div>
															</div>
														})
												}
											</div>
										}
									</div>
								</div>
							}
						</div>
					})
				}
			</div>
		</div>
	}
}

export default connect((state: RootBankState) => ({
	sync_state: state.sync_state,
	schools: state.new_school_db,
	products: state.products,
}), (dispatch: Function) => ({
	reserveNumber: (school_id: string) => dispatch(reserveMaskedNumber(school_id)),
	releaseNumber: (school_id: string) => dispatch(releaseMaskedNumber(school_id))
}))(Orders)
