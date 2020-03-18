import * as React from 'react'
import { connect } from 'react-redux'
import Dynamic from '@ironbay/dynamic'
import Former from '@cerp/former'
import moment from 'moment'

import { getSchoolProfiles, editSchoolProfile, getSchoolProfileFromNumber, getProducts, placOrderWithMeta } from '../../actions'
import OrderPage from './order'

import './style.css'

interface P {
	getSchoolFromRefcode: (school_id: string) => void
	getSchoolFromNumber: (phone_number: string) => void
	getProducts: () => void
	saveSchool: (school: CERPSchool) => void
	placOrderWithMeta: (product: Product, school: CERPSchool, meta: Order["meta"]) => void
	products: RootReducerState['products']
	school?: CERPSchool
	caller_id?: string
}

interface S {
	input: string
	search_type: "NUMBER" | "REFCODE"
	subpage: "PROFILE" | "ORDER"
	loading: boolean
	school?: CERPSchool
}

class SearchPage extends React.Component<P, S> {

	former: Former
	school_former: Former

	constructor(props: P) {
		super(props)

		this.former = new Former(this, [])
		this.school_former = new Former(this, ["school"])

		this.state = {
			input: "",
			loading: false,
			subpage: "PROFILE",
			search_type: "NUMBER"
		}
	}

	search = () => {

		if (this.state.search_type === "REFCODE") {
			this.props.getSchoolFromRefcode(this.state.input);
		}
		else {
			this.props.getSchoolFromNumber(this.state.input)
		}


		this.setState({
			loading: true,
			school: undefined
		})
	}

	componentDidMount() {
		this.props.getProducts()
	}

	componentWillReceiveProps(nextProps: P) {
		console.log("got next props", nextProps)

		if (nextProps.school && !this.props.school) {
			this.setState({
				loading: false,
				school: JSON.parse(JSON.stringify(nextProps.school))
			})
		}

		if (this.props.school && nextProps.school && this.props.school.refcode != nextProps.school.refcode) {
			this.setState({
				loading: false,
				school: JSON.parse(JSON.stringify(nextProps.school))
			})
		}
	}

	onSave = () => {
		// save the school

		if (this.state.school) {
			this.props.saveSchool(this.state.school)
		}

	}

	onOrderPlaced = (product: Product, meta: Partial<Order["meta"]>) => {

		const time = moment.now()
		console.log('ordering ', product)

		if (this.state.school) {
			const updated_meta: Order["meta"] = {
				school_id: this.state.school.refcode,
				product_id: product.id,
				sales_rep: "",
				call_one: "",
				call_two: "",
				actual_product_ordered: "",
				quantity: "1",
				expected_completion_date: time,
				expected_date_of_delivery: time,
				actual_date_of_delivery: time,
				total_amount: "0",
				payment_received: "NO",
				cancellation_reason: "",
				status: "ORDER_PLACED",
				notes: "",
				strategy: "ONLINE",
				...meta
			}

			this.props.placOrderWithMeta(product, this.state.school, updated_meta)
		}
		else {
			alert("error: no school selected")
		}

	}

	render() {

		const school = this.state.school;
		const search_type = this.state.search_type

		return <div className="search page">

			<div className="divider"> Search </div>
			<div className="row">
				<input
					type="text"
					{...this.former.super_handle(["input"])}
					placeholder={search_type === "NUMBER" ? "Phone Number" : "Refcode"}

					onKeyDown={(e) => {
						if (e.which === 13) {
							this.search()
						}
					}}
				/>
				<div className="button" onClick={this.search}>Search</div>
			</div>
			<div className="row">
				<label>Lookup By: </label>
				<select {...this.former.super_handle(["search_type"])}>
					<option value="NUMBER">Phone Number</option>
					<option value="REFCODE">Refcode</option>
				</select>
			</div>

			{this.props.caller_id && <div>CallerID: {this.props.caller_id}</div>}

			{this.state.loading && <div>Loading....</div>}

			{
				this.props.school && <div className="row">
					<label>Action</label>
					<select {...this.former.super_handle(["subpage"])}>
						<option value="PROFILE">Edit School Profile</option>
						<option value="ORDER">Place Order for School</option>
					</select>
				</div>
			}

			{
				school && this.state.subpage === "PROFILE" && <SchoolForm
					school={school}
					former={this.school_former}
					save={this.onSave} />
			}
			{
				this.props.school && this.state.subpage === "ORDER" && <OrderPage
					placeOrder={this.onOrderPlaced}
					products={this.props.products} />
			}

		</div>
	}
}

interface SchoolProp {
	school: CERPSchool
	former: Former
	save: () => void
}

