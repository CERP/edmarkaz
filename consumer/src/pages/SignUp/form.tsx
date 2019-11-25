import * as React from 'react'
import Former from 'former'
import Dynamic from '@ironbay/dynamic'
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

	return <div className="">

		<div className="form">
			<div className="title">School Profile</div>
			<EditSurveyRow base_path={base_path} label="School Name" path={["school_name"]} former={former} />
			<EditSurveyRow base_path={base_path} label="Address" path={["school_address"]} former={former} />

			<div className="row">
				<div className="subtitle">Location<Span /></div>
				<div className="row-row">
					<div className="row">
						<label>District</label>
						<select {...former.super_handle(["school", "school_district"])}>
							<option value="">Select a District</option>
							<option value="LAHORE">Lahore</option>
							<option value="SHEIKHUPURA">Sheikhupura</option>
							<option value="KASUR">Kasur</option>
						</select>
					</div>

					<div className="row">
						<label>Tehsil</label>
						<select {...former.super_handle(["school", "school_tehsil"])}>
							<option value="">Select a Location</option>
							{
								school && school.school_district === "LAHORE" && <>
									<option value="LAHORE_CITY">Lahore City</option>
									<option value="LAHORE_CANTT">Lahore Cantt</option>
									<option value="RAIWIND">Raiwind</option>
									<option value="SHALIMAR">Shalimar</option>
								</>
							}

							{
								school && school.school_district === "SHEIKHUPURA" && <>
									<option value="FEROZWALA">Ferozwala</option>
									<option value="MURIDKE">Muridke</option>
									<option value="SAFDARABAD">Safdarabad</option>
									<option value="SHEIKHUPURA">Sheikhupura</option>
								</>
							}

							{
								school && school.school_district === "KASUR" && <>
									<option value="CHUNIAN">Chunian</option>
									<option value="KASUR">Kasur</option>
									<option value="KOT_RADHA_KISHAN">Kot Radha Kishan</option>
									<option value="PATTOKI">Pattoki</option>
								</>
							}
						</select>
					</div>

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