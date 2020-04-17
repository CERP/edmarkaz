import * as React from 'react'
import Former from 'former'
import Dynamic from '@ironbay/dynamic'
import { Span } from '.'
import { Typography, Button, TextField, MenuItem, Grid } from '@material-ui/core'
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

	return <>
		<Typography variant="h5">School Profile <Span /></Typography>
		<EditSurveyRow base_path={base_path} label="School Name" path={["school_name"]} former={former} />
		<EditSurveyRow base_path={base_path} label="Address" path={["school_address"]} former={former} />

		<Typography variant="h5">Location<Span /></Typography>
		<Grid container xs={12} >
			<Grid container item spacing={1}>
				<Grid item xs={6}>
					<EditSurveyRow base_path={base_path} label="District" path={["school_district"]} former={former} />
				</Grid>
				<Grid item xs={6}>
					<EditSurveyRow base_path={base_path} label="Tehsil" path={["school_tehsil"]} former={former} />
				</Grid>
			</Grid>
		</Grid>
		<Typography variant="h5">Additional Information</Typography>
		<Grid container xs={12} >
			<Grid container item spacing={1}>
				<Grid item xs={6}>
					<EditSurveyRow base_path={base_path} label="Lowest Fee" path={["lowest_fee"]} former={former} />
				</Grid>
				<Grid item xs={6}>
					<EditSurveyRow base_path={base_path} label="Highest Fee" path={["highest_fee"]} former={former} />
				</Grid>
			</Grid>
		</Grid>
		<EditSurveyRow base_path={base_path} label="Enrollment" path={["total_enrolment"]} former={former} />
		<TextField
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

	return <TextField
		variant="outlined"
		label={label}
		margin="normal"
		fullWidth
		placeholder={val}
		type="text"
		{...former.super_handle([...base_path, ...path])}
	/>
	// <input type="text" {...former.super_handle([...base_path, ...path])} placeholder={val} />

}