const SchoolForm: React.SFC<SchoolProp> = ({ school, former, save }) => {

	return <div className="form" style={{ width: "90%" }}>

		<div className="button blue" onClick={save}>Save</div>

		<div className="title">{school.school_name}</div>
		<div className="divider">School Profile</div>
		<div className="section">
			<EditSurveyRow label="Phone Number" path={["phone_number"]} former={former} />
			<EditSurveyRow label="Phone Number 1" path={["phone_number_1"]} former={former} />
			<EditSurveyRow label="Phone Number 2" path={["phone_number_2"]} former={former} />
			<EditSurveyRow label="Phone Number 3" path={["phone_number_3"]} former={former} />
			<EditSurveyRow label="Alt Phone Number" path={["alt_phone_number"]} former={former} />
			<EditSurveyRow label="Owner Phone Number" path={["owner_phonenumber"]} former={former} />
			<EditSurveyRow label="Address" path={["school_address"]} former={former} />
			<EditSurveyRow label="Tehsil" path={["school_tehsil"]} former={former} />
			<EditSurveyRow label="District" path={["school_district"]} former={former} />
			<EditSurveyRow label="Respondant Name" path={["respondent_name"]} former={former} />
			<EditSurveyRow label="Respondent is Owner" path={["respondent_owner"]} former={former} />
			<EditSurveyRow label="Respondent Relation" path={["respondent_relation"]} former={former} />
			<EditSurveyRow label="Respondent Gender" path={["respondent_gender"]} former={former} />
			<EditSurveyRow label="Year Established" path={["year_established"]} former={former} />
			<EditSurveyRow label="Registered" path={["school_registration"]} former={former} />
			<EditSurveyRow label="PEF School" path={["school_pef"]} former={former} />
			<EditSurveyRow label="SEF School" path={["school_sef"]} former={former} />
			<EditSurveyRow label="FEF School" path={["school_fef"]} former={former} />
			<EditSurveyRow label="Number of Branches" path={["school_branches"]} former={former} />
			<EditSurveyRow label="Number of Rooms" path={["no_of_rooms"]} former={former} />
			<EditSurveyRow label="Building Rented" path={["school_building_rent"]} former={former} />
			<EditSurveyRow label="Medium of Instruction" path={["instruction_medium"]} former={former} />
			<EditSurveyRow label="Teachers Employed" path={["teachers_employed"]} former={former} />
			<EditSurveyRow label="Has Smartphone" path={["smart_phone"]} former={former} />

		</div>

		<div className="divider">Fees & Enrollment</div>
		<div className="section">
			<EditSurveyRow label="Lowest Fee" path={["lowest_fee"]} former={former} />
			<EditSurveyRow label="Highest Fee" path={["highest_fee"]} former={former} />
			<EditSurveyRow label="Enrollment" path={["total_enrolment"]} former={former} />
			<EditSurveyRow label="Highest Grade" path={["highest_grade"]} former={former} />
			<EditSurveyRow label="Lowest Grade" path={["lowest_grade"]} former={former} />
		</div>

		<div className="divider">Financing</div>
		<div className="section">
			{ /* <SurveyRow label="Financing Interest" val={school.financing_interest} /> */}
			<EditSurveyRow label="Unmet Need" path={["unmet_financing_needs"]} former={former} />
			<EditSurveyRow label="Current Loan Outstanding" path={["previous_loan"]} former={former} />
			<EditSurveyRow label="Outstanding Loan Amount" path={["previous_loan_amount"]} former={former} />
		</div>

		<div className="divider">Education Services</div>
		<div className="section">
			<EditSurveyRow label="Textbook Provider Interest" path={["textbook_provider_interest"]} former={former} />
		</div>

	</div>
}

const map_facilities = (facilities: string) => {

	const map = [
		"Boundary Wall",
		"Library",
		"UPS",
		"Generator",
		"Computer/Tablets",
		"Projector",
		"Sports Ground & Equipment",
		"Internet",
		"Solar Power"
	]

	return facilities.split(' ').map(x => map[parseInt(x)]).join(", ")
}

const map_ess_products = (products: string) => {
	const map = [
		"Teacher & Management Training",
		"Learning & Teaching Materials",
		"Match/Science Materials & Language Programs",
		"Education Technology",
		"Management Information System",
		"School Supplies",
		"School Furniture",
		"None of the Above"
	]

	return products.split(' ').map(x => map[parseInt(x)]).join(", ")
}

const map_textbook_providers = (textbooks: string) => {
	const map = [
		"Oxford",
		"Aafaq",
		"Gohar",
		"Punjab Textbook Board",
		"Sun Pace",
		"Galaxy",
		"Dawn",
		"Hadia",
		"Babar",
		"Javaid",
		"Other"
	]

	return textbooks.split(' ').map(x => map[parseInt(x)]).join(", ")
}

interface SurveyRowProp {
	label: string
	path: string[]
	former: Former
}

const isValid = (field: string) => {
	return field && !(field.trim() === "" || field === "999")
}

const EditSurveyRow: React.StatelessComponent<SurveyRowProp> = ({ label, path, former }) => {

	const val = Dynamic.get(former._component.state, [...former.base_path, ...path]) as string

	/*
	if(!isValid(val)) {
		return null;
	}
	*/

	return <div className="row">
		<label>{label}</label>
		<input type="text" {...former.super_handle(path)} placeholder={val} />
	</div>
}

export default connect((state: RootReducerState) => ({
	school: state.active_school,
	caller_id: state.caller_id,
	products: state.products,
}), (dispatch: Function) => ({
	getSchoolFromRefcode: (school_id: string) => dispatch(getSchoolProfiles([school_id])),
	getSchoolFromNumber: (phone_number: string) => dispatch(getSchoolProfileFromNumber(phone_number)),
	saveSchool: (school: CERPSchool) => dispatch(editSchoolProfile(school.refcode, school)),
	getProducts: () => dispatch(getProducts()),
	placOrderWithMeta: (product: Product, school: CERPSchool, meta: Order["meta"]) => dispatch(placOrderWithMeta(product, school, meta))
}))(SearchPage)