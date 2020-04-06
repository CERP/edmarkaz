import React, { useEffect, useState } from 'react'
import { getLessons } from '../../actions';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import LoadingIcon from '../../icons/load.svg'
import UrduIcon from '../../icons/urdu.png'
import ScienceIcon from '../../icons/science.png'
import BioIcon from '../../icons/biology.png'
import MathIcon from '../../icons/math.png'
import ChemistryIcon from '../../icons/chemistry.png'
import EnglishIcon from '../../icons/english.png'
import PhysicsIcon from '../../icons/physics.png'
import MiscIcon from '../../icons/misc.png'

interface P {
	lessons: RootReducerState["lessons"]["db"]
	lesson_loading: RootReducerState["lessons"]["loading"]
	getLessons: () => void
}
const StudentPortalOptions: React.FC<P> = ({ getLessons, lessons, lesson_loading }) => {

	useEffect(() => {
		getLessons()
	}, [])

	const [medium, setMedium] = useState("");
	const [grade, setGrade] = useState("");

	const getSubjectIcon = (subject: string) => {
		switch (subject) {
			case "Urdu":
				return UrduIcon
			case "English":
				return EnglishIcon
			case "Math":
				return MathIcon
			case "General Science":
				return PhysicsIcon
			case "General Knowledge":
				return ScienceIcon
			default:
				return MiscIcon
		}
	}

	return lesson_loading ? <div className="loading">
		<img className="icon" src={LoadingIcon} />
		<div className="text">Loading</div>
	</div> : <div className="student-portal-op">
			<div className="row">
				<div className="title">Select language of Instruction</div>
				{
					medium === "" ? <div className="content">
						{
							Object.keys(lessons)
								.map(m => {
									return <div className="circle" key={m} onClick={() => setMedium(m)}>{m}</div>
								})
						}
					</div> : <div className="content selected">
							<div className="circle bg-yellow">Urdu</div>
							<div style={{ textDecoration: "underline", color: "blue" }} onClick={(e) => setMedium("")}>Change Medium</div>
						</div>
				}
			</div>
			{medium && <div className="row">
				<div className="title">Select Class</div>
				{
					grade === "" ? <div className="content">
						{lessons[medium]["Preschool"] && <div className="oval" onClick={(e) => setGrade("Preschool")}>Preschool</div>}
						{lessons[medium]["KG"] && <div className="oval" onClick={(e) => setGrade("KG")}>KG</div>}
						{
							Object.keys(lessons[medium])
								.filter(g => g !== "Preschool" && g !== "KG")
								.sort((a, b) => parseFloat(a) - parseFloat(b))
								.map(g => {
									return <div className={grade === g ? "bg-blue oval " : "oval"} key={g} onClick={(e) => setGrade(g)}>{`Class ${g}`}</div>
								})
						}
					</div> : <div className="content selected">
							<div className="bg-blue oval">{grade !== "Preschool" && grade !== "KG" ? `Class ${grade}` : grade}</div>
							<div style={{ textDecoration: "underline", color: "blue" }} onClick={(e) => setGrade("")}>Change Class</div>
						</div>
				}
			</div>}
			{grade && <div className="row">
				<div className="title">Select Subject</div>
				<div className="content">
					{
						Object.keys(lessons["Urdu"][grade])
							.map(s => {
								return <Link
									to={`/library/${medium}/${grade}/${s}`}
									className="square subject"
									style={{
										backgroundImage: `url(${getSubjectIcon(s)})`
									}}
									key={s}>{s}</Link>
							})
					}
				</div>

			</div>}
		</div>
}

export default connect((state: RootReducerState) => ({
	lessons: state.lessons.db,
	lesson_loading: state.lessons.loading
}), (dispatch: Function) => ({
	getLessons: () => dispatch(getLessons())
}))(StudentPortalOptions)