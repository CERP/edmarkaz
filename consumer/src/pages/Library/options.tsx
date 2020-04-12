import React, { useEffect, useState } from 'react'
import { getLessons } from '../../actions';
import { connect } from 'react-redux';
import { Link, Redirect, RouteComponentProps } from 'react-router-dom';
import LoadingIcon from '../../icons/load.svg'
import { getIconsFromSubject } from '../../utils/getIconsFromSubject';


interface P {
	lessons: RootReducerState["lessons"]["db"]
	lesson_loading: RootReducerState["lessons"]["loading"]
	getLessons: () => void
}

interface Routeinfo {
	medium: string
}

type Props = P & RouteComponentProps<Routeinfo>
const StudentPortalOptions: React.FC<Props> = ({ getLessons, lessons, lesson_loading, match }) => {

	useEffect(() => {
		getLessons()
	}, [])

	const medium = match.params.medium
	const [grade, setGrade] = useState("");

	return lesson_loading ? <div className="loading">
		<img className="icon" src={LoadingIcon} />
		<div className="text">Loading</div>
	</div> : <div className="student-portal-op">
			<div className="row">
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
			</div>
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
										backgroundImage: `url(${getIconsFromSubject(s)})`
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