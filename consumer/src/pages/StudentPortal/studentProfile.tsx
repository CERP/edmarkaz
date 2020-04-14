import React, { useState } from 'react'
import { connect } from 'react-redux'
import { saveStudentProfile } from '../../actions'
import { RouteComponentProps } from 'react-router'
import { Paper, Typography, Button } from '@material-ui/core'

type P = {
	activeStudent: RootReducerState["activeStudent"]
	school: RootReducerState["sync_state"]["profile"]
	saveStudentProfile: (profile: ILMXStudent) => any
} & RouteComponentProps

const StudentProfile: React.FC<P> = ({ saveStudentProfile, activeStudent, history, school }) => {

	// const [name, setName] = useState(activeStudent && activeStudent.name || "")
	// const [grade, setGrade] = useState(activeStudent && activeStudent.grade || "")
	// const [phone, setPhone] = useState(activeStudent && activeStudent.phone || "")

	// const onSave = () => {

	// 	if (name === "" || grade === "" || phone === "") {
	// 		alert("Please input All Information to Proceed")
	// 		return
	// 	}

	// 	saveStudentProfile({
	// 		name,
	// 		grade,
	// 		phone
	// 	})

	// 	setTimeout(() => {
	// 		history.push("/library")
	// 	}, 300)
	// }
	const onLogout = () => {

		localStorage.removeItem("auth")
		//localStorage.removeItem("activeStudent")
		localStorage.removeItem("sync_state")
		localStorage.removeItem("student-welcome")

		window.history.pushState(undefined, '', '/')
		window.location.reload()
	}
	return <div className="student">
		<div className="form">

			<div className="title">School Information</div>
			<Paper style={{
				height: "fit-content",
				padding: "20px 0px",
				margin: "10px 0px"
			}}>
				<Typography
					variant="h4"
					align="center"
					style={{
						textTransform: "capitalize"
					}}
				>
					{school.school_name || ""}
				</Typography>
			</Paper>
			<Button
				onClick={onLogout}
				variant="contained"
				color="secondary"
				style={{
					width: "100%"
				}}
			>
				Logout
			</Button>

			{/* <div className="title">Student Information</div>
			<div className="row">
				<label>Name</label>
				<input type="text" value={name} placeholder="Your Name" onChange={(e) => setName(e.target.value)} />
			</div>
			<div className="row">
				<label>Phone</label>
				<input type="number" value={phone} placeholder="Phone" onChange={(e) => setPhone(e.target.value)} />
			</div>
			<div className="row">
				<label>Class</label>
				<input type="text" value={grade} placeholder="Your Class" onChange={(e) => setGrade(e.target.value)} />
			</div>
			{
				activeStudent === undefined ?
					<div className="button blue" onClick={() => onSave()}>Save</div>
					: <div className="button" style={{ backgroundColor: "#f05967" }} onClick={() => onLogout()}>Logout</div>
			}
		*/}
		</div>
	</div>
}
export default connect((state: RootReducerState) => ({
	activeStudent: state.activeStudent,
	school: state.sync_state.profile
}), (dispatch: Function) => ({
	saveStudentProfile: (profile: ILMXStudent) => dispatch(saveStudentProfile(profile))
}))(StudentProfile)
