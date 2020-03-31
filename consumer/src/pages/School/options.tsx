import React, { useEffect, useState } from 'react'
import { getLessons } from '../../actions';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import LoadingIcon from '../../icons/load.svg'

interface P {
	lessons: RootReducerState["lessons"]["db"]
	lesson_loading: RootReducerState["lessons"]["loading"]
	getLessons: () => void
}
const StudentPortalOptions: React.FC<P> = ({ getLessons, lessons, lesson_loading }) => {

	useEffect(() => {
		getLessons()
	}, [])

	const [medium, setMedium] = useState("Urdu");
	const [grade, setGrade] = useState("");
	const [subject, setSubject] = useState("");
	const showLessons = grade !== "" && subject !== ""

	return lesson_loading ? <div className="loading">
		<img className="icon" src={LoadingIcon} />
		<div className="text">Loading</div>
	</div> : <div className="student-portal-op">
			{/* <div className="row">
			<div className="title">Select language of Instruction</div>
			<div className="content">
				<div
					className={medium === "English" ? "circle bg-yellow" : "circle"}
					onClick={() => setMedium("English")}>English</div>
				<div
					className={medium === "Urdu" ? "circle bg-yellow" : "circle"}
					onClick={() => setMedium("Urdu")}>Urdu</div>
			</div>
		</div> */}
			<div className="row">
				<div className="title">Select Class/Grade</div>
				{
					grade === "" ? <div className="content">
						{
							Object.keys(lessons["Urdu"] || {})
								.sort((a, b) => parseFloat(a) - parseFloat(b))
								.map(g => {
									return <div className={grade === g ? "bg-blue oval " : "oval"} key={g} onClick={(e) => setGrade(g)}>{`Class ${g}`}</div>
								})
						}
					</div> : <div className="content selected">
							<div className="bg-blue oval">{`Class ${grade}`}</div>
							<div style={{ textDecoration: "underline", color: "blue" }} onClick={(e) => setGrade("")}>Change</div>
						</div>
				}
			</div>
			{grade && <div className="row">
				<div className="title">Select Subject</div>
				{
					subject === "" ? <div className="content">
						{
							Object.keys(lessons["Urdu"][grade])
								.map(s => {
									return <div className={subject === s ? "bg-bluish square " : "square"} key={s} onClick={() => setSubject(s)}>{s}</div>
								})
						}
					</div> : <div className="content selected">
							<div className="bg-bluish square">{subject}</div>
							<div style={{ textDecoration: "underline", color: "blue" }} onClick={(e) => setSubject("")}>Change</div>
						</div>
				}
				{
					showLessons && <Link to={`/library/${medium}/${grade}/${subject}`} className="next-button">Find Resources</Link>
				}
			</div>}
		</div>
}

export default connect((state: RootReducerState) => ({
	lessons: state.lessons.db,
	lesson_loading: state.lessons.loading
}), (dispatch: Function) => ({
	getLessons: () => dispatch(getLessons())
}))(StudentPortalOptions)