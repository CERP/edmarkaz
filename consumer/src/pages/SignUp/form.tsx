import React, { useState } from 'react'
import Former from 'former'
import Dynamic from '@ironbay/dynamic'
import { Typography, TextField, MenuItem } from '@material-ui/core'
import { getDistrictTehsilList } from 'utils/getDistrictTehsilList'

interface SurveyRowProp {
	label: string;
	path: string[];
	former: Former;
	base_path: string[];
}

interface SchoolProp {
	school: Partial<CERPSchool>;
	former: Former;
	base_path: string[];
}

export const SchoolForm: React.SFC<SchoolProp> = ({ school, former, base_path }) => {

	// @ts-ignore
	const district_tehsils = school.school_district && getDistrictTehsilList()["PUNJAB"][school.school_district]
	const [province, setProvince] = useState('')
	const getProvince = (e: any) => {
		setProvince(e.target.value)
	}

	return <>
		<TextField
			style={{ marginTop: 10 }}
			variant="outlined"
			select
			label="Your Designation"
			fullWidth
			{...former.super_handle([...base_path, "respondent_owner"])}
		>
			<MenuItem value="SCHOOL_OWNER">School Owner</MenuItem>
			<MenuItem value="PRINCIPAL">Principal</MenuItem>
			<MenuItem value="DEPUTY_PRINCIPAL">Deputy Principal</MenuItem>
			<MenuItem value="HEAD_TEACHER">Head Teacher</MenuItem>
			<MenuItem value="TEACHER">Teacher</MenuItem>
			<MenuItem value="ADMIN">Admin</MenuItem>
		</TextField>
		<Typography
			variant="h6"
			align="left"
			style={{ marginTop: 15, fontFamily: "futura" }}
			color="primary" >SCHOOL INFORMATION </Typography>

		<EditSurveyRow base_path={base_path} label="School Name" path={["school_name"]} former={former} />

		{/* <EditSurveyRow base_path={base_path} label="Address" path={["school_address"]} former={former} />

		<Typography
			variant="h6"
			align="left"
			style={{ marginTop: 15, fontFamily: "futura" }}
			color="primary" >LOCATION</Typography> */}
		{/* <EditSurveyRow base_path={base_path} label="District" path={["school_district"]} former={former} />
		<EditSurveyRow base_path={base_path} label="Tehsil" path={["school_tehsil"]} former={former} /> */}

		<TextField
			style={{ marginTop: 10 }}
			variant="outlined"
			select
			label="Provice"
			fullWidth
			onChange={getProvince}
		>
			{
				Object.keys(getDistrictTehsilList()).map(
					province => <MenuItem value={province}>{province}</MenuItem>
				)
			}
		</TextField>
		{
			province !== '' ? <TextField
				style={{ marginTop: 10 }}
				variant="outlined"
				select
				label="District"
				fullWidth
				{...former.super_handle([...base_path, "school_district"])}
			>
				{
					//@ts-ignore
					Object.keys(getDistrictTehsilList()[province && province]).map(
						district => <MenuItem value={district}>{district}</MenuItem>
					)
				}
			</TextField> : null
		}

		{district_tehsils && district_tehsils.length > 0 && school.school_district && <TextField
			style={{ marginTop: 10 }}
			variant="outlined"
			select
			label="Tehsil"
			fullWidth
			{...former.super_handle([...base_path, "school_tehsil"])}
		>
			{
				district_tehsils.map((tehsil: string) => <MenuItem value={tehsil}>{tehsil}</MenuItem>)
			}
		</TextField>}
		{
			district_tehsils === undefined && <EditSurveyRow
				base_path={base_path}
				label="Tehsil"
				path={["school_tehsil"]}
				former={former} />
		}
		{/* <Typography
			variant="h6"
			align="left"
			style={{ marginTop: 15, fontFamily: "futura" }}
			color="primary" >ADDITIONAL INFORMATION</Typography>

		<EditSurveyRow base_path={base_path} label="Lowest Fee" path={["lowest_fee"]} former={former} />
		<EditSurveyRow base_path={base_path} label="Highest Fee" path={["highest_fee"]} former={former} />
		<EditSurveyRow base_path={base_path} label="Enrollment" path={["total_enrolment"]} former={former} /> */}

		{/* <TextField
			style={{ marginTop: 10 }}
			variant="outlined"
			select
			label="Are you the Owner of the school?"
			fullWidth
			{...former.super_handle([...base_path, "respondent_owner"])}
		>
			<MenuItem value="YES">Yes</MenuItem>
			<MenuItem value="NO">No</MenuItem>
		</TextField> */}









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