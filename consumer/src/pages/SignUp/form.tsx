import * as React from 'react'
import Former from 'former'
import Dynamic from '@ironbay/dynamic'
import { v4 } from 'uuid'

interface SurveyRowProp {
	label: string
	path: string[]
	former: Former
	base_path: string[]
}

interface SchoolProp {
	school?: Partial<CERPSchool>
	former: Former
	base_path: string[]
}

export const SchoolForm : React.SFC<SchoolProp> = ({ school, former, base_path }) => {

	const generated_refcode = v4()

	return <div className="form" style={{width: "90%"}}>

		<div className="divider">School Profile</div>
		<div className="section">
			<div className="row">
				<label>RefCode</label>
				<div>{(school && school.refcode) || generated_refcode}</div>
			</div>
			<EditSurveyRow base_path={base_path} label="School Name" path={["school_name"]} former={former} />
			<EditSurveyRow base_path={base_path} label="Phone Number" path={["phone_number"]} former={former} />
			<EditSurveyRow base_path={base_path} label="Address" path={["school_address"]} former={former} />
			<EditSurveyRow base_path={base_path} label="Tehsil" path={["school_tehsil"]} former={former} />
			<EditSurveyRow base_path={base_path} label="District" path={["school_district"]} former={former} />
			<EditSurveyRow base_path={base_path} label="Respondant Name" path={["respondent_name"]} former={former}/>
			<EditSurveyRow base_path={base_path} label="Respondent is Owner" path={["respondent_owner"]} former={former}/>
			<EditSurveyRow base_path={base_path} label="Respondent Relation" path={["respondent_relation"]} former={former}/>
			<EditSurveyRow base_path={base_path} label="Respondent Gender" path={["respondent_gender"]} former={former} />
			<EditSurveyRow base_path={base_path} label="Year Established" path={["year_established"]} former={former} />
			<EditSurveyRow base_path={base_path} label="Registered" path={["school_registration"]} former={former}/>
			<EditSurveyRow base_path={base_path} label="PEF School" path={["school_pef"]} former={former}/>
			<EditSurveyRow base_path={base_path} label="SEF School" path={["school_sef"]} former={former}/>
			<EditSurveyRow base_path={base_path} label="FEF School" path={["school_fef"]} former={former}/>
			<EditSurveyRow base_path={base_path} label="Number of Branches" path={["school_branches"]} former={former}/>
			<EditSurveyRow base_path={base_path} label="Number of Rooms" path={["no_of_rooms"]} former={former}/>
			<EditSurveyRow base_path={base_path} label="Building Rented" path={["school_building_rent"]} former={former}/>
			<EditSurveyRow base_path={base_path} label="Medium of Instruction" path={["instruction_medium"]} former={former}/>
			<EditSurveyRow base_path={base_path} label="Teachers Employed" path={["teachers_employed"]} former={former}/>
			<EditSurveyRow base_path={base_path} label="Has Smartphone" path={["smart_phone"]} former={former}/>

		</div>

		<div className="divider">Fees & Enrollment</div>
		<div className="section">
			<EditSurveyRow base_path={base_path} label="Lowest Fee" path={["lowest_fee"]} former={former}/>
			<EditSurveyRow base_path={base_path} label="Highest Fee" path={["highest_fee"]} former={former}/>
			<EditSurveyRow base_path={base_path} label="Enrollment" path={["total_enrolment"]} former={former}/>
			<EditSurveyRow base_path={base_path} label="Highest Grade" path={["highest_grade"]} former={former}/>
			<EditSurveyRow base_path={base_path} label="Lowest Grade" path={["lowest_grade"]} former={former}/>
		</div>

		<div className="divider">Financing</div>
		<div className="section">
			{ /* <SurveyRow label="Financing Interest" val={school.financing_interest} /> */ }
			<EditSurveyRow base_path={base_path} label="Unmet Need" path={["unmet_financing_needs"]} former={former}/>
			<EditSurveyRow base_path={base_path} label="Current Loan Outstanding" path={["previous_loan"]} former={former}/>
			<EditSurveyRow base_path={base_path} label="Outstanding Loan Amount" path={["previous_loan_amount"]} former={former}/>
		</div>

		<div className="divider">Education Services</div>
		<div className="section">
			<EditSurveyRow base_path={base_path} label="Textbook Provider Interest" path={["textbook_provider_interest"]} former={former}/>
		</div>

	</div>
}

const isValid = (field : string) => {
	return field && !(field.trim() === "" || field === "999")
}

const EditSurveyRow : React.StatelessComponent<SurveyRowProp> = ({ label, path, former, base_path }) => {

	const val = Dynamic.get(former._component.state, [...former.base_path, ...base_path, ...path]) as string

	/*
	if(!isValid(val)) {
		return null;
	}
	*/

	return <div className="row">
		<label>{label}</label>
		<input type="text" {...former.super_handle([...base_path, ...path])} placeholder={val} />
	</div>
}