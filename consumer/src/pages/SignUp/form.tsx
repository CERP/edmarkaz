import * as React from 'react'
import Former from 'former'
import Dynamic from '@ironbay/dynamic'
import { v4 } from 'uuid'
import { Span } from '.'

interface SurveyRowProp {
	label: string;
	path: string[];
	former: Former;
	base_path: string[];
}

interface SchoolProp {
	school?: Partial<CERPSchool>;
	former: Former;
	base_path: string[];
}

export const SchoolForm: React.SFC<SchoolProp> = ({ school, former, base_path }) => {

	const generated_refcode = v4()

	return <div className="">

		<div className="form">
			<div className="title">School Profile</div>
			<div className="row">
				<label>RefCode</label>
				<div>{(school && school.refcode) || generated_refcode}</div>
			</div>
			<EditSurveyRow base_path={base_path} label="School Name" path={["school_name"]} former={former} />
			<EditSurveyRow base_path={base_path} label="Address" path={["school_address"]} former={former} />

			<div className="row">
				<div className="subtitle">Location<Span/></div>
				<div className="row-row">
					<EditSurveyRow base_path={base_path} label="Tehsil" path={["school_tehsil"]} former={former} />
					<EditSurveyRow base_path={base_path} label="District" path={["school_district"]} former={former} />
				</div>
			</div>
		</div>

		<div className="form">
			<div className="title">Optional Information</div>
			<EditSurveyRow base_path={base_path} label="Enrollment" path={["total_enrolment"]} former={former} />
			<div className="row-row">
				<EditSurveyRow base_path={base_path} label="Lowest Fee" path={["lowest_fee"]} former={former} />
				<EditSurveyRow base_path={base_path} label="Highest Fee" path={["highest_fee"]} former={former} />
			</div>
			<EditSurveyRow base_path={base_path} label="Respondent is Owner" path={["respondent_owner"]} former={former} />
		</div>
	</div>
}

/*
const isValid = (field: string) => {
	return field && !(field.trim() === "" || field === "999")
}
*/

const EditSurveyRow: React.StatelessComponent<SurveyRowProp> = ({ label, path, former, base_path }) => {

	const val = Dynamic.get(former._component.state, [...former.base_path, ...base_path, ...path]) as string

	/*
	if(!isValid(val)) {
		return null;
	}
	*/

	return <div className="row">
		<div className="subtitle">{label}</div>
		<input type="text" {...former.super_handle([...base_path, ...path])} placeholder={val} />
	</div>
}