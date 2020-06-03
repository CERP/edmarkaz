import * as React from 'react'
import Former from 'former'
import Dynamic from '@ironbay/dynamic'
import { Typography, TextField, MenuItem } from '@material-ui/core'

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

export const SchoolForm: React.SFC<SchoolProp> = ({ former, base_path }) => {

	return <>
		<Typography
			variant="h6"
			align="left"
			style={{ marginTop: 15, fontFamily: "futura" }}
			color="primary" >SCHOOL PROFILE </Typography>

		<EditSurveyRow base_path={base_path} label="School Name" path={["school_name"]} former={former} />
		<EditSurveyRow base_path={base_path} label="Address" path={["school_address"]} former={former} />

		<Typography
			variant="h6"
			align="left"
			style={{ marginTop: 15, fontFamily: "futura" }}
			color="primary" >LOCATION</Typography>
		<EditSurveyRow base_path={base_path} label="District" path={["school_district"]} former={former} />
		<EditSurveyRow base_path={base_path} label="Tehsil" path={["school_tehsil"]} former={former} />

		<Typography
			variant="h6"
			align="left"
			style={{ marginTop: 15, fontFamily: "futura" }}
			color="primary" >ADDITIONAL INFORMATION</Typography>

		<EditSurveyRow base_path={base_path} label="Lowest Fee" path={["lowest_fee"]} former={former} />
		<EditSurveyRow base_path={base_path} label="Highest Fee" path={["highest_fee"]} former={former} />
		<EditSurveyRow base_path={base_path} label="Enrollment" path={["total_enrolment"]} former={former} />

		<TextField
			style={{ marginTop: 10 }}
			variant="outlined"
			select
			label="Are you the Owner of the school?"
			fullWidth
			{...former.super_handle([...base_path, "respondent_owner"])}
		>
			<MenuItem value="YES">Yes</MenuItem>
			<MenuItem value="NO">No</MenuItem>
		</TextField>
	</>
}


const EditSurveyRow: React.StatelessComponent<SurveyRowProp> = ({ label, path, former, base_path }) => {

	const val = Dynamic.get(former._component.state, [...former.base_path, ...base_path, ...path]) as string

	return <TextField
		style={{ marginTop: 10 }}
		variant="outlined"
		label={label}
		fullWidth
		placeholder={val}
		type="text"
		{...former.super_handle([...base_path, ...path])}
	/>
}