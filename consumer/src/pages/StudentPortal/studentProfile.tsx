import React, { useState } from 'react'
import { connect } from 'react-redux'
import { saveStudentProfile } from '../../actions'
import { RouteComponentProps } from 'react-router'

type P = {
	activeStudent: RootReducerState["activeStudent"]
	saveStudentProfile: (profile: ILMXStudent) => any
} & RouteComponentProps

const StudentProfile: React.FC<P> = ({ saveStudentProfile, activeStudent, history }) => {

	const [name, setName] = useState(activeStudent && activeStudent.name || "")
	const [grade, setGrade] = useState(activeStudent && activeStudent.grade || "")
	const [phone, setPhone] = useState(activeStudent && activeStudent.phone || "")

	const onSave = () => {

		if (name === "" || grade === "" || phone === "") {
			alert("Please input All Information to Proceed")
			return
		}

		saveStudentProfile({
			name,
			grade,
			phone
		})

		setTimeout(() => {
			history.push("/library")
		}, 300)
	}
	const onLogout = () => {

		localStorage.removeItem("auth")
		localStorage.removeItem("activeStudent")
		localStorage.removeItem("sync_state")

		window.history.pushState(undefined, '', '/')
		window.location.reload()
	}

	return <div className="student">
		<div className="form">
			<div className="title">Student Information</div>
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

		</div>
	</div>
}
export default connect((state: RootReducerState) => ({
	activeStudent: state.activeStudent,
}), (dispatch: Function) => ({
	saveStudentProfile: (profile: ILMXStudent) => dispatch(saveStudentProfile(profile))
}))(StudentProfile)
